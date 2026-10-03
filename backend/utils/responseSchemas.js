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
