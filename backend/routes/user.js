const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Exercise = require('../models/exercise.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/jwtAuth.js');
const { ensureAdmin, ensureSelf } = require('../middleware/accessControl');
const createRateLimit = require('../middleware/rateLimit');
const { validateUserPayload, validateLoginPayload, validateProfilePayload } = require('../utils/validators');
const { getApiErrorResponse } = require('../utils/apiErrors');
const { sanitizePlainText } = require('../utils/sanitize');
const {
  isBcryptHash,
  hashPassword,
  sanitizeUser,
} = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Try again later.',
});

const createTokenPayload = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role || 'user',
});

const createAccessToken = (user) =>
  jwt.sign(createTokenPayload(user), JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

const createRefreshToken = (user) =>
  jwt.sign(createTokenPayload(user), REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

const createAuthTokens = (user) => ({
  accessToken: createAccessToken(user),
  refreshToken: createRefreshToken(user),
});
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const verifyAndUpgradePassword = async (user, providedPassword) => {
  const storedHash = user.password;
  if (!storedHash || !providedPassword) {
    return false;
  }

  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(providedPassword, storedHash);
  }

  const isMatch = providedPassword === storedHash;
  if (isMatch) {
    user.password = await hashPassword(providedPassword);
    await user.save();
  }
  return isMatch;
};

// Create a new user
router.post('/add', authRateLimit, async (req, res) => {
  try {
    const { password } = req.body || {};
    const username = sanitizePlainText(req.body?.username, 40);
    const email = sanitizePlainText(req.body?.email, 254);
    const validationError = validateUserPayload({ username, email, password });
    if (validationError) {
      return res.status(422).json({ error: validationError });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
    if (existingUser) return res.status(409).json({ error: 'Username or email already in use' });

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username: normalizedUsername,
      xp: 0,
      totalDays: 0,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();

    const newExercise = new Exercise({
      userId: newUser._id,
      Exercises: [],
      trackExercises: [],
    });

    // Save the new exercise to the database
    try {
      await newExercise.save();
    } catch (error) {
      await User.deleteOne({ _id: newUser._id }).catch((cleanupError) => {
        console.error('Failed to clean up incomplete user registration:', cleanupError);
      });
      throw error;
    }

    res.status(201).json({ message: 'User created successfully', user: sanitizeUser(newUser) });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username or email already in use' });
    }
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// User login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const validationError = validateLoginPayload({ email, password });
    if (validationError) return res.status(422).json({ error: validationError });
    const normalizedEmail = email.trim();
    const user = await User.findOne({ email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i') });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await verifyAndUpgradePassword(user, password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await handlePasswordValid(user, res);
  } catch (error) {
    console.error('Login failed:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// Helper function to handle successful password verification
async function handlePasswordValid(user, res) {
  try {
    const today = new Date();
    const todayIndex = today.getDay();

    const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    //check if the user has already logged in today
    const isSameDay =
      lastDate &&
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear();

    if (!isSameDay) {
      //Was this user already active today? If yes, do nothing

      //1- Mark today's day of the week as true
      let newDayCheck = user.dayCheck || [false, false, false, false, false, false, false];
      const isNewWeek = todayIndex === 0; //if sunday then start fresh
      if (isNewWeek) {
        newDayCheck = [false, false, false, false, false, false, false]; // Start fresh week
      }
      newDayCheck[todayIndex] = true;

      //2-Compare last active day from the user's DB with yesterday to see if the streak continues
      const isYesterday =
        lastDate &&
        lastDate.getDate() === yesterday.getDate() &&
        lastDate.getMonth() === yesterday.getMonth() &&
        lastDate.getFullYear() === yesterday.getFullYear();

      user.streakCount = isYesterday ? user.streakCount + 1 : 1; //3- Update streak count
      user.lastActiveDate = today;
      user.dayCheck = newDayCheck;

      user.totalDays = newDayCheck.filter(Boolean).length;

      await user.save();
    }

    const { accessToken, refreshToken } = createAuthTokens(user);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login session update failed:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
}

router.post('/refresh-token', authRateLimit, async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (typeof refreshToken !== 'string' || !refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tokens = createAuthTokens(user);

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const apiError = getApiErrorResponse(error);
    return res.status(apiError.status).json(apiError.body);
  }
});

//fetch streak info
router.get('/streak/:userID', verifyToken, ensureSelf('userID'), async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await User.findById(userID);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      dayCheck: user.dayCheck,
      streakCount: user.streakCount,
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// Get all users
router.get('/', verifyToken, ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '_id email username role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// Get a user by ID
router.get('/:userId', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// Update user profile
router.put('/:userId/update', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { userId } = req.params;
  const body = req.body || {};
  const username = body.username === undefined ? undefined : sanitizePlainText(body.username, 40) ?? body.username;
  const email = body.email === undefined ? undefined : sanitizePlainText(body.email, 254) ?? body.email;
  const { currentPassword, newPassword } = body;

  const validationError = validateProfilePayload({ username, email, currentPassword, newPassword });
  if (validationError) return res.status(422).json({ error: validationError });

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username !== undefined) {
      const normalizedUsername = username.trim();
      if (normalizedUsername !== user.username) {
        const existingUser = await User.findOne({ username: normalizedUsername });
        if (existingUser) {
          return res.status(409).json({ error: 'Username already taken' });
        }
      }
      user.username = normalizedUsername;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(409).json({ error: 'Email already taken' });
        }
      }
      user.email = normalizedEmail;
    }

    if (newPassword) {
      const isPasswordValid = await verifyAndUpgradePassword(user, currentPassword);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = await hashPassword(newPassword);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

// Update totalDays
router.post('/:userId/updateTotalDays', verifyToken, ensureSelf('userId'), async (req, res) => {
  const { userId } = req.params;
  const { dayCheck } = req.body || {};
  if (!Array.isArray(dayCheck) || dayCheck.length > 7 || dayCheck.some((day) => typeof day !== 'boolean')) {
    return res.status(422).json({ error: 'dayCheck must be an array of up to 7 booleans' });
  }
  try {
    const user = await User.findById(userId);
    if (user) {
      const totalDays = dayCheck.filter(Boolean).length;
      user.totalDays = totalDays;
      await user.save();
      res.status(200).json({ message: 'TotalDays updated successfully', totalDays });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating totalDays:', error);
    const apiError = getApiErrorResponse(error);
    res.status(apiError.status).json(apiError.body);
  }
});

module.exports = router;
