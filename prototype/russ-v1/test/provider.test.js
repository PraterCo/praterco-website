import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnderstanding, nextTurn } from '../src/provider.js';

test('acknowledges meaningful disclosure before one next question', () => {
  const turn = nextTurn([{ role: 'participant', content: 'I am overwhelmed because this was my parents home.' }]);
  assert.equal(turn.kind, 'question');
  assert.match(turn.text, /more tied to this than the property/i);
  assert.equal((turn.text.match(/\?/g) || []).length, 1);
});

test('answers a direct value question with a useful professional boundary', () => {
  const turn = nextTurn([{ role: 'participant', content: 'What is my house worth?' }]);
  assert.match(turn.text, /factors that shape a likely market range/i);
  assert.match(turn.text, /should not give you a definitive value/i);
});

test('understanding uses recent participant context without diagnostic labels', () => {
  const result = buildUnderstanding([
    { content: 'We may move this summer.' },
    { content: 'A calm process matters most.' },
    { content: 'We would rather avoid unnecessary repairs.' }
  ]);
  assert.match(result, /calm process/i);
  assert.doesNotMatch(result, /score|readiness|profile|confidence|unknown/i);
});
