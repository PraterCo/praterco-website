(() => {
  const STORAGE_KEY = 'praterSellerProfile';

  const pathSignals = {
    'needs-work': ['Preparing for a possible sale', 'Uncertainty about which repairs are actually worthwhile', 'The Careful Preparer'],
    value: ['Exploring home equity', 'Uncertainty about the home’s current value', 'The Equity Explorer'],
    'low-rate': ['A lifestyle need is competing with a low payment', 'Whether moving is worth giving up a low mortgage rate', 'The Thoughtful Mover'],
    timing: ['Considering a move in an uncertain market', 'Whether the timing works for this specific move', 'The Market Watcher'],
    'buy-first': ['Coordinating a sale and purchase', 'How to move without taking on too much timing or payment risk', 'The Careful Coordinator'],
    downsizing: ['The current home no longer fits the next chapter', 'Whether simplifying life is worth the financial tradeoff', 'The Thoughtful Downsizer'],
    inherited: ['Managing an inherited property', 'How to resolve the family, property, and timing questions', 'The Legacy Planner'],
    'quick-sale': ['A time-sensitive life change', 'How to move quickly without giving away unnecessary value', 'The Priority Seller'],
    rental: ['Comparing selling with long-term ownership', 'Which path creates the better financial and lifestyle outcome', 'The Long-Term Thinker'],
    stuck: ['Something changed, but the path is unclear', 'Not knowing which question to answer first', 'The Clarity Seeker'],
    solar: ['Planning around a solar agreement', 'How the solar obligation affects a future sale', 'The Detail Planner'],
    other: ['A unique life or property change', 'The central decision is still emerging', 'The Thoughtful Planner']
  };

  const stages = [[0, 'Exploring'], [30, 'Clarifying'], [55, 'Planning'], [80, 'Ready to Act']];

  function freshProfile() {
    return {
      version: 2,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: null,
      decisionProfile: 'The Clarity Seeker',
      lifeEvent: null,
      motivation: null,
      successLooksLike: null,
      timeline: null,
      blocker: null,
      blockerConfirmed: null,
      blockerDetails: null,
      answers: [],
      readiness: 10,
      stage: 'Exploring',
      unknowns: [],
      roadmap: []
    };
  }

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return stored && stored.version === 2 ? hydrate({ ...freshProfile(), ...stored }) : freshProfile();
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
    return stages.reduce((label, item) => score >= item[0] ? item[1] : label, 'Exploring');
  }

  function blockerIsResolved(profile) {
    return profile.blockerConfirmed === 'Yes, exactly' || !!profile.blockerDetails;
  }

  function hydrate(profile) {
    let score = 10;
    if (profile.path) score += 10;
    if (profile.motivation) score += 20;
    if (profile.successLooksLike) score += 20;
    if (profile.timeline) score += 20;
    if (profile.blockerConfirmed) score += 10;
    if (blockerIsResolved(profile)) score += 10;

    profile.readiness = Math.min(score, 100);
    profile.stage = stageFor(profile.readiness);
    profile.unknowns = [
      !profile.motivation && 'What changed and why this is on your mind now',
      !profile.successLooksLike && 'What a successful outcome would feel like',
      !profile.timeline && 'Whether this is weeks, months, or early exploration',
      !profile.blockerConfirmed && 'Whether we have identified the real decision',
      profile.blockerConfirmed && !blockerIsResolved(profile) && 'What concern is bigger than the one we first identified'
    ].filter(Boolean);

    if (!profile.unknowns.length) {
      profile.unknowns = ['The real numbers needed to compare your best options'];
    }

    profile.roadmap = [
      { text: 'Tell Russ what changed', complete: !!profile.motivation, current: !profile.motivation },
      { text: 'Define what success looks like', complete: !!profile.successLooksLike, current: !!profile.motivation && !profile.successLooksLike },
      { text: 'Clarify your timing', complete: !!profile.timeline, current: !!profile.successLooksLike && !profile.timeline },
      { text: 'Identify the biggest decision', complete: blockerIsResolved(profile), current: !!profile.timeline && !blockerIsResolved(profile) },
      { text: 'Build your personalized next step', complete: profile.readiness >= 80, current: blockerIsResolved(profile) && profile.readiness < 80 }
    ];

    return profile;
  }

  function begin(path) {
    const profile = freshProfile();
    const signal = pathSignals[path] || pathSignals.other;
    profile.path = path;
    profile.lifeEvent = signal[0];
    profile.blocker = signal[1];
    profile.decisionProfile = signal[2];
    return save(hydrate(profile));
  }

  function record(profile, field, answer) {
    if (!profile || !field || !answer) return profile;

    profile[field] = answer;

    if (field === 'blockerDetails') {
      profile.blocker = answer;
    }

    profile.answers.push({ field, answer, at: new Date().toISOString() });
    return save(hydrate(profile));
  }

  function nextQuestion(profile) {
    if (!profile.motivation) {
      return {
        field: 'motivation',
        text: 'Before we talk about the house, what changed recently that put this thought on your mind?',
        replies: ['Our family or lifestyle changed', 'The house no longer fits', 'Money or work changed', 'We are planning ahead']
      };
    }

    if (!profile.successLooksLike) {
      return {
        field: 'successLooksLike',
        text: 'Six months from now, what would make you say this was the right decision?',
        replies: ['More financial certainty', 'A less stressful home', 'A smooth move', 'Knowing we made the smart choice']
      };
    }

    if (!profile.timeline) {
      return {
        field: 'timeline',
        text: 'How soon would you ideally want clarity or a plan?',
        replies: ['Within 30 days', 'Within 3–6 months', 'Later this year', 'I am only exploring']
      };
    }

    if (!profile.blockerConfirmed) {
      return {
        field: 'blockerConfirmed',
        text: `Let me make sure I have this right. The biggest decision may be ${profile.blocker.toLowerCase()}. Does that feel accurate?`,
        replies: ['Yes, exactly', 'Partly, but there is more', 'No, something else is bigger']
      };
    }

    if (!blockerIsResolved(profile)) {
      return {
        field: 'blockerDetails',
        text: 'What concern feels bigger or still needs to be included?',
        replies: []
      };
    }

    return {
      field: 'complete',
      text: 'I understand enough to give you a useful first roadmap. The next step is not automatically listing—it is replacing assumptions with the right numbers.',
      replies: []
    };
  }

  function summary(profile) {
    return {
      title: profile.decisionProfile,
      lifeEvent: profile.lifeEvent,
      motivation: profile.motivation,
      success: profile.successLooksLike,
      timeline: profile.timeline,
      blocker: profile.blocker,
      readiness: profile.readiness,
      stage: profile.stage
    };
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return freshProfile();
  }

  window.PraterDecisionEngine = { begin, load, record, nextQuestion, summary, save, reset };
})();