import assert from 'node:assert/strict';
import test from 'node:test';
import { registerSchema } from '../src/validations/auth.js';
import { createPollSchema, updatePollSchema } from '../src/validations/poll.js';
import { submitResponseSchema } from '../src/validations/response.js';

test('register schema trims and normalizes user data', () => {
  const parsed = registerSchema.parse({
    name: '  Ada Lovelace  ',
    email: '  ADA@Example.COM ',
    password: 'secret123',
  });

  assert.equal(parsed.name, 'Ada Lovelace');
  assert.equal(parsed.email, 'ada@example.com');
});

test('poll schema rejects duplicate options in the same question', () => {
  assert.throws(
    () =>
      createPollSchema.parse({
        title: 'Favorite framework',
        description: 'Pick one',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        questions: [
          {
            text: 'Which one?',
            required: true,
            options: [{ text: 'React' }, { text: 'react' }],
          },
        ],
      }),
    /Question options must be unique/
  );
});

test('poll schema normalizes optional defaults', () => {
  const parsed = createPollSchema.parse({
    title: ' Launch decision ',
    questions: [
      {
        text: ' Ship this week? ',
        options: [{ text: 'Yes' }, { text: 'No' }],
      },
    ],
  });

  assert.equal(parsed.title, 'Launch decision');
  assert.equal(parsed.allowAnonymousResponses, true);
  assert.equal(parsed.expiresAt, null);
  assert.equal(parsed.questions[0].required, false);
});

test('response schema rejects malformed object ids', () => {
  assert.throws(
    () =>
      submitResponseSchema.parse({
        answers: [{ questionId: 'bad-id', selectedOption: 'also-bad' }],
      }),
    /Must be a valid MongoDB ObjectId/
  );
});

test('poll schema defaults trackIp to false', () => {
  const parsed = createPollSchema.parse({
    title: 'Test poll',
    questions: [
      {
        text: 'Favorite color?',
        options: [{ text: 'Red' }, { text: 'Blue' }],
      },
    ],
  });

  assert.equal(parsed.trackIp, false);
});

test('poll schema accepts trackIp set to true', () => {
  const parsed = createPollSchema.parse({
    title: 'Test poll',
    questions: [
      {
        text: 'Favorite color?',
        options: [{ text: 'Red' }, { text: 'Blue' }],
      },
    ],
    trackIp: true,
  });

  assert.equal(parsed.trackIp, true);
});

test('update poll schema accepts trackIp', () => {
  const parsed = updatePollSchema.parse({
    trackIp: true,
  });

  assert.equal(parsed.trackIp, true);
});

test('update poll schema accepts trackIp set to false', () => {
  const parsed = updatePollSchema.parse({
    trackIp: false,
  });

  assert.equal(parsed.trackIp, false);
});

test('poll schema accepts all new fields together', () => {
  const parsed = createPollSchema.parse({
    title: 'Comprehensive test',
    description: 'Testing all fields',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: [
      {
        text: 'How are you?',
        options: [{ text: 'Good' }, { text: 'Great' }],
        required: true,
      },
    ],
    allowAnonymousResponses: false,
    trackIp: true,
  });

  assert.equal(parsed.trackIp, true);
  assert.equal(parsed.allowAnonymousResponses, false);
  assert.ok(parsed.expiresAt instanceof Date);
  assert.equal(parsed.questions.length, 1);
});
