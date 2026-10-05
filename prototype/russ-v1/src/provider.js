export const BEHAVIOR_VERSION = 'seller-reference-2.2.0';
export const FIXTURE_VERSION = 'private-seller-1.0.0';

export const MODES = Object.freeze({
  ACKNOWLEDGE: 'ACKNOWLEDGE', ASK: 'ASK', ANSWER: 'ANSWER', CLARIFY: 'CLARIFY',
  CONFIRM: 'CONFIRM_UNDERSTANDING', DIRECTION: 'PROVIDE_DIRECTION',
  BOUNDARY: 'PROFESSIONAL_BOUNDARY', HUMAN: 'OFFER_HUMAN_CONTINUATION',
  RECOVER: 'RECOVER_FROM_ERROR', PAUSE: 'PAUSE'
});

const clean = (value = '') => value.trim().replace(/\s+/g, ' ');
const normalizeForIntent = (value = '') => clean(value)
  .normalize('NFKC')
  .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
  .replace(/[\u201C\u201D\u2033]/g, '"')
  .replace(/[\u2013\u2014]/g, '-')
  .toLowerCase();
const has = (text, pattern) => pattern.test(normalizeForIntent(text));
const unique = (items) => [...new Set(items)];

export function emptyWorkingState() {
  return {
    version: 3, facts: {}, priorities: [], tensions: [], uncertainties: [],
    sensitivities: [], topics: [], skippedTopics: [], askedTopics: [], corrections: [],
    questionPreference: 'open', updatedAt: null
  };
}

function classify(text) {
  const lower = normalizeForIntent(text);
  return {
    human: /\b(talk|speak|connect)\s+(to|with)\s+russell\b|\b(call|text)\s+russell\b|\bi just want (to )?(talk|speak)\b|\bcall me\b|\btext me\b|\b(i want|i'd like|id like|please|can you|could you|would you)\s+russell\s+(to\s+)?(contact|call|text|reach out|get in touch)\s*(with\s+me|me)?\b|\b(have|ask)\s+russell\s+(to\s+)?(contact|call|text|reach out|get in touch)\s*(with\s+me|me)?\b|\brussell\s+can\s+(contact|call|text|reach out|get in touch)\s*(with\s+me|me)?\b/.test(lower),
    correction: /^(no[, ]|actually\b|correction\b|i meant\b)|\byou (already )?asked\b|\bi (already )?(said|told you)\b|\bnot (this|next) (spring|summer|fall|winter|year)\b/.test(lower),
    dontKnow: /\b(i don'?t know|i'?m not sure|i can'?t decide|not sure yet|no idea)\b/.test(lower),
    skip: /\b(skip|rather not answer|don'?t want to answer)\b/.test(lower),
    pause: /\b(pause|stop for now|come back later|need a break)\b/.test(lower),
    stopQuestions: /\bstop asking|why do you keep asking|no more questions|just tell me what (i|we) should do\b/.test(lower),
    changeTopic: /\b(change (the )?topic|talk about .+ instead|can we talk about)\b/.test(lower),
    frustration: /\b(frustrat|annoy|keep asking|already told|not listening)\b/.test(lower),
    returning: /^(i'?m|i am) back\b|\bback again\b|\bpicking this back up\b/.test(lower),
    direct: text.includes('?') || /^(should|can|could|do|does|is|are|will|what|how|when|where|why|which)\b/.test(lower),
    sensitive: /\b(died|death|passed away|bereave|widow|widower|separat|divorc|behind on payments|foreclos|bankrupt|inherited|inheritance|co-owner.+(health|medical|debt|financial)|coowner.+(health|medical|debt|financial))\b/.test(lower)
  };
}

function detectDomain(text) {
  const lower = normalizeForIntent(text);
  if (/capital[- ]?gains?|\btax(es)?\b|taxable|basis|exclusion/.test(lower)) return 'tax';
  if (/\bdeed\b|\btitle\b|probate|legal|court order|ex.+deed|authority to sell/.test(lower)) return 'legal';
  if (/\b(buy|buying|purchase)\b.*\b(before|first)\b.*\b(sell|selling)\b|\b(sell|selling)\b.*\b(before|first)\b.*\b(buy|buying|purchase)\b|\b(buy|buying)\s+first\b|\b(sell|selling)\s+first\b|\bwhich should happen first\b.*\b(buy|buying)\b.*\b(sell|selling)\b|\banother (house|home) before selling (this|our|my) (one|house|home)\b|\bbefore (this|our|my) (one|house|home) sells\b|two payments|bridge loan/.test(lower)) return 'buy-before-sell';
  if (/qualif|mortgage|\bloan\b|lender|interest rate|payment|financ(e|ing)/.test(lower)) return 'lending';
  if (/what.+worth|home value|house value|\bapprais|listing price|price estimate|how much.+(home|house)/.test(lower)) return 'value';
  if (/foundation|structural|engineer|\bcrack\b|roof|contractor|construction|repair|renovat|remodel/.test(lower)) return 'construction';
  if (/\brent(al|ing)?\b|investment|landlord|cash flow|cap rate|tenant/.test(lower)) return 'investment';
  if (/bad time to sell|good time to sell|market timing|\bmarket\b|sell now|wait to sell/.test(lower)) return 'market-timing';
  return null;
}

function extractTimeline(text) {
  const lower = normalizeForIntent(text);
  const patterns = [
    [/next spring/, 'next spring'], [/this spring/, 'this spring'], [/next summer/, 'next summer'], [/this summer/, 'this summer'],
    [/next fall|next autumn/, 'next fall'], [/this fall|this autumn/, 'this fall'], [/next winter/, 'next winter'], [/this winter/, 'this winter'],
    [/six weeks|6 weeks/, 'about six weeks'], [/three months|3 months/, 'about three months'], [/six months|6 months/, 'about six months'],
    [/later this year/, 'later this year'], [/next year/, 'next year'],
    [/no fixed (time|timing)|not sure when|no timeline|timing is open/, 'no fixed timing']
  ];
  for (const [pattern, value] of patterns) {
    const match = lower.match(pattern);
    if (match) return value;
  }

  const monthNames = 'january|february|march|april|may|june|july|august|september|october|november|december';
  const monthPatterns = [
    new RegExp(`\\b(?:in|this|by|around|during|for)\\s+(${monthNames})\\b`),
    new RegExp(`\\b(list|listing|sell|selling|move|moving|close|closing)\\s+(?:in|by|around|during)?\\s*(${monthNames})\\b`),
    new RegExp(`\\bmaybe\\s+(${monthNames})(?:\\s+or\\s+(${monthNames}))?\\b`)
  ];
  for (const pattern of monthPatterns) {
    const match = lower.match(pattern);
    if (match) return match[2] || match[1];
  }
  return null;
}

function extractContact(text) {
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || null;
  const phone = text.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b|\b\d{3}[\s.-]\d{4}\b/)?.[0] || null;
  if (email) return { method: 'email', value: email };
  if (phone) return { method: 'phone', value: phone };
  return null;
}

function meaningFrom(text) {
  const lower = normalizeForIntent(text);
  const topics = [], priorities = [], tensions = [], sensitivities = [], uncertainties = [], facts = {};
  const timeline = extractTimeline(text);
  if (timeline) facts.timeline = timeline;

  if (/space is not (the )?(issue|problem)|don'?t need more (room|space)|do not need more (room|space)/.test(lower)) facts.spaceNeed = false;
  else if (/third child|baby|bedroom|more room|more space|out of (room|bedrooms)/.test(lower)) facts.spaceNeed = true;
  if (/the (home|house) no longer fits|doesn'?t fit (us|our needs) anymore|does not fit (us|our needs) anymore/.test(lower)) topics.push('home-fit');
  if (/a move may be coming|may (have )?a move coming|may be moving|might be moving/.test(lower)) topics.push('move-planning');
  if (/i am just exploring|i'?m just exploring|just exploring/.test(lower)) topics.push('exploration');

  if (/commute is (fine|not an issue|not the issue)|commute isn'?t (an issue|the issue|a problem)/.test(lower)) facts.commuteConcern = false;
  else if (/\bcommute\b/.test(lower)) facts.commuteConcern = true;

  if (/cost (isn'?t|is not) (the )?(issue|problem)|not worried about the cost|affordability is not (the )?issue/.test(lower)) facts.moveCostConcern = false;
  else if (/cost of moving|afford|housing cost|mortgage|interest rate|payment/.test(lower)) facts.moveCostConcern = true;

  if (/repairs? (are|is) not (a )?concern|condition is not (the )?issue|not worried about repairs/.test(lower)) facts.conditionConcern = false;
  else if (/roof|kitchen|repair|condition|foundation|crack|dated|renovat/.test(lower)) facts.conditionConcern = true;

  const contact = extractContact(text);
  if (contact) {
    facts.contactMethod = contact.method;
    facts.contactValue = contact.value;
    facts.contactPurpose = 'Russell follow-up';
  }

  if (facts.spaceNeed === true) topics.push('space');
  if (/job|relocat|another state/.test(lower)) topics.push('relocation');
  if (facts.commuteConcern === true) topics.push('commute');
  if (facts.conditionConcern === true) topics.push('condition');
  if (facts.moveCostConcern === true) topics.push('housing-cost');
  if (/inherit/.test(lower)) { topics.push('shared-property'); sensitivities.push('inheritance'); }
  if (/died|death|passed away|widow|widower/.test(lower)) sensitivities.push('bereavement');
  if (/separat|divorc/.test(lower)) { topics.push('shared-property'); sensitivities.push('relationship-change'); }
  if (/behind on payments|foreclos|bankrupt|financial pressure|sell fast/.test(lower)) sensitivities.push('financial-pressure');
  if (/(co-owner|coowner).*(health|medical|debt|financial)/.test(lower)) sensitivities.push('third-party-information');
  if (/calm|less stress|simple process/.test(lower)) priorities.push('a calm, manageable process');
  if (/financial tradeoffs?|financial side|money side/.test(lower)) priorities.push('financial tradeoffs');
  if (/whether to move at all|whether (we|i) should move|decide whether to move/.test(lower)) priorities.push('whether to move at all');
  if (/^timing\.?$|timing matters most|focus on timing/.test(lower)) priorities.push('timing');
  if (/^property condition\.?$|focus on (the )?property condition/.test(lower)) priorities.push('property condition');
  if (/strongest result|best price|maximi/.test(lower)) priorities.push('a strong financial result');
  if (/timing|deadline|six weeks|quick|fast|soon/.test(lower)) priorities.push('control of timing');
  if (/as[- ]is|avoid repair|no repair/.test(lower)) priorities.push('limiting preparation work');
  if (/low rate|2\.75|two payments/.test(lower) && /(space|move|relocat|buy|sell)/.test(lower)) tensions.push('the benefit of the current housing cost versus the reasons to move');
  if (facts.spaceNeed === true && facts.moveCostConcern === true) tensions.push('more suitable space versus the cost of moving');
  if (facts.conditionConcern === true && /(price|worth|buyer|sell)/.test(lower)) tensions.push('preparation cost versus likely buyer and market impact');
  if (/i don'?t know|not sure|maybe|thinking|explor/.test(lower)) uncertainties.push('the decision is still taking shape');
  return { topics, priorities, tensions, sensitivities, uncertainties, facts };
}

function applyFact(state, field, value, { correction, timestamp }) {
  const prior = state.facts[field];
  if (correction && prior && prior.value !== value) {
    state.corrections.push({ field, superseded: prior.value, current: value, correctedAt: timestamp });
  }
  state.facts[field] = { value, updatedAt: timestamp, status: 'current' };
}

function timelineIsStale(fact, now) {
  if (!fact || fact.status === 'stale' || fact.value === 'no fixed timing') return fact?.status === 'stale';
  const current = new Date(now);
  const updated = new Date(fact.updatedAt || now);
  if (!Number.isFinite(current.getTime()) || !Number.isFinite(updated.getTime())) return false;
  const ageDays = (current.getTime() - updated.getTime()) / 86400000;
  const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const monthIndex = monthNames.indexOf(String(fact.value).toLowerCase());
  if (monthIndex >= 0 && current.getUTCFullYear() === updated.getUTCFullYear() && current.getUTCMonth() > monthIndex) return true;
  if (fact.value === 'about six weeks' && ageDays > 56) return true;
  if (fact.value === 'about three months' && ageDays > 110) return true;
  if (fact.value === 'about six months' && ageDays > 210) return true;
  if (fact.value === 'this spring' && current.getUTCFullYear() === updated.getUTCFullYear() && current.getUTCMonth() > 5) return true;
  if (fact.value === 'this summer' && current.getUTCFullYear() === updated.getUTCFullYear() && current.getUTCMonth() > 8) return true;
  if (fact.value === 'this fall' && current.getUTCFullYear() === updated.getUTCFullYear() && current.getUTCMonth() > 11) return true;
  if (fact.value === 'later this year' && current.getUTCFullYear() > updated.getUTCFullYear()) return true;
  return ageDays > 365;
}

export function refreshWorkingState(previous, now = new Date().toISOString()) {
  const state = structuredClone(previous || emptyWorkingState());
  if (timelineIsStale(state.facts.timeline, now)) state.facts.timeline.status = 'stale';
  return state;
}

export function updateWorkingState(previous, text, { correction = false, timestamp = new Date().toISOString() } = {}) {
  const state = structuredClone(previous || emptyWorkingState());
  const meaning = meaningFrom(text);

  for (const [field, value] of Object.entries(meaning.facts)) applyFact(state, field, value, { correction, timestamp });

  const negativeTopicFacts = [
    ['spaceNeed', 'space'],
    ['commuteConcern', 'commute'],
    ['conditionConcern', 'condition'],
    ['moveCostConcern', 'housing-cost']
  ];
  for (const [field, topic] of negativeTopicFacts) {
    if (correction && meaning.facts[field] === false) state.topics = state.topics.filter((item) => item !== topic);
  }

  state.topics = unique([...state.topics, ...meaning.topics]);
  state.priorities = unique([...state.priorities, ...meaning.priorities]);
  state.tensions = unique([...state.tensions, ...meaning.tensions]);
  state.uncertainties = unique([...state.uncertainties, ...meaning.uncertainties]);
  state.sensitivities = unique([...state.sensitivities, ...meaning.sensitivities]);

  if (correction) {
    if (meaning.facts.spaceNeed === false || meaning.facts.moveCostConcern === false) {
      state.tensions = state.tensions.filter((item) => item !== 'more suitable space versus the cost of moving');
    }
    if (meaning.facts.conditionConcern === false) {
      state.tensions = state.tensions.filter((item) => item !== 'preparation cost versus likely buyer and market impact');
    }
  }

  const signals = classify(text);
  if (signals.skip || signals.changeTopic) state.skippedTopics = unique([...state.skippedTopics, 'current-question']);
  if (signals.stopQuestions || signals.frustration) state.questionPreference = 'direction-only';
  if (signals.pause) state.questionPreference = 'paused';
  state.updatedAt = timestamp;
  return state;
}

function specificAcknowledgement(state, text) {
  const sensitivity = state.sensitivities.at(-1);
  if (sensitivity === 'bereavement') return 'You do not have to make a housing decision all at once after a recent loss.';
  if (sensitivity === 'inheritance') return 'An inherited home can involve family agreement, legal authority, property condition, and carrying costs as separate decisions.';
  if (sensitivity === 'relationship-change') return 'Ownership, affordability, timing, and any agreement between you may need to be handled as separate questions.';
  if (sensitivity === 'financial-pressure') return 'The immediate deadline matters here, and the next step should reduce risk without adding pressure or collecting details we do not need.';
  if (sensitivity === 'third-party-information') return 'A co-owner’s circumstances may affect timing or authority. We can keep the focus on the property and decision without collecting more private information about the other person.';
  const hasSpace = state.facts.spaceNeed?.value === true;
  const hasCommute = state.facts.commuteConcern?.value === true;
  const hasCost = state.facts.moveCostConcern?.value === true;
  if (hasSpace && hasCommute && hasCost) return 'You are weighing three separate things at once: space, the commute, and the cost of moving. None of those automatically decides the others.';
  if (state.tensions.includes('the benefit of the current housing cost versus the reasons to move')) return 'Keeping the benefit of your current housing cost matters, and the reason you are considering a move still needs a workable answer.';
  if (state.tensions.includes('more suitable space versus the cost of moving')) return 'The space problem is real, and so is the cost of solving it.';
  if (state.topics.includes('housing-cost') && /rate|mortgage/.test(text.toLowerCase())) return 'The current mortgage cost is a real financial advantage, so it belongs in the decision rather than being brushed aside.';
  if (state.topics.includes('space')) return 'The home is no longer matching the space your household needs, without that automatically deciding whether or when to move.';
  if (state.topics.includes('relocation') && state.facts.timeline?.status === 'current') return `The ${state.facts.timeline.value} window gives the plan a real constraint, but it does not mean you should rush into one path.`;
  if (state.topics.includes('condition')) return 'Before spending on the property, it helps to separate verified condition issues from assumptions about what buyers may expect.';
  if (/thinking about selling|just exploring|maybe sell/.test(text.toLowerCase())) return 'You can explore the decision without committing to a sale.';
  return '';
}

function boundaryResponse(domain) {
  const responses = {
    tax: 'I cannot calculate your property-specific tax from a chat. Basis, ownership, use, eligible improvements, exclusions, and jurisdiction can all affect the result. A tax professional should calculate it before you rely on a number; Russell can help organize the transaction figures they may need.',
    legal: 'I cannot determine legal authority from the deed question alone. Ownership, required signatures, and any governing agreement need review by title or escrow and, when rights are disputed, an attorney. Russell can help coordinate the property side without acting as legal counsel.',
    lending: 'I cannot determine loan qualification or available products. A licensed lender needs the actual income, debts, credit, property, and loan details. I can still help you frame the transaction choices that the lending answer would affect.',
    value: 'A defensible value opinion needs the property’s condition, location, features, and current comparable sales. I should not invent a range here. Russell can prepare a property-specific comparative analysis, while a licensed appraisal is a different service.',
    construction: 'A visible condition can have more than one cause, so I should not diagnose it or estimate a repair from a description. A qualified inspector, contractor, or engineer should identify the cause and scope. Before spending, separate verified safety or financing issues from cosmetic work.',
    investment: 'I can outline hold-versus-sell considerations, but I should not give a property-specific investment conclusion without reliable rent, expense, condition, financing, tax, and risk information. A tax or financial professional may also be needed for the parts within their scope.',
    'market-timing': 'There is no universally good or bad time to sell. The useful comparison is your reason and timing for moving, the property’s current position, and local evidence. I should not predict the market or guarantee an outcome.',
    'buy-before-sell': 'Buying first can reduce the risk of moving twice, but may create financing, two-payment, and timing exposure. Selling first can reduce financial uncertainty, but may require temporary housing or a contingent plan. A licensed lender must confirm what is actually available from your finances; the better path depends on which risk you most need to avoid.'
  };
  return responses[domain];
}

function directionForState(state) {
  if (state.sensitivities.includes('financial-pressure')) return 'Start by identifying the actual deadline from the lender or written notices, then separate immediate legal or lending questions from the property-sale plan. Russell can help with the sale side now, while the appropriate professional handles conclusions outside his role.';
  if (state.sensitivities.includes('inheritance')) return 'A useful first pass is to confirm who has authority to act, whether the decision-makers agree on the goal, and what the property costs to hold. An estate or title professional should confirm authority, and a tax professional should address property-specific tax consequences before those answers shape a sale, repair, or rent decision.';
  if (state.sensitivities.includes('relationship-change')) return 'A practical order is to establish legal and title authority, get a lender’s answer if one person may keep the home, and only then compare sale timing and property preparation. That avoids asking the market to solve an ownership question.';
  if (state.sensitivities.includes('third-party-information')) return 'Keep the decision focused on who has authority to act, whether the required decision-makers can participate, and the property or timing facts that affect a sale. Title, escrow, or an attorney should confirm legal authority; health, capacity, debt, and personal financial conclusions belong with the appropriate professionals.';
  if (state.topics.includes('condition')) return 'Before authorizing major work, document known issues and get property-specific evidence. Safety, insurability, financing, and buyer-confidence items deserve a different decision than purely cosmetic updates.';
  if (state.facts.spaceNeed?.value === true && state.facts.commuteConcern?.value === true && state.facts.moveCostConcern?.value === true) return 'A useful next step is to compare the space need, the commute, and the cost of moving side by side without treating any one of them as the real reason. The next fact to gather should be whichever could actually change that comparison.';
  if (state.tensions.length) return `One useful tradeoff to compare is ${state.tensions.at(-1)}. Then gather only the property or financing evidence that could change that comparison.`;
  if (state.facts.timeline?.status === 'current' && state.facts.timeline.value !== 'no fixed timing') return `Use the ${state.facts.timeline.value} timeline to work backward from the move, leaving room for property review, preparation choices, and a realistic market plan without assuming a guaranteed sale date.`;
  if (state.facts.timeline?.status === 'stale') return 'The earlier timing may no longer be current, so verify it before relying on it for a sale plan.';
  return 'A useful next step is to separate what is already known from what would materially change the decision, then address the smallest consequential question first. You do not need a complete selling plan to begin.';
}

export function buildUnderstanding(state) {
  const parts = [];
  const multi = state.facts.spaceNeed?.value === true && state.facts.commuteConcern?.value === true && state.facts.moveCostConcern?.value === true;
  if (state.sensitivities.includes('bereavement')) parts.push('A recent personal change has made the housing decision especially significant');
  else if (state.sensitivities.includes('inheritance')) parts.push('An inherited property involves both the home and shared decision-making');
  else if (state.sensitivities.includes('relationship-change')) parts.push('Ownership, affordability, and timing may need to be resolved separately');
  else if (state.sensitivities.includes('financial-pressure')) parts.push('There may be a time-sensitive financial reason to understand the sale options');
  else if (state.sensitivities.includes('third-party-information')) parts.push('A co-owner’s circumstances may affect timing or authority without requiring more private detail about that person');
  else if (multi) parts.push('You are weighing more space, the commute, and the cost of moving, without treating any one of them as the single reason');
  else if (state.topics.includes('relocation')) parts.push('A move is creating a real planning constraint');
  else if (state.topics.includes('commute')) parts.push('The commute is one consideration in the housing decision');
  else if (state.topics.includes('home-fit')) parts.push('The home is no longer fitting what you need from it');
  else if (state.topics.includes('move-planning')) parts.push('A possible move is part of the decision');
  else if (state.topics.includes('exploration')) parts.push('You are exploring the selling decision without committing to it');
  else if (state.topics.includes('space')) parts.push('The home may no longer fit the household’s space needs');
  else if (state.topics.includes('condition')) parts.push('Property condition and preparation are central to the decision');
  else parts.push('You are considering whether selling is the right next step');
  if (state.priorities.length) parts.push(`the priority you stated is ${state.priorities.at(-1)}`);
  if (!multi && state.tensions.length) parts.push(`one tradeoff is ${state.tensions.at(-1)}`);
  if (state.facts.timeline?.status === 'current') parts.push(`the current timing is ${state.facts.timeline.value}`);
  if (state.facts.timeline?.status === 'stale') parts.push('the earlier timing needs to be rechecked before it is used');
  if (state.uncertainties.length) parts.push('some parts of the decision are still open');
  return `${parts.join('. ')}. Is that a fair summary of what matters right now?`;
}

function shouldConfirm(state) {
  const meaningful = state.topics.length + state.priorities.length + state.tensions.length + state.sensitivities.length;
  return state.corrections.length > 0 || meaningful >= 2 || (meaningful >= 1 && Boolean(state.facts.timeline));
}

function questionForState(state) {
  if (state.facts.timeline?.status === 'stale' && state.questionPreference === 'open' && !state.askedTopics.includes('timeline-refresh')) return { text: 'The earlier timing may be out of date. Does that plan still apply, or has the timing changed?', topic: 'timeline-refresh', replies: ['It still applies', 'The timing changed', 'Timing is open'] };
  if (!state.askedTopics.includes('reason') && !state.topics.length && !state.sensitivities.length) return { text: 'What put selling on your mind?', topic: 'reason', replies: ['I am just exploring', 'A move may be coming', 'The home no longer fits'] };
  if (!state.askedTopics.includes('timeline') && !state.facts.timeline && state.questionPreference === 'open') return { text: 'Is there a timing constraint that would materially change your options, or is the timing still open?', topic: 'timeline', replies: ['Timing is open', 'Within 3 months', 'Later this year', 'Next year'] };
  if (!state.askedTopics.includes('priority') && !state.priorities.length && state.questionPreference === 'open') return { text: 'Which part of the decision would be most useful to make clearer first?', topic: 'priority', replies: ['Timing', 'Property condition', 'Financial tradeoffs', 'Whether to move at all'] };
  return null;
}

function generalSellDecisionDirection(state) {
  const known = directionForState(state);
  const hasSpecificContext = state.topics.length || state.priorities.length || state.tensions.length || state.sensitivities.length || state.facts.timeline;
  if (hasSpecificContext) return `Whether selling is the right move depends on whether it improves the situation enough to justify the financial and practical tradeoffs. Based on what you have shared, ${known.charAt(0).toLowerCase() + known.slice(1)}`;
  return 'Whether you should sell depends on what selling would solve compared with staying. A useful comparison is the reason for considering a move, timing, the cost and practicality of the next housing step, and the property’s current situation. I would not tell you to sell from this alone, but you can use those tradeoffs to identify what evidence would actually change the decision.';
}

export function selectNextMove({ text, previousState, messages = [], now = new Date().toISOString() }) {
  const content = clean(text);
  const intentText = normalizeForIntent(content);
  const signals = classify(content);
  const domain = detectDomain(content);
  const preparedState = refreshWorkingState(previousState, now);
  const hadStaleTimeline = preparedState.facts.timeline?.status === 'stale';
  const state = updateWorkingState(preparedState, content, { correction: signals.correction, timestamp: now });
  const acknowledgment = specificAcknowledgement(state, content);

  if (signals.returning && hadStaleTimeline && state.facts.timeline?.status === 'stale') return { mode: MODES.CLARIFY, state, text: 'Welcome back. The earlier timing may no longer be current, so I will not assume it still applies. Does that plan still fit, or would you rather correct it, change the topic, or start over?', quickReplies: ['It still applies', 'Correct the timing', 'Change topic', 'Start over'] };
  if (/only gets? the summary|what (will|do) (be )?shared|what do you share/.test(intentText)) return { mode: MODES.ANSWER, state, text: 'Russell would receive the ordered conversation, including corrections and any confirmed understanding. A generated summary may be included only as a supplement, not a replacement. Nothing is transferred unless you separately agree, and you can call or text without sharing the conversation.', offerHuman: true };
  if (/how ready|readiness|what are you still missing|score me|profile me/.test(intentText)) return { mode: MODES.ANSWER, state, text: 'I do not score your readiness or show a hidden profile or missing-information list. I can offer a plain recap of the decision considerations you have chosen to share and let you correct it, or help with the next useful question you choose.' };
  if (signals.direct && /\bshould (i|we) (sell|list)( (the|our|my) (home|house|property))?\b/i.test(content)) return { mode: MODES.ANSWER, state, text: generalSellDecisionDirection(state), offerHuman: false };
  if (signals.human) {
    const declined = /don'?t (send|share)|do not (send|share)|without sharing|don'?t share this conversation|do not share this conversation/.test(intentText);
    const providedContact = state.facts.contactValue?.status === 'current' ? { method: state.facts.contactMethod?.value || 'contact', replyTo: state.facts.contactValue.value } : null;
    const wantsContact = /call me|text me|russell\s+(to\s+)?(contact|call|text|reach out|get in touch)\s*(with\s+me|me)?|(?:have|ask)\s+russell\s+(to\s+)?(contact|call|text|reach out|get in touch)\s*(with\s+me|me)?|russell\s+can\s+(contact|call|text|reach out|get in touch)\s*(with\s+me|me)?/.test(intentText);
    const contactText = wantsContact && providedContact
      ? `You can continue with Russell now. You asked him to contact you using the ${providedContact.method === 'email' ? 'email address' : 'number'} you provided. I can use it only for that follow-up request; it does not share this conversation or authorize other use. Conversation context remains a separate choice.`
      : 'You can continue with Russell now. Call or text without sharing this conversation, or ask Russell to contact you with only the contact information needed for that request.';
    return { mode: MODES.HUMAN, state, text: declined ? 'I will not transfer this conversation. You can call or text Russell directly and decide what you want to tell him.' : contactText, offerHuman: true, contactRequested: wantsContact, providedContact };
  }
  if (signals.correction) {
    const currentCorrection = state.corrections.at(-1);
    const corrected = currentCorrection ? ` I’ll use the corrected ${currentCorrection.field === 'timeline' ? `timing, ${currentCorrection.current}` : 'information'} going forward.` : '';
    return { mode: signals.frustration || /already/.test(intentText) ? MODES.RECOVER : MODES.CONFIRM, state, text: `You’re right to correct that.${corrected} I won’t ask you to repeat it.`, understanding: buildUnderstanding(state), isCorrection: true };
  }
  if (signals.pause) return { mode: MODES.PAUSE, state, text: 'We can pause here. Your private conversation remains available when you return, and you can also continue directly with Russell at any time.', offerHuman: true };
  if (signals.stopQuestions || signals.frustration) return { mode: MODES.RECOVER, state, text: `You’re right. Another discovery question would not help now. ${directionForState(state)}`, offerHuman: true };
  if (signals.skip || signals.changeTopic || /rather not answer|can we talk about .+ instead/i.test(content)) return { mode: domain ? MODES.BOUNDARY : MODES.DIRECTION, state, text: `We can leave that question there. ${domain ? boundaryResponse(domain) : directionForState(state)}`, offerHuman: false };
  if (signals.sensitive && !signals.direct) return { mode: MODES.DIRECTION, state, text: `${acknowledgment} ${directionForState(state)}`.trim(), offerHuman: true, quickReplies: ['Pause here', 'One practical next step', 'Talk with Russell'] };
  if (signals.dontKnow) return { mode: MODES.DIRECTION, state, text: `It is fine not to know yet. ${directionForState(state)}`, quickReplies: ['Give me a simple comparison', 'Pause here', 'Talk with Russell'] };
  if (/\b(low|2\.75|2\.\d+)\b.+\b(rate|mortgage)\b|\b(rate|mortgage)\b.+\b(give it up|lose|low)\b/.test(intentText) && !signals.direct) return { mode: MODES.DIRECTION, state, text: `${acknowledgment} Comparing total housing cost, transition risk, and the reason for moving is more useful than treating the rate alone as the decision. A lender should verify any financing path from actual finances.`.trim() };
  if (domain) return { mode: domain === 'market-timing' || domain === 'buy-before-sell' ? MODES.ANSWER : MODES.BOUNDARY, state, text: `${acknowledgment ? `${acknowledgment} ` : ''}${boundaryResponse(domain)}`, offerHuman: ['legal', 'tax', 'lending', 'value', 'construction'].includes(domain) };
  if (signals.sensitive) return { mode: MODES.DIRECTION, state, text: `${acknowledgment} ${directionForState(state)}`.trim(), offerHuman: true, quickReplies: ['Pause here', 'One practical next step', 'Talk with Russell'] };
  if (shouldConfirm(state)) return { mode: MODES.CONFIRM, state, text: acknowledgment, understanding: buildUnderstanding(state) };
  const question = state.questionPreference === 'open' ? questionForState(state) : null;
  if (question) {
    state.askedTopics = unique([...state.askedTopics, question.topic]);
    return { mode: MODES.ASK, state, text: `${acknowledgment ? `${acknowledgment} ` : ''}${question.text}`, quickReplies: question.replies };
  }
  return { mode: MODES.DIRECTION, state, text: `${acknowledgment ? `${acknowledgment} ` : ''}${directionForState(state)}`, offerHuman: false };
}

export function initialTurn() {
  return { mode: MODES.ASK, topic: 'reason', text: 'What put selling on your mind?', quickReplies: ['I am just exploring', 'A move may be coming', 'The home no longer fits'] };
}

export function directionAfterConfirmation(state) {
  return { mode: MODES.DIRECTION, text: directionForState(state), offerHuman: false };
}
