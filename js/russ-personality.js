(() => {
  const principles = [
    'Trust first.',
    'Reflect before redirecting.',
    'Understand the why before discussing the how.',
    'Ask one useful question at a time.',
    'Reduce pressure and increase clarity.',
    'Recommend the smallest practical next step.'
  ];

  const acknowledgements = {
    motivation: ['Got it.', 'Okay.', 'That makes sense.', 'For sure.'],
    successLooksLike: ['Got it.', 'That makes sense.', 'Sounds good.'],
    timeline: ['Okay.', 'Got it.', 'That helps.'],
    blockerConfirmed: ['Got it.', 'Okay.', 'That helps.'],
    blockerDetails: ['Got it.', 'That makes sense.', 'Okay.']
  };

  function choose(items, seed) {
    if (!items || !items.length) return '';
    const value = String(seed || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return items[value % items.length];
  }

  function cleanThought(answer) {
    return String(answer || '')
      .trim()
      .replace(/[.!?]+$/g, '')
      .replace(/^(yeah|yes|well|honestly|actually|basically|so|i mean)[,\s]+/i, '')
      .trim();
  }

  function reflect(answer) {
    const clean = cleanThought(answer);
    if (!clean) return '';

    const contrast = clean.split(/\b(?:but|because)\b/i).map((part) => part.trim()).filter(Boolean);
    let thought = contrast.length > 1 ? contrast[contrast.length - 1] : clean;

    const words = thought.split(/\s+/);
    if (words.length > 9) thought = words.slice(-7).join(' ');

    thought = thought
      .replace(/^(we are|we're|i am|i'm|it is|it's)\s+/i, '')
      .replace(/^that\s+/i, '')
      .trim();

    if (!thought) return '';
    return `${thought.charAt(0).toUpperCase()}${thought.slice(1)}?`;
  }

  function acknowledge(field, answer) {
    return choose(acknowledgements[field] || ['Got it.', 'Okay.', 'That helps.'], answer);
  }

  function opening() {
    return 'We can take this one step at a time. I want to understand what is behind the decision before we talk about what you should do.';
  }

  function transition(question) {
    return question ? question.text : '';
  }

  function blueprintIntro(summary) {
    const outcome = summary.success
      ? `You are trying to create ${summary.success.toLowerCase()}.`
      : 'You are trying to make a confident decision without unnecessary pressure.';
    return `${outcome} The next step is not automatically listing the home. It is replacing assumptions with the right information.`;
  }

  function nextSteps(summary) {
    const steps = [];
    if (summary.blocker) steps.push(`Put real numbers around: ${summary.blocker}.`);
    steps.push('Estimate likely net proceeds and compare the realistic alternatives.');
    steps.push('Talk through the options with Russ and choose the next step without forcing a commitment.');
    return steps.slice(0, 3);
  }

  window.RussPersonality = {
    principles,
    reflect,
    acknowledge,
    opening,
    transition,
    blueprintIntro,
    nextSteps
  };
})();