const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateUserPayload,
  validateProfilePayload,
  validateExercisePayload,
  validateMonth,
} = require('../utils/validators');
const { validateApiResponse } = require('../utils/responseSchemas');
const createRateLimit = require('../middleware/rateLimit');
const { sanitizePlainText } = require('../utils/sanitize');

test('validates registration fields and password complexity', () => {
  assert.equal(validateUserPayload({
    username: 'runner',
    email: 'runner@example.com',
    password: 'StrongPass1!',
  }), null);
  assert.match(validateUserPayload({
    username: 'ab',
    email: 'invalid',
    password: 'weak',
  }), /Username/);
  assert.match(validateUserPayload({
    username: 'runner',
    email: 'runner@example.com',
    password: 'weakpass1',
  }), /Password/);
});

test('validates profile fields before database access', () => {
  assert.equal(validateProfilePayload({
    username: 'runner',
    email: 'runner@example.com',
    currentPassword: 'OldPassword1!',
    newPassword: 'NewPassword2!',
  }), null);
  assert.match(validateProfilePayload({ username: 'x' }), /Username/);
  assert.match(validateProfilePayload({ newPassword: 'weak' }), /Current password/);
});

test('sanitizes rich input down to bounded plain text', () => {
  assert.equal(sanitizePlainText('<script>alert(1)</script>Morning <b>run</b>'), 'Morning run');
  assert.equal(sanitizePlainText('<style>body { display: none }</style>'), null);
  assert.equal(sanitizePlainText('x'.repeat(501)), null);
});

test('validates successful API payloads against route response contracts', () => {
  const validUser = {
    id: 'user-1',
    username: 'runner',
    email: 'runner@example.com',
    role: 'user',
  };
  assert.equal(validateApiResponse({
    method: 'POST',
    routePath: '/add',
    baseUrl: '/api/user',
    statusCode: 201,
    body: { message: 'User created successfully', user: validUser },
  }), true);
  assert.equal(validateApiResponse({
    method: 'GET',
    routePath: '/',
    baseUrl: '/api/health',
    statusCode: 200,
    body: { status: 'ok', uptime: 1, timestamp: new Date().toISOString() },
  }), true);
  assert.equal(validateApiResponse({
    method: 'POST',
    routePath: '/add',
    baseUrl: '/api/user',
    statusCode: 201,
    body: { message: 'User created successfully', user: { password: 'leaked' } },
  }), false);
  assert.equal(validateApiResponse({
    method: 'GET',
    routePath: '/:userId',
    baseUrl: '/api/user',
    statusCode: 404,
    body: { error: 'User not found' },
  }), true);
  assert.equal(validateApiResponse({
    method: 'GET',
    routePath: '/unregistered',
    baseUrl: '/api/user',
    statusCode: 200,
    body: { unexpected: true },
  }), false);
});

test('rate limits authentication requests and returns retry metadata', async () => {
  const records = new Map();
  const store = {
    async findOneAndUpdate(filter, update, options = {}) {
      const current = records.get(filter.key);
      if (filter.resetAt) {
        if (!current || current.resetAt <= filter.resetAt.$gt) return null;
        current.count += update.$inc.count;
        return current;
      }
      if (current && !options.upsert) return null;
      const entry = { count: 1, resetAt: update.$set.resetAt };
      records.set(filter.key, entry);
      return entry;
    },
  };
  const middleware = createRateLimit({ windowMs: 60_000, max: 2, message: 'Try later' }, store);
  let nextCalls = 0;
  const response = () => ({
    headers: {},
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  });
  const request = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } };

  await middleware(request, response(), () => { nextCalls += 1; });
  await middleware(request, response(), () => { nextCalls += 1; });
  const limitedResponse = response();
  await middleware(request, limitedResponse, () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
  assert.equal(limitedResponse.statusCode, 429);
  assert.equal(limitedResponse.body.error, 'Try later');
  assert.ok(Number(limitedResponse.headers['Retry-After']) > 0);
});

test('rejects invalid exercise fields and accepts valid month names and numbers', () => {
  assert.equal(validateExercisePayload({
    description: 'Morning run',
    duration: 30,
    exerciseCheck: true,
  }), null);
  assert.match(validateExercisePayload({
    description: '   ',
    duration: Number.NaN,
    exerciseCheck: 'yes',
  }), /Description/);
  assert.equal(validateMonth('October'), null);
  assert.equal(validateMonth('10'), null);
  assert.match(validateMonth('13'), /month/);
});
