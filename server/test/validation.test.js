import assert from 'node:assert/strict';
import test from 'node:test';
import { registerSchema } from '../src/validations/auth.js';
import { createPollSchema } from '../src/validations/poll.js';
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
