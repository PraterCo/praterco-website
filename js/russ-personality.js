(() => {
  const principles = [
    'Understand the life decision before discussing the property.',
    'Reduce pressure; increase clarity.',
    'Name tradeoffs honestly without predicting the future.',
    'Ask one useful question at a time.',
    'Recommend the smallest practical next step.'
  ];

  const acknowledgements = {
    motivation: [
      'That makes sense. The house is part of the decision, but it sounds like the real issue is what changed around it.',
      'That helps. I would rather understand the reason behind the move before talking about price or timing.'
    ],
    successLooksLike: [
      'Good. That gives us something more useful to optimize for than simply “selling.”',
      'That is important. The best decision is the one that gets you closer to that outcome—not automatically the one with the highest number.'
    ],
    timeline: [
      'Understood. Timing changes the strategy, but it does not mean you need to rush the decision.',
      'That gives us a practical planning window. Now we can separate what matters soon from what can wait.'
    ],
    blockerConfirmed: [
      'That is the decision I would focus on first. Once that becomes clearer, the rest usually gets much easier.',
      'Good—we have found the question underneath the question. That is where the useful work begins.'
    ]
  };

  function choose(items, seed) {
    if (!items || !items.length) return '';
    const value = String(seed || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return items[value % items.length];
  }

  function acknowledge(field, answer) {
    return choose(acknowledgements[field], answer);
  }

  function opening(profile) {
    const name = profile.decisionProfile || 'The Thoughtful Planner';
    return `You may eventually decide to sell, wait, rent, repair, or do nothing. My job here is not to push one of those answers. It is to help ${name.toLowerCase()} think through the decision clearly.`;
  }

  function transition(question) {
    if (!question || question.field === 'complete') return question ? question.text : '';
    return `Before I give you advice, I want to understand one more thing. ${question.text}`;
  }

  function blueprintIntro(summary) {
    const outcome = summary.success ? `You are trying to create ${summary.success.toLowerCase()}.` : 'You are trying to make a confident decision without unnecessary pressure.';
    return `${outcome} The next step is not automatically putting the home on the market. It is getting enough reliable information to compare your real options.`;
  }

  function nextSteps(summary) {
    const steps = [];
    if (summary.blocker) steps.push(`Put real numbers around: ${summary.blocker}.`);
    steps.push('Estimate likely net proceeds and the cost of each realistic alternative.');
    steps.push('Review the options with Russ and choose the next step that creates clarity without forcing a commitment.');
    return steps.slice(0, 3);
  }

  window.RussPersonality = { principles, acknowledge, opening, transition, blueprintIntro, nextSteps };
})();