(() => {
  const startScreen = document.getElementById('startScreen');
  const conversationScreen = document.getElementById('conversationScreen');
  const resultScreen = document.getElementById('resultScreen');
  const questionArea = document.getElementById('questionArea');
  const conversationHistory = document.getElementById('conversationHistory');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const backButton = document.getElementById('backButton');
  const restartButton = document.getElementById('restartButton');
  const feedbackResponse = document.getElementById('feedbackResponse');

  const state = {
    step: 0,
    answers: {},
    history: [],
    insightShown: false
  };

  const questions = [
    {
      id: 'stage',
      prompt: 'Where are you in the process right now?',
      options: [
        ['ready', 'I know I want to sell'],
        ['considering', 'I am seriously considering it'],
        ['exploring', 'I am just exploring'],
        ['helping', 'I am helping a family member']
      ],
      reply: value => ({
        ready: 'Got it. Since you already know where you are headed, we can focus on making the path clearer.',
        considering: 'That makes sense. This is often the point where a little clarity is more useful than a sales pitch.',
        exploring: 'That is actually where a lot of people start. There is nothing wrong with gathering information before making a decision.',
        helping: 'That is thoughtful of you. Helping someone else often means balancing their needs, timing, and comfort level.'
      })[value]
    },
    {
      id: 'reason',
      prompt: 'What is making you think about selling?',
      options: [
        ['space', 'We need more space'],
        ['downsize', 'We are thinking about downsizing'],
        ['life', 'A life change is driving the decision'],
        ['financial', 'There are financial reasons'],
        ['investment', 'It is an investment decision'],
        ['other', 'Something else']
      ],
      reply: value => ({
        space: 'That is one of the most common reasons people begin thinking about a move. The next question is usually whether moving now creates enough benefit to justify the disruption.',
        downsize: 'Downsizing is rarely just about square footage. It is often connected to simplicity, responsibility, monthly cost, or flexibility.',
        life: 'Life changes can make timing feel urgent even when the real estate decision still needs to be handled carefully.',
        financial: 'Understood. When finances are part of the decision, estimated net proceeds and timing may matter more than the headline sale price.',
        investment: 'That makes sense. With an investment property, the decision may involve return, tax considerations, risk, and what the capital could do elsewhere.',
        other: 'Every situation is a little different. The goal here is to understand what matters most before deciding what to do next.'
      })[value]
    },
    {
      id: 'timeline',
      prompt: 'Do you already have a timeline in mind?',
      options: [
        ['soon', 'Within the next few months'],
        ['year', 'Sometime this year'],
        ['later', 'Next year or later'],
        ['unsure', 'I am not sure yet']
      ],
      reply: value => ({
        soon: 'That gives us a real planning window. The priority is deciding what truly needs attention and what can be left alone.',
        year: 'That is enough time to be thoughtful without over-preparing. A simple plan now can prevent rushed decisions later.',
        later: 'That flexibility is valuable. You may be able to make choices based on value and fit instead of reacting to a deadline.',
        unsure: 'Perfectly okay. Not having a fixed timeline may give you more options, not fewer.'
      })[value]
    },
    {
      id: 'condition',
      prompt: 'How would you describe the home today?',
      options: [
        ['ready', 'It is ready for the market'],
        ['mostly', 'It is mostly ready'],
        ['cosmetic', 'It needs some cosmetic work'],
        ['repairs', 'It needs significant repairs'],
        ['unknown', 'I am honestly not sure']
      ],
      reply: value => ({
        ready: 'Good. That may give you more control over timing and reduce the number of decisions you need to make before listing.',
        mostly: 'That is a strong place to be. The next question is usually which small improvements, if any, are worth doing.',
        cosmetic: 'Cosmetic work usually gives you choices. The important part is testing the likely cost against what buyers in your specific market may actually value.',
        repairs: 'That does not automatically mean you need to fix everything. It means the sale strategy should account for cost, time, risk, financing, and the likely buyer pool.',
        unknown: 'That is common. Homeowners know how the house feels to live in, but may not know how buyers will view it.'
      })[value]
    },
    {
      id: 'priority',
      prompt: 'When you picture a successful sale, what matters most?',
      options: [
        ['price', 'Getting the best possible price'],
        ['simple', 'Keeping the process simple'],
        ['stress', 'Reducing stress and uncertainty'],
        ['speed', 'Moving quickly'],
        ['balance', 'Finding the right balance']
      ],
      reply: value => ({
        price: 'That is helpful. Pursuing the strongest price may require more preparation, broader market exposure, and some tolerance for uncertainty.',
        simple: 'That is a valid priority. The highest number is not always the best overall outcome if reaching it creates more work, delay, or risk than you want.',
        stress: 'Understood. A predictable plan and clear communication may be more important to you than squeezing every possible dollar out of the sale.',
        speed: 'That makes sense. Speed can be valuable, but it is worth separating a genuinely time-sensitive move from a desire to simply get the process over with.',
        balance: 'That is where many people land. The real decision is how to balance price, timing, effort, and certainty in a way that fits your life.'
      })[value]
    },
    {
      id: 'nextHome',
      prompt: 'Will you need to buy another home as part of this move?',
      options: [
        ['before', 'Yes, and I may need to buy first'],
        ['after', 'Yes, but I would sell first'],
        ['same', 'Yes, and the timing needs to line up'],
        ['no', 'No'],
        ['unsure', 'I am not sure yet']
      ],
      reply: value => ({
        before: 'That is one of the biggest planning decisions in the process. Financing, contingency strength, carrying costs, and backup housing options may all matter.',
        after: 'That may reduce financial risk, though it can create a gap between homes. It helps to plan for both the ideal outcome and a backup plan.',
        same: 'Coordinating both sides is possible, but it works best when expectations, financing, and fallback options are clear before the home goes on the market.',
        no: 'That simplifies the timing considerably and may give you more negotiating flexibility.',
        unsure: 'That is worth resolving early because the answer can change your timeline, financing options, and negotiation strategy.'
      })[value]
    },
    {
      id: 'concern',
      prompt: 'What is your biggest concern right now?',
      options: [
        ['value', 'Knowing what the home is really worth'],
        ['repairs', 'Figuring out what to repair'],
        ['timing', 'Choosing the right timing'],
        ['buySell', 'Managing the move and next purchase'],
        ['process', 'Understanding the process'],
        ['none', 'I am not sure yet']
      ],
      reply: () => 'That is helpful. Let me pull the pieces together and give you a practical place to start.'
    }
  ];

  function labelFor(question, value) {
    const option = question.options.find(([key]) => key === value);
    return option ? option[1] : value;
  }

  function setProgress() {
    const total = questions.length;
    const percent = Math.max(8, Math.round((state.step / total) * 100));
    progressBar.style.width = `${percent}%`;
    if (state.step <= 1) progressText.textContent = 'We are just getting started.';
    else if (state.step < total - 1) progressText.textContent = 'This is really helpful.';
    else progressText.textContent = 'One last thing...';
  }

  function addHistory(question, answer, reply) {
    state.history.push({ type: 'exchange', question, answer, reply });
    renderHistory();
  }

  function addInsightHistory(insight) {
    state.history.push({ type: 'insight', insight });
    renderHistory();
  }

  function renderHistory() {
    conversationHistory.innerHTML = state.history.map(item => {
      if (item.type === 'insight') {
        return `
          <div class="pattern-history">
            <span>Something worth testing</span>
            <p>${item.insight}</p>
            <small>This is general guidance based on the answers you provided—not a valuation, prediction, or claim based on your specific property.</small>
          </div>
        `;
      }
      return `
        <div class="conversation-exchange">
          <div class="user-answer">${item.answer}</div>
          <div class="advisor-reply"><span>Russell's perspective</span><p>${item.reply}</p></div>
        </div>
      `;
    }).join('');
  }

  function renderQuestion() {
    const question = questions[state.step];
    setProgress();
    backButton.hidden = state.step === 0;
    questionArea.classList.remove('is-visible');
    questionArea.innerHTML = `
      <div class="question-number">A quick question</div>
      <h2>${question.prompt}</h2>
      <div class="answer-options">
        ${question.options.map(([value, label]) => `<button type="button" class="answer-option" data-value="${value}">${label}</button>`).join('')}
      </div>
    `;
    requestAnimationFrame(() => questionArea.classList.add('is-visible'));
    questionArea.querySelectorAll('.answer-option').forEach(button => {
      button.addEventListener('click', () => chooseAnswer(question, button.dataset.value));
    });
    questionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function buildPatternInsight() {
    const a = state.answers;

    if (a.reason === 'downsize' && ['cosmetic', 'repairs', 'unknown'].includes(a.condition) && ['simple', 'stress', 'balance'].includes(a.priority)) {
      return 'Because you are considering downsizing and also want to control effort or stress, a full remodel may work against your real goal. A better first step may be to separate essential repairs from optional updates, then compare the likely cost, disruption, and market benefit before committing.';
    }

    if (a.timeline === 'soon' && ['cosmetic', 'repairs'].includes(a.condition) && a.priority === 'price') {
      return 'Your timeline and price goal may pull in different directions. More preparation can sometimes improve marketability, but it can also create delays and costs. The useful question is not “Should everything be fixed?” but “Which items are most likely to affect buyer confidence, financing, or competition?”';
    }

    if (['later', 'unsure'].includes(a.timeline) && a.priority === 'price') {
      return 'Your flexible timing may be an advantage, but waiting is not automatically better. It gives you time to compare market conditions, preparation choices, carrying costs, and personal timing instead of relying on a single prediction about where prices are headed.';
    }

    if (a.reason === 'financial' && ['simple', 'stress', 'speed'].includes(a.priority)) {
      return 'Because financial considerations are involved, the most useful comparison may be net proceeds, certainty, and timing—not just the highest possible sale price. Two offers with different costs, conditions, and closing risks can produce very different real outcomes.';
    }

    if (['ready', 'mostly'].includes(a.condition) && a.priority === 'price') {
      return 'Since the home is already in relatively good condition, more spending is not automatically better. Before making additional improvements, it may be worth identifying whether they are likely to improve price, shorten market time, reduce buyer objections, or simply make the home look newer.';
    }

    return 'Your answers suggest that price, timing, effort, and certainty may not all point in the same direction. That is normal. The goal is not to find a universally “best” way to sell—it is to compare the tradeoffs and choose the strategy that best fits your property and your life.';
  }

  function shouldOfferInsight(question) {
    return question.id === 'priority' && !state.insightShown;
  }

  function showPatternOffer(nextStep) {
    const insight = buildPatternInsight();
    questionArea.classList.remove('is-visible');
    questionArea.innerHTML = `
      <div class="pattern-offer">
        <div class="question-number">I noticed a possible tradeoff</div>
        <h2>Can I share something worth considering?</h2>
        <p>This is not a prediction or a conclusion about your property. It is a general planning point based on the answers you have given so far.</p>
        <div class="pattern-actions">
          <button type="button" class="btn btn-gold" id="showInsightButton">Yes, share it</button>
          <button type="button" class="btn decision-back" id="skipInsightButton">Keep going</button>
        </div>
      </div>
    `;
    requestAnimationFrame(() => questionArea.classList.add('is-visible'));

    document.getElementById('showInsightButton').addEventListener('click', () => {
      state.insightShown = true;
      questionArea.innerHTML = `
        <div class="pattern-reveal">
          <span>Something worth testing</span>
          <p>${insight}</p>
          <small>This is general educational guidance. Your property, neighborhood, costs, financing, and current market conditions would need to be verified before acting on it.</small>
          <button type="button" class="btn btn-gold" id="continueAfterInsight">That helps—keep going</button>
        </div>
      `;
      document.getElementById('continueAfterInsight').addEventListener('click', () => {
        addInsightHistory(insight);
        nextStep();
      });
    });

    document.getElementById('skipInsightButton').addEventListener('click', () => {
      state.insightShown = true;
      nextStep();
    });
  }

  function chooseAnswer(question, value) {
    const answer = labelFor(question, value);
    const reply = question.reply(value);
    state.answers[question.id] = value;
    addHistory(question.prompt, answer, reply);

    const advance = () => {
      questionArea.innerHTML = `<div class="thinking-message"><span></span><span></span><span></span><p>Thinking through what you shared...</p></div>`;
      setTimeout(() => {
        state.step += 1;
        if (state.step >= questions.length) showResults();
        else renderQuestion();
      }, 650);
    };

    if (shouldOfferInsight(question)) showPatternOffer(advance);
    else advance();
  }

  function buildResults() {
    const a = state.answers;
    const flexible = ['later', 'unsure'].includes(a.timeline);
    const needsWork = ['cosmetic', 'repairs', 'unknown'].includes(a.condition);
    const coordinatedMove = ['before', 'after', 'same', 'unsure'].includes(a.nextHome);

    let summary = 'You are not simply deciding whether to sell. You are balancing timing, preparation, and what you want the move to accomplish.';
    if (a.stage === 'exploring') summary = 'You are still in the information-gathering stage, which may give you room to compare options before making commitments.';
    if (a.stage === 'ready') summary = 'You appear ready to move from thinking into planning. The next step is to test your priorities against the property, current market, and likely net outcome.';

    const standout = [];
    if (flexible) standout.push('You are not under immediate time pressure. That may allow you to compare value, timing, and personal fit rather than reacting to a deadline.');
    else standout.push('Your timeline is close enough that a simple preparation plan may help prevent rushed or unnecessary decisions.');
    if (a.priority === 'price') standout.push('Price is your leading priority, so preparation and market positioning may deserve more attention than convenience alone.');
    if (['simple', 'stress'].includes(a.priority)) standout.push('A smooth, predictable process matters to you. That should influence which improvements you consider and which offer terms you value.');
    if (a.priority === 'speed') standout.push('Speed matters, but the plan should still compare the value of certainty against any price or flexibility you may be giving up.');

    const considerations = [];
    if (needsWork) considerations.push('Do not assume every repair or update will pay for itself. Start by identifying items that may affect buyer confidence, financing, insurability, safety, or first impressions.');
    else considerations.push('Because the home is already in good condition, avoid assuming that additional improvements are necessary without comparing their cost and likely market effect.');
    if (coordinatedMove) considerations.push('The timing of your next home may affect financing, contingencies, possession, carrying costs, and how much certainty you need from a buyer.');
    if (a.reason === 'downsize') considerations.push('Think beyond square footage. Maintenance, accessibility, monthly cost, location, and lifestyle may matter more than simply buying a smaller home.');
    if (a.reason === 'financial') considerations.push('Focus on estimated net proceeds after costs and risks, not just a possible list price.');
    considerations.push('The highest offer is not always the strongest overall outcome. Terms, certainty, timing, costs, and the buyer’s ability to perform may materially change the result.');

    const resultQuestions = [
      'What does the next chapter need to provide that this home no longer does?',
      'What would make you regret selling too soon—or waiting too long?',
      needsWork ? 'Which improvements might buyers reward in your specific market, and what evidence supports that?' : 'Is there anything you would change only because you assume buyers expect it?',
      coordinatedMove ? 'What is the backup plan if the sale and next purchase do not line up perfectly?' : 'How much flexibility do you have on timing and possession?'
    ];

    let next = 'Start with two verified estimates: a realistic current market-value range and an estimated net-proceeds range after selling costs. Then compare those figures with what you want your next move to accomplish.';
    if (a.concern === 'repairs') next = 'Before hiring contractors, get a property-specific walkthrough and separate safety, financing, and buyer-confidence issues from optional cosmetic projects. Then compare cost, delay, and likely market benefit.';
    if (a.concern === 'timing') next = 'Map out three possible timelines—soon, later this year, and next year—and note the personal, financial, and market assumptions behind each one.';
    if (a.concern === 'buySell') next = 'Ask a lender and real estate advisor to outline the buy-first, sell-first, and coordinated-close options using your actual financing, equity, and risk tolerance.';
    if (a.concern === 'process') next = 'Ask for a plain-English walkthrough from preparation through closing, including costs, contingencies, disclosures, and the decisions that become difficult to reverse once the home is listed.';

    return { summary, standout, considerations, questions: resultQuestions, next };
  }

  function showResults() {
    const results = buildResults();
    conversationScreen.hidden = true;
    resultScreen.hidden = false;
    restartButton.hidden = false;
    progressBar.style.width = '100%';
    progressText.textContent = 'You made it. Here is what stands out.';

    document.getElementById('resultSummary').textContent = results.summary;
    document.getElementById('resultStandout').innerHTML = results.standout.map(item => `<p>${item}</p>`).join('');
    document.getElementById('resultConsiderations').innerHTML = results.considerations.map(item => `<li>${item}</li>`).join('');
    document.getElementById('resultQuestions').innerHTML = results.questions.map(item => `<li>${item}</li>`).join('');
    document.getElementById('resultNext').textContent = results.next;

    const subject = encodeURIComponent('A second opinion about selling');
    const body = encodeURIComponent(`Hi Russell,\n\nI used the Decision Center and would like to talk through my situation.\n\nMy biggest concern is: ${labelFor(questions.find(q => q.id === 'concern'), state.answers.concern)}.\n\nThanks,`);
    document.getElementById('emailRussell').href = `mailto:russ@praterco.com?subject=${subject}&body=${body}`;
    resultScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function restart() {
    state.step = 0;
    state.answers = {};
    state.history = [];
    state.insightShown = false;
    startScreen.hidden = false;
    conversationScreen.hidden = true;
    resultScreen.hidden = true;
    restartButton.hidden = true;
    conversationHistory.innerHTML = '';
    progressBar.style.width = '8%';
    progressText.textContent = 'Choose a place to start';
    feedbackResponse.hidden = true;
    startScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.querySelector('[data-path="sell"]').addEventListener('click', () => {
    startScreen.hidden = true;
    conversationScreen.hidden = false;
    restartButton.hidden = false;
    renderQuestion();
  });

  backButton.addEventListener('click', () => {
    if (state.step === 0) return;
    state.step -= 1;
    const question = questions[state.step];
    delete state.answers[question.id];
    while (state.history.length && state.history[state.history.length - 1].type === 'insight') state.history.pop();
    state.history.pop();
    if (question.id === 'priority') state.insightShown = false;
    renderHistory();
    renderQuestion();
  });

  restartButton.addEventListener('click', restart);

  document.querySelectorAll('.feedback-button').forEach(button => {
    button.addEventListener('click', () => {
      feedbackResponse.hidden = false;
      feedbackResponse.textContent = button.dataset.feedback === 'yes'
        ? 'I am really glad. The goal is to help you think more clearly before anyone asks you to make a decision.'
        : 'Thank you for being honest. That feedback helps make this more useful. Please tell Russell what you were hoping to learn when you reach out.';
    });
  });
})();