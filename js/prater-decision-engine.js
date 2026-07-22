(() => {
  const STORAGE_KEY = 'praterSellerProfile';

  const pathSignals = {
    'needs-work': { lifeEvent: 'Preparing for a possible sale', blocker: 'Uncertainty about repairs', profile: 'The Careful Preparer' },
    value: { lifeEvent: 'Exploring home equity', blocker: 'Uncertainty about current value', profile: 'The Equity Explorer' },
    'low-rate': { lifeEvent: 'A lifestyle need is competing with a low payment', blocker: 'Giving up a low mortgage rate', profile: 'The Thoughtful Mover' },
    timing: { lifeEvent: 'Considering a move in an uncertain market', blocker: 'Uncertainty about timing', profile: 'The Market Watcher' },
    'buy-first': { lifeEvent: 'Coordinating a sale and purchase', blocker: 'Managing two transactions', profile: 'The Careful Coordinator' },
    downsizing: { lifeEvent: 'The current home no longer fits the next chapter', blocker: 'Knowing whether moving is worth it', profile: 'The Thoughtful Downsizer' },
    inherited: { lifeEvent: 'Managing an inherited property', blocker: 'Too many legal, family, and property questions', profile: 'The Legacy Planner' },
    'quick-sale': { lifeEvent: 'A time-sensitive change', blocker: 'Balancing speed with protecting value', profile: 'The Priority Seller' },
    rental: { lifeEvent: 'Comparing selling with long-term ownership', blocker: 'Uncertainty about the better financial path', profile: 'The Long-Term Thinker' },
    stuck: { lifeEvent: 'Something has changed, but the path is unclear', blocker: 'Not knowing where to begin', profile: 'The Clarity Seeker' },
    solar: { lifeEvent: 'Planning around a solar agreement', blocker: 'Uncertainty about transfer or payoff', profile: 'The Detail Planner' },
    other: { lifeEvent: 'A unique life or property change', blocker: 'The central decision is still emerging', profile: 'The Thoughtful Planner' }
  };

  const stages = [
    { min: 0, label: 'Exploring' },
    { min: 30, label: 'Clarifying' },
    { min: 55, label: 'Planning' },
    { min: 80, label: 'Ready to Act' }
  ];

  function freshProfile() {
    return {
      version: 1,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: null,
      decisionProfile: 'The Clarity Seeker',
      lifeEvent: null,
      motivation: null,
      timeline: null,
      successLooksLike: null,
      blocker: null,
      answers: [],
      readiness: 10,
      stage: 'Exploring',
      unknowns: ['What changed', 'What success looks like', 'Your timing', 'The biggest decision'],
      roadmap: []
    };
  }

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return stored && stored.version === 1 ? stored : freshProfile();
    } catch (_) {
      return freshProfile();
    }
  }

  function save(profile) {
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }

  function stageFor(score) {
    return stages.reduce((current, stage) => score >= stage.min ? stage.label : current, 'Exploring');
  }

  function calculate(profile) {
    let score = 10;
    if (profile.path) score += 15;
    if (profile.motivation) score += 18;
    if (profile.timeline) score += 18;
    if (profile.successLooksLike) score += 19;
    if (profile.blocker) score += 20;
    profile.readiness = Math.min(score, 100);
    profile.stage = stageFor(profile.readiness);
    return profile;
  }

  function buildUnknowns(profile) {
    const unknowns = [];
    if (!profile.motivation) unknowns.push('What changed and why this is on your mind now');
    if (!profile.successLooksLike) unknowns.push('What a successful outcome would feel like');
    if (!profile.timeline) unknowns.push('Whether this is weeks, months, or early exploration');
    if (!profile.blocker) unknowns.push('The one decision keeping you from moving forward');
    profile.unknowns = unknowns.length ? unknowns : ['The details needed to compare your best options'];
    return profile;
  }

  function buildRoadmap(profile) {
    profile.roadmap = [
      { text: 'Tell Russ what changed', complete: Boolean(profile.motivation), current: !profile.motivation },
      { text: 'Define what success looks like', complete: Boolean(profile.successLooksLike), current: Boolean(profile.motivation) && !profile.successLooksLike },
      { text: 'Clarify your timing', complete: Boolean(profile.timeline), current: Boolean(profile.successLooksLike) && !profile.timeline },
      { text: 'Identify the biggest decision', complete: Boolean(profile.blocker), current: Boolean(profile.timeline) && !profile.blocker },
      { text: 'Build your personalized next step', complete: profile.readiness >= 80, current: Boolean(profile.blocker) && profile.readiness < 80 }
    ];
    return profile;
  }

  function begin(path) {
    const profile = freshProfile();
    const signal = pathSignals[path] || pathSignals.other;
    profile.path = path;
    profile.lifeEvent = signal.lifeEvent;
    profile.blocker = signal.blocker;
    profile.decisionProfile = signal.profile;
    return save(buildRoadmap(buildUnknowns(calculate(profile))));
  }

  function record(profile, field, answer) {
    profile[field] = answer;
    profile.answers.push({ field, answer, at: new Date().toISOString() });
    return save(buildRoadmap(buildUnknowns(calculate(profile))));
  }

  function nextQuestion(profile) {
    if (!profile.motivation) return { field: 'motivation', text: 'What changed recently that put this thought on your mind?', replies: ['Our family or lifestyle changed', 'The house no longer fits', 'Money or work changed', 'We are planning ahead'] };
    if (!profile.successLooksLike) return { field: 'successLooksLike', text: 'Six months from now, what would make you say this was the right decision?', replies: ['More financial certainty', 'A less stressful home', 'A smooth move', 'Knowing we made the smart choice'] };
    if (!profile.timeline) return { field: 'timeline', text: 'How soon would you ideally want clarity or a plan?', replies: ['Within 30 days', 'Within 3–6 months', 'Later this year', 'I am only exploring'] };
    if (!profile.blockerConfirmed) return { field: 'blockerConfirmed', text: `It sounds like the biggest decision may be: ${profile.blocker}. Does that feel right?`, replies: ['Yes, exactly', 'Partly, but there is more', 'No, something else is bigger'] };
    return { field: 'complete', text: 'I understand enough to build a useful first roadmap. The next step is to compare your options with real numbers instead of assumptions.', replies: ['Show me my roadmap', 'Talk it through with Russ'] };
  }

  function summary(profile) {
    return {
      title: profile.decisionProfile,
      lifeEvent: profile.lifeEvent,
      success: profile.successLooksLike,
      timeline: profile.timeline,
      blocker: profile.blocker,
      readiness: profile.readiness,
      stage: profile.stage
    };
  }

  window.PraterDecisionEngine = { begin, load, record, nextQuestion, summary, save };
})();