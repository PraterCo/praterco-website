export const BEHAVIOR_VERSION = 'seller-reference-1.0.0';

const clean = (value) => value.trim().replace(/\s+/g, ' ');

function acknowledgement(text) {
  const lower = text.toLowerCase();
  if (/family|parent|inherit|divorce|loss|died|death/.test(lower)) return 'I hear that there is more tied to this than the property itself. We can move carefully and keep the practical decisions manageable.';
  if (/overwhelm|stress|anxious|nervous|afraid/.test(lower)) return 'That makes sense. Selling can carry a lot at once, and we can take it one decision at a time.';
  if (/job|move|relocat/.test(lower)) return 'It sounds like the move is setting the pace, so the plan needs to respect both your timing and your breathing room.';
  if (/not sure|explor|maybe|thinking/.test(lower)) return 'You do not need to have the whole decision made yet. Getting clear on what matters is a useful first step.';
  return 'I hear what you are weighing. That context matters, and I will use it as we work through the next step.';
}

function boundedAnswer(text) {
  const lower = text.toLowerCase();
  if (/what.*worth|value|price|how much/.test(lower)) {
    return 'I can help you understand the factors that shape a likely market range, but I should not give you a definitive value without reviewing the property and current comparable sales.';
  }
  if (/tax|capital gain/.test(lower)) {
    return 'I can help you identify the information to bring to a tax professional, but I should not give a tax conclusion. Timing, use, ownership, and improvements can all matter.';
  }
  if (/repair|fix|renovat/.test(lower)) {
    return 'Not every repair earns its cost back. The useful next step is to separate work that protects the sale from work that is mostly cosmetic, then compare that with selling as-is.';
  }
  return '';
}

export function buildUnderstanding(participantMessages) {
  const excerpts = participantMessages.slice(-3).map((message) => clean(message.content).slice(0, 180));
  return excerpts.length === 1
    ? `You are considering a sale, and the main thing on your mind is: ${excerpts[0]}`
    : `You are considering a sale. What I am hearing is that ${excerpts.join(' You also shared that ').replace(/^./, (c) => c.toLowerCase())}`;
}

export function nextTurn(messages) {
  const participant = messages.filter((message) => message.role === 'participant');
  const latest = participant.at(-1)?.content || '';
  const prefix = latest ? `${acknowledgement(latest)}${boundedAnswer(latest) ? ` ${boundedAnswer(latest)}` : ''}` : '';

  if (participant.length === 0) {
    return { kind: 'question', text: 'What has you thinking about selling?', quickReplies: ['I am just exploring', 'A move may be coming', 'I need to sell soon'] };
  }
  if (participant.length === 1) {
    return { kind: 'question', text: `${prefix} What timing are you working with, even if it is only a rough idea?`, quickReplies: ['No fixed timing', 'Within 3 months', 'Within 6 months', 'Later this year'] };
  }
  if (participant.length === 2) {
    return { kind: 'question', text: `${prefix} What would a good outcome need to protect most for you?`, quickReplies: ['The strongest result', 'A calm process', 'My timing', 'Selling as-is'] };
  }
  return { kind: 'understanding', text: prefix, understanding: buildUnderstanding(participant) };
}

export function directionAfterConfirmation() {
  return {
    kind: 'direction',
    text: 'A practical next step is to compare your timing, the property’s current condition, and the local market before deciding how much preparation is worthwhile. Russell can review those pieces with you without forcing a decision today.',
    continuationAvailable: true
  };
}
