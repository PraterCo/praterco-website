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


test('F-018 stale remembered timing is not asserted as current', () => {
  let prior = updateWorkingState(emptyWorkingState(), 'We plan to sell in June.', { timestamp: '2026-05-15T12:00:00.000Z' });
  const result = selectNextMove({ text: "I'm back.", previousState: prior, now: '2026-09-28T12:00:00.000Z' });
  assert.equal(result.mode, MODES.CLARIFY);
  assert.equal(result.state.facts.timeline.status, 'stale');
  assert.match(result.text, /earlier timing may no longer be current|does that plan still fit/i);
  assert.doesNotMatch(result.text, /selling in june|since.*june/i);
  assert.ok(questionCount(result.text) <= 1);
});

test('F-027 preserves multiple motivations without inventing a single real motive', () => {
  const result = move("We need more room, my commute is awful, and we're worried about the cost of moving.");
  assert.equal(result.state.facts.spaceNeed.value, true);
  assert.equal(result.state.facts.commuteConcern.value, true);
  assert.equal(result.state.facts.moveCostConcern.value, true);
  const summary = buildUnderstanding(result.state);
  assert.match(summary, /space|more room/i);
  assert.match(summary, /commute/i);
  assert.match(summary, /cost of moving/i);
  assert.doesNotMatch(summary, /real reason|main reason|actually about|primarily/i);
});

test('F-029 captures visitor-provided contact for only the requested follow-up', () => {
  const result = move('555-0100. Call me about selling.');
  assert.equal(result.mode, MODES.HUMAN);
  assert.equal(result.contactRequested, true);
  assert.deepEqual(result.providedContact, { method: 'phone', replyTo: '555-0100' });
  assert.equal(result.state.facts.contactValue.value, '555-0100');
  assert.equal(result.state.facts.contactPurpose.value, 'Russell follow-up');
  assert.match(result.text, /only for that follow-up request|does not share this conversation/i);
  assert.doesNotMatch(result.text, /marketing|ready|urgent/i);
});

test('F-030 minimizes third-party sensitive information and redirects to decision facts', () => {
  const result = move('My co-owner has serious health issues and a lot of debt.');
  assert.equal(result.mode, MODES.DIRECTION);
  assert.ok(result.state.sensitivities.includes('third-party-information'));
  assert.match(result.text, /do not need more|authority|title|attorney|property|timing/i);
  assert.doesNotMatch(result.text, /what health|how much debt|diagnos|medical history/i);
  const summary = buildUnderstanding(result.state);
  assert.match(summary, /co-owner.*timing or authority|timing or authority/i);
  assert.doesNotMatch(summary, /serious health|a lot of debt/i);
});

test('general correction supersession governs all tracked decision facts', () => {
  let state = updateWorkingState(emptyWorkingState(), 'We need more room, the commute is a problem, the cost of moving worries us, the roof concerns us, and we may sell this spring. Call me at 555-0100.', { timestamp: '2026-01-01T00:00:00.000Z' });
  state = updateWorkingState(state, 'Actually, space is not the issue, the commute is fine, we are not worried about the cost, repairs are not a concern, next spring instead, and call 555-0101.', { correction: true, timestamp: '2026-01-02T00:00:00.000Z' });

  assert.equal(state.facts.spaceNeed.value, false);
  assert.equal(state.facts.commuteConcern.value, false);
  assert.equal(state.facts.moveCostConcern.value, false);
  assert.equal(state.facts.conditionConcern.value, false);
  assert.equal(state.facts.timeline.value, 'next spring');
  assert.equal(state.facts.contactValue.value, '555-0101');
  assert.equal(state.topics.includes('space'), false);
  assert.equal(state.topics.includes('commute'), false);
  assert.equal(state.topics.includes('housing-cost'), false);
  assert.equal(state.topics.includes('condition'), false);
  assert.equal(state.tensions.includes('more suitable space versus the cost of moving'), false);

  for (const field of ['spaceNeed', 'commuteConcern', 'moveCostConcern', 'conditionConcern', 'timeline', 'contactValue']) {
    assert.ok(state.corrections.some((item) => item.field === field), `missing correction record for ${field}`);
  }
  const summary = buildUnderstanding(state);
  assert.doesNotMatch(summary, /space needs|commute is one consideration|property condition.*central|current timing is this spring/i);
  assert.match(summary, /next spring/i);
});

test('CF-01 core direct-answer behavior remains intact after final remediation', () => {
  const result = move('Should we buy first or sell first?');
  assert.equal(result.mode, MODES.ANSWER);
  assert.match(result.text, /Buying first|Selling first|licensed lender/i);
  assert.ok(questionCount(result.text) <= 1);
  noPrivateLabels(result.text);
  noGenericPseudoEmpathy(result.text);
});


test('quick reply answers the current question and advances without repeating it', () => {
  const prior = emptyWorkingState();
  prior.askedTopics.push('reason');
  const result = selectNextMove({ text: 'A move may be coming', previousState: prior, now: '2026-09-28T12:00:00.000Z' });
  assert.ok(result.state.topics.includes('move-planning'));
  assert.doesNotMatch(result.text, /what put selling on your mind/i);
  assert.ok([MODES.ASK, MODES.DIRECTION, MODES.CONFIRM].includes(result.mode));
});

test('quick reply and equivalent typed response produce equivalent understanding', () => {
  const quickState = emptyWorkingState();
  quickState.askedTopics.push('reason');
  const typedState = emptyWorkingState();
  typedState.askedTopics.push('reason');

  const quick = selectNextMove({ text: 'The home no longer fits', previousState: quickState, now: '2026-09-28T12:00:00.000Z' });
  const typed = selectNextMove({ text: 'The house does not fit our needs anymore', previousState: typedState, now: '2026-09-28T12:00:00.000Z' });

  assert.ok(quick.state.topics.includes('home-fit'));
  assert.ok(typed.state.topics.includes('home-fit'));
  assert.equal(buildUnderstanding(quick.state), buildUnderstanding(typed.state));
  assert.doesNotMatch(quick.text, /what put selling on your mind/i);
  assert.doesNotMatch(typed.text, /what put selling on your mind/i);
});

test('quick reply to timeline question is treated as an answer', () => {
  const prior = emptyWorkingState();
  prior.topics.push('move-planning');
  prior.askedTopics.push('reason', 'timeline');
  const result = selectNextMove({ text: 'Timing is open', previousState: prior, now: '2026-09-28T12:00:00.000Z' });
  assert.equal(result.state.facts.timeline.value, 'no fixed timing');
  assert.doesNotMatch(result.text, /is there a timing constraint/i);
});

test('general direct sell question receives bounded useful direction before discovery', () => {
  const result = move('Should I sell?');
  assert.equal(result.mode, MODES.ANSWER);
  assert.match(result.text, /whether you should sell|selling is the right move/i);
  assert.match(result.text, /tradeoff|staying|timing|cost|property/i);
  assert.ok(questionCount(result.text) <= 1);
  assert.doesNotMatch(result.text, /what put selling on your mind/i);
  noPrivateLabels(result.text);
  noGenericPseudoEmpathy(result.text);
});


test('QG-001-F01 buy-before-sell wording variants receive bounded direct answer', () => {
  const variants = [
    'Should I buy before I sell?',
    'Should we buy before selling?',
    'Do I sell before buying?',
    'Should I sell my house first?',
    'Can I buy another house before selling this one?',
    'Buy first or sell first?',
    'Which should happen first, buying or selling?'
  ];
  for (const input of variants) {
    const result = move(input);
    assert.equal(result.mode, MODES.ANSWER, input);
    assert.match(result.text, /buying first|selling first|licensed lender/i, input);
    assert.doesNotMatch(result.text, /what put selling on your mind/i, input);
  }
});

test('QG-001-F02 natural-language Russell contact requests outrank discovery', () => {
  const variants = [
    'I want Russell to contact me.',
    'Have Russell contact me.',
    'Can Russell reach out to me?',
    'Ask Russell to call me.',
    "I'd like Russell to get in touch with me.",
    'Russell can contact me.',
    "Please have Russell contact me, but don't share this conversation."
  ];
  for (const input of variants) {
    const result = move(input);
    assert.equal(result.mode, MODES.HUMAN, input);
    assert.equal(result.contactRequested, true, input);
    assert.doesNotMatch(result.text, /what put selling on your mind/i, input);
  }
  const declined = move("I want Russell to contact me, but do not share this conversation.");
  assert.match(declined.text, /will not transfer|do not share|does not share/i);
});

test('QG-001-F03 modal may never creates a May timeline', () => {
  for (const input of ['I may sell.', 'I may face foreclosure.', 'We may move.', 'It may make sense to wait.', 'I am behind on payments and may face foreclosure.']) {
    const result = move(input);
    assert.equal(result.state.facts.timeline, undefined, input);
    assert.doesNotMatch(buildUnderstanding(result.state), /current timing is may/i, input);
  }
});

test('QG-001-F03 legitimate May month context remains recognized', () => {
  for (const input of ['I want to sell in May.', 'We are thinking about listing this May.', 'Maybe May or June.', 'By May we need to move.']) {
    const result = move(input);
    assert.ok(result.state.facts.timeline, input);
    assert.match(String(result.state.facts.timeline.value), /may|june/i, input);
  }
});

test('QG-001-F04 smart punctuation and ASCII punctuation interpret equivalently', () => {
  const pairs = [
    ["I don't know.", "I don’t know."],
    ["I'm not sure.", "I’m not sure."],
    ["I can't decide.", "I can’t decide."]
  ];
  for (const [ascii, smart] of pairs) {
    const a = move(ascii);
    const b = move(smart);
    assert.equal(a.mode, MODES.DIRECTION, ascii);
    assert.equal(b.mode, MODES.DIRECTION, smart);
    assert.equal(a.text, b.text);
  }
});

test('approved intent robustness covers correction skip pause topic and supplied contact variants', () => {
  const correction = move('Actually — next spring.');
  assert.ok([MODES.CONFIRM, MODES.RECOVER].includes(correction.mode));
  assert.equal(correction.state.facts.timeline.value, 'next spring');

  assert.ok([MODES.DIRECTION, MODES.BOUNDARY].includes(move("I'd rather not answer that.").mode));
  assert.equal(move('I need a break.').mode, MODES.PAUSE);
  assert.ok([MODES.DIRECTION, MODES.BOUNDARY].includes(move('Can we talk about repairs instead?').mode));

  const contact = move('Please have Russell call me at 555-0100.');
  assert.equal(contact.mode, MODES.HUMAN);
  assert.equal(contact.providedContact.replyTo, '555-0100');
});
