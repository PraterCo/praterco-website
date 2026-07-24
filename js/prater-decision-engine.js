(() => {
  const STORAGE_KEY = 'praterSellerProfile';
  const STATES = Object.freeze({
    UNKNOWN: 'UNKNOWN',
    INVESTIGATING: 'INVESTIGATING',
    UNDERSTOOD: 'UNDERSTOOD',
    CONFIRMED: 'CONFIRMED',
    DONE: 'DONE'
  });

  const pathSignals = {
    'needs-work': ['Preparing for a possible sale', 'What work is actually necessary', 'The Careful Preparer'],
    value: ['Exploring home equity', 'What the home is realistically worth', 'The Equity Explorer'],
    'low-rate': ['A lifestyle need is competing with a low payment', 'Whether moving is worth the financial tradeoff', 'The Thoughtful Mover'],
    timing: ['Considering a move in an uncertain market', 'Whether the timing works for this move', 'The Market Watcher'],
    'buy-first': ['Coordinating a sale and purchase', 'How to move without unnecessary timing risk', 'The Careful Coordinator'],
    downsizing: ['The current home no longer fits the next chapter', 'What the next home needs to make easier', 'The Thoughtful Downsizer'],
    inherited: ['Managing an inherited property', 'How to resolve the family, property, and timing questions', 'The Legacy Planner'],
    'quick-sale': ['A time-sensitive life change', 'How to move quickly without giving away value', 'The Priority Seller'],
    rental: ['Comparing selling with long-term ownership', 'Which path best fits the financial and lifestyle goals', 'The Long-Term Thinker'],
    stuck: ['Something changed, but the path is unclear', 'What is really driving the thought of moving', 'The Clarity Seeker'],
    solar: ['Planning around a solar agreement', 'How the solar obligation affects a future sale', 'The Detail Planner'],
    other: ['A unique life or property change', 'The central decision is still emerging', 'The Thoughtful Planner']
  };

  const discoveryOrder = ['why', 'timeline', 'location', 'homeNeeds', 'financialPath', 'obstacle'];

  function discovery(label) {
    return { label, status: STATES.UNKNOWN, confidence: 0, summary: null, evidence: [], locked: false };
  }

  function freshProfile() {
    return {
      version: 4,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: null,
      decisionProfile: 'The Clarity Seeker',
      lifeEvent: null,
      centralDecision: null,
      answers: [],
      discoveries: {
        why: discovery('Why'),
        timeline: discovery('Timeline'),
        location: discovery('Location'),
        homeNeeds: discovery('Home needs'),
        financialPath: discovery('Sell or buy first'),
        obstacle: discovery('Biggest obstacle')
      },
      readiness: 10,
      stage: 'Exploring',
      unknowns: [],
      roadmap: [],
      lastHumanMoment: null,
      acknowledgedMoments: []
    };
  }

  function hydrateStored(stored) {
    const profile = { ...freshProfile(), ...stored };
    profile.discoveries = { ...freshProfile().discoveries, ...(stored.discoveries || {}) };
    Object.keys(profile.discoveries).forEach((key) => {
      profile.discoveries[key] = { ...discovery(profile.discoveries[key].label), ...profile.discoveries[key] };
    });
    profile.version = 4;
    return hydrate(profile);
  }

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return stored ? hydrateStored(stored) : freshProfile();
    } catch (_) {
      return freshProfile();
    }
  }

  function save(profile) {
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }

  function begin(path) {
    const profile = freshProfile();
    const signal = pathSignals[path] || pathSignals.other;
    profile.path = path;
    profile.lifeEvent = signal[0];
    profile.centralDecision = signal[1];
    profile.decisionProfile = signal[2];
    return save(hydrate(profile));
  }

  function clean(value) {
    return String(value || '').trim();
  }

  function contains(text, terms) {
    const lower = text.toLowerCase();
    return terms.some((term) => lower.includes(term));
  }

  function addEvidence(item, answer) {
    if (answer && !item.evidence.includes(answer)) item.evidence.push(answer);
  }

  function complete(item, summary, confidence = 90) {
    item.status = STATES.DONE;
    item.confidence = confidence;
    item.summary = summary;
    item.locked = true;
  }

  function investigate(item, summary, confidence = 45) {
    if (item.locked) return;
    item.status = STATES.INVESTIGATING;
    item.confidence = Math.max(item.confidence, confidence);
    item.summary = summary || item.summary;
  }

  function detectHumanMoment(answer, profile) {
    const text = answer.toLowerCase();
    let moment = null;
    if (/(pregnan|baby|third child|second child|new child|expecting)/.test(text)) moment = { type: 'baby', text: "That's great—congratulations." };
    else if (/(engaged|getting married|wedding)/.test(text)) moment = { type: 'marriage', text: "That's great—congratulations." };
    else if (/(promotion|new job|job offer)/.test(text)) moment = { type: 'job', text: "That's great—congratulations." };
    else if (/(retir|retirement)/.test(text)) moment = { type: 'retirement', text: 'Congratulations. That is a big milestone.' };
    else if (/(passed away|died|death|lost my|loss of)/.test(text)) moment = { type: 'loss', text: "I'm sorry to hear that." };
    else if (/(divorc|separat)/.test(text)) moment = { type: 'divorce', text: "I'm sorry you're going through that." };
    if (!moment || profile.acknowledgedMoments.includes(moment.type)) return null;
    profile.acknowledgedMoments.push(moment.type);
    return moment;
  }

  function summarizeTarget(target, answer) {
    const text = clean(answer);
    const summaries = {
      timeline: text,
      location: text,
      homeNeeds: text,
      financialPath: text,
      obstacle: text
    };
    return summaries[target] || text;
  }

  function applyTargetAnswer(profile, target, answer) {
    if (!target || target === 'complete' || !profile.discoveries[target]) return;
    const item = profile.discoveries[target];
    if (item.locked) return;
    addEvidence(item, answer);

    if (target === 'why') {
      if (item.confidence >= 55 || answer.split(/\s+/).length >= 4) complete(item, item.summary || answer, Math.max(item.confidence, 85));
      else investigate(item, answer, 55);
      return;
    }

    complete(item, summarizeTarget(target, answer), 90);
  }

  function infer(profile, answer, target) {
    const text = clean(answer);
    const lower = text.toLowerCase();
    const d = profile.discoveries;
    const updates = [];

    const familyExpansion = /(pregnan|baby|third child|second child|new child|expecting|growing family)/.test(lower);
    const spaceReason = /(outgrow|too small|more space|need.*bedroom|bigger house)/.test(lower);
    const downsizeReason = /(too big|downsiz|less maintenance|empty nest|kids moved)/.test(lower);
    const workReason = /(new job|job transfer|relocat|work changed|commute)/.test(lower);
    const financialReason = /(payment|mortgage|money|afford|equity|financial)/.test(lower);

    if (!d.why.locked) {
      addEvidence(d.why, text);
      if (familyExpansion) {
        complete(d.why, 'The family is expanding and the current home no longer provides enough space.', 98);
        updates.push('why');
      } else if (spaceReason) {
        investigate(d.why, 'The current home may no longer provide enough space.', 55);
        updates.push('why');
      } else if (downsizeReason) {
        complete(d.why, 'The current home is larger or harder to maintain than the next chapter requires.', 92);
        updates.push('why');
      } else if (workReason) {
        complete(d.why, 'A work change is creating the need to reconsider where or how they live.', 92);
        updates.push('why');
      } else if (financialReason) {
        investigate(d.why, 'A financial consideration is affecting the decision.', 55);
        updates.push('why');
      } else if (d.why.status === STATES.UNKNOWN) {
        investigate(d.why, text, 35);
        updates.push('why');
      }
    }

    if (!d.timeline.locked) {
      if (/(within 30 days|next month|as soon as|quickly|immediately)/.test(lower)) complete(d.timeline, 'Within roughly 30 days.', 95);
      else if (/(3.?6 months|few months|this summer|this fall|this spring)/.test(lower)) complete(d.timeline, 'Within the next three to six months.', 92);
      else if (/(later this year|end of the year)/.test(lower)) complete(d.timeline, 'Later this year.', 90);
      else if (/(just exploring|not in a rush|someday|planning ahead)/.test(lower)) complete(d.timeline, 'Early exploration with no immediate deadline.', 90);
      else if (/(due in|baby.*due|before school|school starts|by august|by december|by october)/.test(lower)) {
        addEvidence(d.timeline, text);
        investigate(d.timeline, 'There is a life-event deadline that should shape the plan.', 70);
      }
    }

    if (!d.location.locked && contains(lower, ['school district', 'schools', 'neighborhood', 'area', 'stay nearby', 'closer to family', 'move to'])) {
      addEvidence(d.location, text);
      investigate(d.location, text, 65);
    }

    if (!d.homeNeeds.locked && contains(lower, ['bedroom', 'bathroom', 'yard', 'single story', 'one story', 'garage', 'office', 'more space', 'bigger'])) {
      addEvidence(d.homeNeeds, text);
      investigate(d.homeNeeds, text, 65);
    }

    if (!d.financialPath.locked && contains(lower, ['sell first', 'buy first', 'contingent', 'two payments', 'bridge loan', 'cash to buy'])) {
      addEvidence(d.financialPath, text);
      complete(d.financialPath, text, 88);
    }

    if (!d.obstacle.locked && contains(lower, ['worried', 'concern', 'afraid', 'problem', 'hard part', 'obstacle', 'stuck'])) {
      addEvidence(d.obstacle, text);
      investigate(d.obstacle, text, 60);
    }

    applyTargetAnswer(profile, target, text);
    profile.lastHumanMoment = detectHumanMoment(text, profile);
    profile.answers.push({ answer: text, target: target || null, updates, at: new Date().toISOString() });
    return save(hydrate(profile));
  }

  function hydrate(profile) {
    const completed = discoveryOrder.filter((key) => profile.discoveries[key].status === STATES.DONE).length;
    const active = discoveryOrder.filter((key) => profile.discoveries[key].status !== STATES.UNKNOWN).length;
    profile.readiness = Math.min(10 + completed * 14 + Math.max(0, active - completed) * 5, 100);
    profile.stage = profile.readiness >= 80 ? 'Ready to Act' : profile.readiness >= 55 ? 'Planning' : profile.readiness >= 30 ? 'Clarifying' : 'Exploring';
    profile.unknowns = discoveryOrder.filter((key) => profile.discoveries[key].status !== STATES.DONE).map((key) => profile.discoveries[key].label);
    profile.roadmap = discoveryOrder.map((key) => ({
      key,
      text: profile.discoveries[key].label,
      complete: profile.discoveries[key].status === STATES.DONE,
      current: false
    }));
    const next = chooseNextDiscovery(profile);
    const current = profile.roadmap.find((item) => item.key === next);
    if (current) current.current = true;
    return profile;
  }

  function chooseNextDiscovery(profile) {
    const d = profile.discoveries;
    if (d.why.status !== STATES.DONE) return 'why';
    if (d.timeline.status !== STATES.DONE) return 'timeline';
    if (d.location.status !== STATES.DONE) return 'location';
    if (d.homeNeeds.status !== STATES.DONE) return 'homeNeeds';
    if (d.financialPath.status !== STATES.DONE) return 'financialPath';
    if (d.obstacle.status !== STATES.DONE) return 'obstacle';
    return 'complete';
  }

  function nextQuestion(profile) {
    const key = chooseNextDiscovery(profile);
    const d = profile.discoveries;

    if (key === 'why') {
      const hasInitialReason = d.why.status === STATES.INVESTIGATING;
      return {
        discovery: key,
        reason: 'The root cause is not clear enough to guide useful advice.',
        text: hasInitialReason ? 'Help me understand what is behind that.' : 'What changed that made you start thinking about a move?',
        replies: []
      };
    }
    if (key === 'timeline') return { discovery: key, reason: 'Timing determines which strategies are realistic.', text: 'When would you ideally want the move completed?', replies: ['Within 30 days', 'Within 3–6 months', 'Later this year', 'Just exploring'] };
    if (key === 'location') return { discovery: key, reason: 'Location and schools shape the search before property details do.', text: 'Have you started thinking about where you would like to live, or will schools drive that decision?', replies: ['Stay in the same area', 'Schools will drive it', 'Closer to family or work', 'We are still open'] };
    if (key === 'homeNeeds') return { discovery: key, reason: 'The next home must solve the problem that created the move.', text: 'What does the next house need to do better for you?', replies: ['More room for the family', 'Better schools or location', 'A better layout', 'Less maintenance'] };
    if (key === 'financialPath') return { discovery: key, reason: 'The order of selling and buying changes the financing and risk.', text: 'Do you need to sell this home before buying the next one, or could you buy first?', replies: ['We need to sell first', 'We may be able to buy first', 'We are not sure yet'] };
    if (key === 'obstacle') return { discovery: key, reason: 'The biggest concern determines the safest next step.', text: 'What is the biggest concern you would want solved before moving forward?', replies: [] };
    return { discovery: 'complete', reason: 'The essential discoveries are complete.', text: 'I understand enough to map out a practical first plan. The next step is putting real numbers around the options—not automatically listing the house.', replies: [] };
  }

  function summary(profile) {
    return {
      title: profile.decisionProfile,
      lifeEvent: profile.lifeEvent,
      centralDecision: profile.centralDecision,
      discoveries: profile.discoveries,
      readiness: profile.readiness,
      stage: profile.stage,
      unknowns: profile.unknowns,
      roadmap: profile.roadmap
    };
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return freshProfile();
  }

  window.PraterDecisionEngine = { STATES, begin, load, infer, nextQuestion, chooseNextDiscovery, summary, save, reset };
})();