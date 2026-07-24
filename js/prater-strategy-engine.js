(() => {
  function clean(value) {
    return String(value || '').trim();
  }

  function lower(value) {
    return clean(value).toLowerCase();
  }

  function includesAny(value, terms) {
    const text = lower(value);
    return terms.some((term) => text.includes(term));
  }

  function strategy(id, title, baseScore) {
    return {
      id,
      title,
      score: baseScore,
      confidence: 0,
      reasons: [],
      blockers: [],
      assumptions: []
    };
  }

  function addReason(item, reason, points) {
    if (!item.reasons.includes(reason)) item.reasons.push(reason);
    item.score += points;
  }

  function addBlocker(item, blocker, points) {
    if (!item.blockers.includes(blocker)) item.blockers.push(blocker);
    item.score -= points;
  }

  function evaluate(profile) {
    if (!profile || !profile.discoveries) return [];

    const d = profile.discoveries;
    const why = lower(d.why && d.why.summary);
    const timeline = lower(d.timeline && d.timeline.summary);
    const location = lower(d.location && d.location.summary);
    const needs = lower(d.homeNeeds && d.homeNeeds.summary);
    const financial = lower(d.financialPath && d.financialPath.summary);
    const obstacle = lower(d.obstacle && d.obstacle.summary);

    const sellFirst = strategy('sell-first', 'Sell First', 50);
    const buyFirst = strategy('buy-first', 'Buy First', 45);
    const coordinated = strategy('coordinated', 'Coordinate Both Closings', 48);
    const wait = strategy('wait', 'Wait and Prepare', 35);
    const keepRental = strategy('keep-rental', 'Keep It as a Rental', 25);

    if (includesAny(financial, ['need to sell first', 'sell first', 'cash to buy', 'equity'])) {
      addReason(sellFirst, 'The next purchase appears to depend on equity from the current home.', 32);
      addBlocker(buyFirst, 'Buying first may require cash reserves or financing that has not been confirmed.', 24);
    }

    if (includesAny(financial, ['buy first', 'may be able to buy first', 'could buy first'])) {
      addReason(buyFirst, 'There may be enough flexibility to secure the replacement home before selling.', 28);
      addReason(coordinated, 'A flexible financial position creates more options for coordinating the move.', 16);
    }

    if (includesAny(financial, ['not sure', 'unsure'])) {
      sellFirst.assumptions.push('Available equity and lender qualification still need to be confirmed.');
      buyFirst.assumptions.push('Cash reserves and lender qualification still need to be confirmed.');
      coordinated.assumptions.push('Both transaction timelines need to be tested against financing.');
    }

    if (includesAny(timeline, ['30 days', 'quickly', 'immediately'])) {
      addReason(sellFirst, 'The timeline favors a simpler path with fewer carrying-cost risks.', 18);
      addReason(coordinated, 'A coordinated plan may reduce temporary housing and duplicate moves.', 12);
      addBlocker(wait, 'Waiting conflicts with the stated timeline.', 30);
    }

    if (includesAny(timeline, ['three to six months', 'later this year', 'exploration', 'no immediate'])) {
      addReason(wait, 'The timeline allows time to prepare the property and verify the financial path.', 22);
      addReason(coordinated, 'There is enough time to plan the sale and purchase together.', 10);
    }

    if (includesAny(why, ['family is expanding', 'not enough space', 'larger', 'work change', 'relocat'])) {
      addReason(sellFirst, 'The current home no longer fits the reason for moving.', 12);
      addReason(coordinated, 'The move should solve a clear lifestyle need without creating avoidable disruption.', 14);
      addBlocker(wait, 'Waiting may leave the underlying housing problem unresolved.', 12);
    }

    if (includesAny(needs, ['more room', 'bedroom', 'bigger', 'better layout', 'school'])) {
      addReason(coordinated, 'The replacement home has specific requirements that should be identified before listing.', 16);
      addReason(buyFirst, 'Securing the right replacement home first may protect against settling for the wrong fit.', 10);
    }

    if (includesAny(location, ['same area', 'schools', 'closer to family', 'closer to work'])) {
      addReason(coordinated, 'Location requirements make replacement-home availability an important part of the plan.', 14);
      addBlocker(sellFirst, 'The replacement-home search should be tested before committing to a sale date.', 6);
    }

    if (includesAny(obstacle, ['two payments', 'payment', 'afford', 'money', 'financial'])) {
      addReason(sellFirst, 'Selling first reduces the risk of carrying two housing payments.', 20);
      addBlocker(buyFirst, 'Carrying costs are already a stated concern.', 22);
    }

    if (includesAny(obstacle, ['moving twice', 'temporary housing'])) {
      addReason(coordinated, 'Coordinating both transactions may reduce the chance of moving twice.', 22);
      addBlocker(sellFirst, 'Selling first could require temporary housing if the replacement home is not ready.', 10);
    }

    if (profile.path === 'rental') {
      addReason(keepRental, 'Keeping the property is already one of the client’s stated options.', 28);
    }

    if (includesAny(obstacle, ['tenant', 'property management', 'vacancy'])) {
      addBlocker(keepRental, 'Rental operations or occupancy are already a concern.', 18);
    }

    const completeness = Object.values(d).filter((item) => item && item.status === 'DONE').length;
    const strategies = [sellFirst, buyFirst, coordinated, wait, keepRental]
      .map((item) => {
        item.score = Math.max(0, Math.min(100, item.score));
        item.confidence = Math.max(25, Math.min(98, 38 + completeness * 8 + item.reasons.length * 4 - item.assumptions.length * 5));
        return item;
      })
      .sort((a, b) => b.score - a.score);

    return strategies;
  }

  function recommendation(profile) {
    const strategies = evaluate(profile);
    const primary = strategies[0] || null;
    const alternative = strategies[1] || null;
    return { primary, alternative, strategies };
  }

  function explain(item) {
    if (!item) return '';
    const reason = item.reasons[0] || 'It currently creates the clearest path with the least avoidable risk.';
    return `Based on everything you have shared, I am leaning toward ${item.title.toLowerCase()} because ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`;
  }

  window.PraterStrategyEngine = { evaluate, recommendation, explain };
})();