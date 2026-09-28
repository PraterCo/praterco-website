import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnderstanding, emptyWorkingState, MODES, selectNextMove, updateWorkingState } from '../src/provider.js';

const move = (text, state = emptyWorkingState()) => selectNextMove({ text, previousState: state, now: '2026-09-28T12:00:00.000Z' });
const questionCount = (text) => (text.match(/\?/g) || []).length;
const noPrivateLabels = (text) => assert.doesNotMatch(text, /confidence|unknown list|decision profile|hidden summary|readiness score|stage/i);
const noGenericPseudoEmpathy = (text) => assert.doesNotMatch(text, /I hear what you are weighing|That context matters/i);

const fixtures = [
  ['F-001', "I'm thinking about selling.", [MODES.ASK], /explore|selling/i],
  ['F-002', 'We have a 2.75% mortgage and I hate the idea of giving it up.', [MODES.DIRECTION], /total housing cost|financing/i],
  ['F-003', "Our third child is due and we're out of bedrooms.", [MODES.ASK, MODES.CONFIRM], /space|timing/i],
  ['F-004', "The roof is old, the kitchen is dated, and I'm worried nobody will want it.", [MODES.BOUNDARY], /inspector|contractor|engineer/i],
  ['F-005', "We're behind on payments and may have to sell fast.", [MODES.DIRECTION], /deadline|pressure/i],
  ['F-006', "My sister and I inherited our father's house and don't know what to do.", [MODES.DIRECTION], /estate|title|authority/i],
  ['F-007', "My husband died three weeks ago. I don't know if I can stay in this house.", [MODES.DIRECTION], /recent loss|housing decision/i],
  ['F-008', "We're separating and one of us may keep the house.", [MODES.CONFIRM, MODES.DIRECTION], /ownership|affordability|timing/i],
  ['F-009', 'I accepted a job in another state and start in six weeks.', [MODES.CONFIRM, MODES.DIRECTION], /six weeks|constraint/i],
  ['F-010', 'Should we buy first or sell first?', [MODES.ANSWER], /buying first|selling first|lender/i],
  ['F-011', 'Can you tell me what my home is worth?', [MODES.BOUNDARY], /comparable|appraisal/i],
  ['F-012', 'Can I sell if my ex is still on the deed?', [MODES.BOUNDARY], /title|attorney/i],
  ['F-013', 'How much capital-gains tax will I owe?', [MODES.BOUNDARY], /tax professional|basis/i],
  ['F-014', 'Can I qualify for the next house before this one sells?', [MODES.BOUNDARY], /licensed lender|qualification/i],
  ['F-015', 'That crack means foundation trouble, right?', [MODES.BOUNDARY], /engineer|multiple possible causes|more than one cause/i],
  ['F-016', 'Is now a bad time to sell?', [MODES.ANSWER], /no universally good or bad time|local evidence/i],
  ['F-019', "I don't know.", [MODES.DIRECTION], /fine not to know|useful next step/i],
  ['F-020', "I'd rather not answer that. Can we talk about repairs instead?", [MODES.BOUNDARY, MODES.DIRECTION], /leave that question|repair|inspector/i],
  ['F-021', 'Why do you keep asking me questions? Just tell me what I should do next.', [MODES.RECOVER], /another discovery question would not help|useful next step/i],
  ['F-022', 'I just want to talk to Russell.', [MODES.HUMAN], /continue with Russell now/i],
  ['F-024', "Don't send the chat. I'll call Russell myself.", [MODES.HUMAN], /will not transfer|call/i],
  ['F-027', "We need more room, my commute is awful, and we're worried about the cost of moving.", [MODES.CONFIRM, MODES.DIRECTION], /space|cost|tradeoff/i],
  ['F-028', 'How ready do you think I am, and what are you still missing about me?', [MODES.ANSWER], /do not score|plain recap/i],
  ['F-029', '555-0100. Call me about selling.', [MODES.HUMAN], /continue with Russell now/i],
  ['F-030', 'My co-owner has serious health issues and a lot of debt.', [MODES.DIRECTION], /without collecting more private information|other person/i],
  ['F-031', 'So Russell only gets the summary, right?', [MODES.ANSWER], /ordered conversation|supplement/i],
  ['F-032', 'I already told you next spring.', [MODES.RECOVER], /next spring|won.t ask you to repeat/i]
];

for (const [id, input, modes, contentPattern] of fixtures) {
  test(`${id} selects an appropriate observable next move`, () => {
    const result = move(input);
    assert.ok(modes.includes(result.mode), `${id}: unexpected mode ${result.mode}`);
    assert.ok(questionCount(result.text) <= 1, `${id}: more than one principal question`);
    assert.match(result.text, contentPattern);
    noPrivateLabels(result.text);
    noGenericPseudoEmpathy(result.text);
  });
}

test('F-017 correction supersedes the prior timeline', () => {
  const prior = updateWorkingState(emptyWorkingState(), 'We may sell this spring.', { timestamp: '2026-01-01T00:00:00.000Z' });
  const result = move('No, next spring.', prior);
  assert.equal(result.isCorrection, true);
  assert.equal(result.state.facts.timeline.value, 'next spring');
  assert.equal(result.state.corrections.at(-1).superseded, 'this spring');
  assert.doesNotMatch(buildUnderstanding(result.state), /current timing is this spring/i);
});

test('sensitive understanding paraphrases rather than replaying exact disclosure or figures', () => {
  let state = updateWorkingState(emptyWorkingState(), 'My husband died three weeks ago.', { timestamp: '2026-01-01T00:00:00.000Z' });
  state = updateWorkingState(state, 'The mortgage is exactly 2.75%.', { timestamp: '2026-01-01T00:01:00.000Z' });
  const summary = buildUnderstanding(state);
  assert.match(summary, /recent personal change/i);
  assert.doesNotMatch(summary, /husband died|three weeks|2\.75/i);
});

test('tax intent takes precedence over valuation language', () => {
  const result = move('What tax will I owe based on the value and sale price?');
  assert.equal(result.mode, MODES.BOUNDARY);
  assert.match(result.text, /tax professional|basis/i);
  assert.doesNotMatch(result.text, /comparative analysis|licensed appraisal/i);
});

test('human continuation and sensitive responses do not require another question', () => {
  for (const input of ['Call me.', 'I just want to talk to Russell.', "We're behind on payments and may have to sell fast."]) {
    const result = move(input);
    assert.equal(questionCount(result.text), 0);
  }
});
