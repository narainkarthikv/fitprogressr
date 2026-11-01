const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const userSchema = {
  type: 'object',
  required: ['id', 'username', 'email', 'role'],
  properties: {
    id: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { enum: ['user', 'admin'] },
    xp: { type: 'number' },
    totalDays: { type: 'number' },
    dayCheck: { type: 'array', items: { type: 'boolean' } },
    lastActiveDate: { type: ['string', 'null'] },
    streakCount: { type: 'number' },
  },
  additionalProperties: false,
};

const exerciseSchema = {
  type: 'object',
  required: ['description', 'duration', 'exerciseCheck'],
  properties: {
    _id: { type: 'string' },
    description: { type: 'string' },
    duration: { type: 'number', exclusiveMinimum: 0 },
    exerciseCheck: { type: 'boolean' },
    date: { type: 'string', format: 'date-time' },
  },
  additionalProperties: true,
};

const trackedExerciseSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    date: { type: ['string', 'null'] },
    totalExercises: { type: ['number', 'null'] },
  },
  additionalProperties: true,
};

const exerciseDocumentSchema = {
  type: 'object',
  required: ['Exercises', 'trackExercises'],
  properties: {
    _id: { type: 'string' },
    userId: { type: 'string' },
    Exercises: { type: 'array', items: exerciseSchema },
    trackExercises: { type: 'array', items: trackedExerciseSchema },
  },
  additionalProperties: true,
};

const goalSchema = {
  type: 'object',
  required: ['_id', 'userId', 'goalType', 'target', 'progress', 'startDate', 'endDate'],
  properties: {
    _id: { type: 'string' },
    userId: { type: 'string' },
    goalType: { enum: ['workout_count', 'exercise_duration'] },
    target: { type: 'number', exclusiveMinimum: 0 },
    progress: { type: 'number', minimum: 0 },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  additionalProperties: true,
};

const messageSchema = {
  type: 'object',
  required: ['message'],
  properties: { message: { type: 'string' } },
  additionalProperties: true,
};

const errorSchema = {
  type: 'object',
  anyOf: [{ required: ['error'] }, { required: ['message'] }],
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    timestamp: { type: 'string' },
    status: { type: 'string' },
  },
  additionalProperties: true,
};

const routeSchemas = new Map([
  ['POST /api/goals/:userId', {
    ...messageSchema,
    required: ['message', 'goal'],
    properties: { ...messageSchema.properties, goal: goalSchema },
  }],
  ['GET /api/goals/:userId', { type: 'array', items: goalSchema }],
  ['GET /api/goals/:userId/:goalId', goalSchema],
  ['PUT /api/goals/:userId/:goalId', {
    ...messageSchema,
    required: ['message', 'goal'],
    properties: { ...messageSchema.properties, goal: goalSchema },
  }],

  ['GET /api/health/', {
    type: 'object', required: ['status', 'uptime', 'timestamp'],
    properties: { status: { type: 'string' }, uptime: { type: 'number' }, timestamp: { type: 'string' } },
  }],
  ['GET /api/exercises/', { type: 'array', items: exerciseDocumentSchema }],
  ['GET /api/exercises/:userId/exercises_list', exerciseDocumentSchema],
  ['POST /api/exercises/:userId/add', {
    ...messageSchema,
    required: ['message', 'newExercise'],
    properties: { ...messageSchema.properties, newExercise: exerciseSchema },
  }],
  ['POST /api/exercises/:userId/track-exercise', {
    ...messageSchema,
    required: ['message', 'data'],
    properties: { ...messageSchema.properties, data: { type: 'array', items: trackedExerciseSchema } },
  }],
  ['GET /api/exercises/:userId/data/:month', {
    type: 'array', items: {
      type: 'object', required: ['date', 'count'],
      properties: { date: { type: 'string' }, count: { type: 'number' } },
    },
  }],
  ['POST /api/user/add', {
    ...messageSchema,
    required: ['message', 'user'],
    properties: { ...messageSchema.properties, user: userSchema },
  }],
  ['POST /api/user/login', {
    ...messageSchema,
    required: ['message', 'accessToken', 'refreshToken', 'user'],
    properties: {
      ...messageSchema.properties,
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      user: userSchema,
    },
  }],
  ['POST /api/user/refresh-token', {
    ...messageSchema,
    required: ['message', 'accessToken', 'refreshToken'],
    properties: { ...messageSchema.properties, accessToken: { type: 'string' }, refreshToken: { type: 'string' } },
  }],
  ['GET /api/user/streak/:userID', {
    type: 'object', required: ['dayCheck', 'streakCount'],
    properties: { dayCheck: { type: 'array', items: { type: 'boolean' } }, streakCount: { type: 'number' } },
  }],
  ['GET /api/user/', {
    type: 'array', items: {
      type: 'object', required: ['_id', 'email', 'username'],
      properties: { _id: { type: 'string' }, email: { type: 'string', format: 'email' }, username: { type: 'string' }, role: { type: 'string' } },
    },
  }],
  ['GET /api/user/:userId', userSchema],
  ['PUT /api/user/:userId/update', {
    ...messageSchema,
    required: ['message', 'user'],
    properties: { ...messageSchema.properties, user: userSchema },
  }],

  ['GET /api/user-achievements/', {
    type: 'array',
    items: {
      type: 'object',
      required: ['_id', 'userId', 'achievementId', 'earnedAt'],
      properties: {
        _id: { type: 'string' },
        userId: { type: 'string' },
        achievementId: {
          type: 'object',
          required: ['_id', 'name', 'description', 'xpReward', 'condition'],
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            xpReward: { type: 'number' },
            condition: {
              type: 'object',
              required: ['type', 'threshold'],
              properties: {
                type: { enum: ['workoutCount', 'streak'] },
                threshold: { type: 'number' },
              },
            },
          },
        },
        earnedAt: { type: 'string' },
      },
    },
  }],
  ['POST /api/workout-sessions/', workoutSessionSchema],
  ['GET /api/workout-sessions/', {
    type: 'array',
    items: workoutSessionSchema,
  }],
  ['GET /api/workout-sessions/:sessionId', workoutSessionSchema],
  ['PUT /api/workout-sessions/:sessionId', workoutSessionSchema],

  ['POST /api/user/:userId/updateTotalDays', {
    ...messageSchema,
    required: ['message', 'totalDays'],
    properties: { ...messageSchema.properties, totalDays: { type: 'number' } },
  }],
]);

const validators = new Map([...routeSchemas].map(([key, schema]) => [key, ajv.compile(schema)]));
const validateError = ajv.compile(errorSchema);

const validateApiResponse = ({ method, routePath, baseUrl, statusCode, body }) => {
  let jsonBody;
  try {
    jsonBody = JSON.parse(JSON.stringify(body));
  } catch {
    return false;
  }

  if (statusCode >= 400) return validateError(jsonBody);
  const validate = validators.get(`${method} ${baseUrl}${routePath}`);
  if (validate) return validate(jsonBody);
  return !routePath && jsonBody !== null && typeof jsonBody === 'object';
};

module.exports = { validateApiResponse };
