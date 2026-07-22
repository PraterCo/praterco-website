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
    history: []
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
        downsize: 'Downsizing is rarely just about square footage. It is usually about making life simpler, lowering responsibility, or creating more flexibility.',
        life: 'Life changes can make timing feel urgent even when the real estate decision still needs to be handled carefully.',
        financial: 'Understood. When finances are part of the decision, net proceeds and timing usually matter more than the headline sale price.',
        investment: 'That makes sense. With an investment property, the best decision often comes down to return, tax considerations, and what the capital could do elsewhere.',
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
        later: 'That flexibility is valuable. You can make choices based on what creates the best outcome instead of reacting to a deadline.',
        unsure: 'Perfectly okay. Not having a fixed timeline often gives you more options, not fewer.'
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
        mostly: 'That is a strong place to be. Usually the question becomes which small improvements are actually worth doing.',
        cosmetic: 'Good news: cosmetic work usually gives you options. The key is not spending money where buyers will not reward it.',
        repairs: 'That does not automatically mean you need to fix everything. It means the sale strategy should account for cost, time, risk, and the likely buyer pool.',
        unknown: 'That is common. Homeowners often know how the house feels to live in but not how buyers will view it.'
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
        price: 'That is helpful. Maximizing price usually means being deliberate about preparation, positioning, and how much uncertainty you are willing to accept.',
        simple: 'That is a valid priority. The highest number is not always the best outcome if getting there creates more work, delay, or risk than you want.',
        stress: 'Understood. A predictable plan and clear communication may matter more to you than squeezing every last dollar out of the sale.',
        speed: 'That makes sense. Speed can be valuable, but it is worth separating a genuinely time-sensitive move from a desire to simply get the process over with.',
        balance: 'That is where most people land. The real decision is how to balance price, timing, effort, and certainty in a way that fits your life.'
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
        before: 'That is one of the biggest planning decisions in the entire process. Financing, contingency strength, and temporary housing options all matter here.',
        after: 'That can reduce financial risk, though it may create a gap between homes. It is worth planning for both the ideal outcome and the backup plan.',
        same: 'Coordinating both sides is possible, but it works best when expectations and fallback options are clear before the home goes on the market.',
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
    state.history.push({ question, answer, reply });
    renderHistory();
  }

  function renderHistory() {
    conversationHistory.innerHTML = state.history.map(item => `
      <div class="conversation-exchange">
        <div class="user-answer">${item.answer}</div>
        <div class="advisor-reply"><span>Russell's perspective</span><p>${item.reply}</p></div>
      </div>
    `).join('');
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

  function chooseAnswer(question, value) {
    const answer = labelFor(question, value);
    const reply = question.reply(value);
    state.answers[question.id] = value;
    addHistory(question.prompt, answer, reply);
    questionArea.innerHTML = `<div class="thinking-message"><span></span><span></span><span></span><p>Thinking through what you shared...</p></div>`;
    setTimeout(() => {
      state.step += 1;
      if (state.step >= questions.length) showResults();
      else renderQuestion();
    }, 650);
  }

  function buildResults() {
    const a = state.answers;
    const flexible = ['later', 'unsure'].includes(a.timeline);
    const needsWork = ['cosmetic', 'repairs', 'unknown'].includes(a.condition);
    const coordinatedMove = ['before', 'after', 'same', 'unsure'].includes(a.nextHome);

    let summary = 'You are not simply deciding whether to sell. You are balancing timing, preparation, and what you want the move to accomplish.';
    if (a.stage === 'exploring') summary = 'You are still in the information-gathering stage, which is a good position to be in. You have room to compare options before making commitments.';
    if (a.stage === 'ready') summary = 'You appear ready to move from thinking into planning. The best next step is to turn your priorities into a clear sale strategy.';

    const standout = [];
    if (flexible) standout.push('You are not under immediate time pressure. That gives you the ability to make decisions based on value and fit rather than urgency.');
    else standout.push('Your timeline is close enough that a simple preparation plan would help prevent rushed or unnecessary decisions.');
    if (a.priority === 'price') standout.push('Price is your leading priority, so preparation and market positioning deserve more attention than convenience alone.');
    if (['simple', 'stress'].includes(a.priority)) standout.push('A smooth, predictable process matters to you. That should influence which improvements you make and which offer terms you value.');
    if (a.priority === 'speed') standout.push('Speed matters, but the best plan should still protect you from giving up value unnecessarily.');

    const considerations = [];
    if (needsWork) considerations.push('Do not assume every repair or update will pay for itself. Start with the items that affect buyer confidence, financing, or first impressions.');
    else considerations.push('Because the home is already in good condition, avoid over-improving it simply because you are preparing to sell.');
    if (coordinatedMove) considerations.push('The timing of your next home may affect financing, contingencies, possession, and how much certainty you need from a buyer.');
    if (a.reason === 'downsize') considerations.push('Think beyond square footage. Maintenance, accessibility, monthly cost, location, and lifestyle may matter more than simply buying a smaller home.');
    if (a.reason === 'financial') considerations.push('Focus on estimated net proceeds after costs, not just a possible list price.');
    considerations.push('The best offer is not always the highest offer. Certainty, timing, and the buyer’s ability to perform can materially change the outcome.');

    const questions = [
      'What does the next chapter need to provide that this home no longer does?',
      'What would make you regret selling too soon—or waiting too long?',
      needsWork ? 'Which improvements would buyers actually reward in your specific market?' : 'Is there anything you would change only because you think buyers expect it?',
      coordinatedMove ? 'What is the backup plan if the sale and next purchase do not line up perfectly?' : 'How much flexibility do you have on timing and possession?'
    ];

    let next = 'Start with two numbers: a realistic range for the home’s current market value and an estimated net proceeds figure after selling costs. Then compare those numbers with what you want your next move to accomplish.';
    if (a.concern === 'repairs') next = 'Before hiring contractors, walk through the home with a market-focused professional and separate must-address items from cosmetic choices and low-return projects.';
    if (a.concern === 'timing') next = 'Map out three possible timelines—soon, later this year, and next year—and note what improves or becomes harder in each scenario.';
    if (a.concern === 'buySell') next = 'Have a lender and real estate advisor outline the buy-first, sell-first, and coordinated-close options before you commit to one path.';
    if (a.concern === 'process') next = 'Ask for a plain-English walkthrough of the process from preparation through closing, including the decisions that cannot easily be undone once the home is listed.';

    return { summary, standout, considerations, questions, next };
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
    state.history.pop();
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