'use strict';

// Placeholder content — replace with final copy.
const QUESTIONS = [
  'I can name my partner’s closest friends.',
  'I know what is stressing my partner out right now.',
  'I know which home-cooked meal my partner would choose for their birthday.',
  'I could describe my partner’s dream holiday in detail.',
  'I know which family traditions matter most to my partner.',
  'I know my partner’s biggest fear.',
  'I know how my partner likes to be comforted after a hard day.',
  'I could name a song that always puts my partner in a good mood.',
  'I know what my partner considers their greatest accomplishment.',
  'I know my partner’s main goals for the next five years.',
  'I know what my partner would do with an unexpected free day.',
  'I know who my partner looked up to growing up.',
  'I know exactly how my partner takes their coffee.',
  'I know which household chore my partner dislikes most.',
  'I know which relatives my partner finds easiest to spend time with.',
  'I know the values my partner would never compromise on.',
  'I remember what we talked about on our first date.',
  'I know what makes my partner feel most appreciated.',
  'I know what my partner is most looking forward to this year.',
  'I know a dream my partner has shared with very few people.',
];

// Bands are matched in order; the first whose `min` is <= score wins.
const RESULT_BANDS = [
  {
    min: 15,
    title: ['You know them ', 'by heart', '.'],
    summary:
      'Placeholder result copy. You pay close attention to your partner’s inner world — their worries, hopes and everyday preferences. That kind of knowledge is the foundation of a strong, close relationship.',
    tips: [
      'Keep asking open-ended questions — people change, and so do their answers.',
      'Share one thing you learned about them recently and why it stuck with you.',
      'Plan a small surprise built around something only you would know.',
    ],
  },
  {
    min: 8,
    title: ['You’re ', 'getting there', '.'],
    summary:
      'Placeholder result copy. You know a lot about your partner, but there are still a few corners of their world left to explore. Curiosity is the easiest gift you can give each other.',
    tips: [
      'Pick two statements you answered “false” to and ask about them tonight.',
      'Swap phones for one dinner a week and just talk.',
      'Ask about their day with a follow-up question, not just “how was it?”',
    ],
  },
  {
    min: 0,
    title: ['Time to ', 'get curious', '.'],
    summary:
      'Placeholder result copy. There’s plenty you haven’t discovered about your partner yet — and that’s good news. Every question you ask is a chance to feel closer.',
    tips: [
      'Take the quiz together and talk through each statement.',
      'Ask your partner to tell you a story from their childhood.',
      'Set aside twenty distraction-free minutes each day to catch up.',
    ],
  },
];

const ANSWER_TRUE = 'true';

const getBand = (score) => RESULT_BANDS.find((band) => score >= band.min) ?? RESULT_BANDS.at(-1);

const countTrue = (answers) => answers.filter((answer) => answer === ANSWER_TRUE).length;

// Title parts are [before, emphasised, after]; built with DOM nodes so copy can never inject markup.
const renderTitle = (element, [before = '', emphasis = '', after = '']) => {
  const em = document.createElement('em');
  em.textContent = emphasis;
  element.replaceChildren(before, em, after);
};

const animateIn = (element) => {
  element.classList.remove('is-entering');
  // Force reflow so the animation restarts on every question.
  void element.offsetWidth;
  element.classList.add('is-entering');
};

const initNav = () => {
  const toggle = document.querySelector('.site-nav__toggle');
  const menu = document.getElementById('site-nav-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    toggle.focus();
  });
};

// Placeholder: only updates the label. Replace with navigation to the real locale route.
const initLangSwitch = () => {
  const root = document.querySelector('.lang-switch');
  const trigger = root?.querySelector('.lang-switch__trigger');
  const menu = root?.querySelector('.lang-switch__menu');
  const current = root?.querySelector('.lang-switch__current');
  if (!trigger || !menu || !current) return;

  const options = [...menu.querySelectorAll('.lang-switch__option')];

  const setOpen = (open) => {
    trigger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };

  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) menu.querySelector('[aria-current="true"]')?.focus();
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((item) => item.removeAttribute('aria-current'));
      option.setAttribute('aria-current', 'true');
      current.textContent = option.textContent;
      setOpen(false);
      trigger.focus();
    });
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menu.hidden) return;
    // Close only this menu, not the surrounding mobile nav.
    event.stopPropagation();
    setOpen(false);
    trigger.focus();
  });

  // Close when keyboard focus moves elsewhere. A null relatedTarget (e.g. Safari mouse clicks) is left to the click handler.
  root.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !root.contains(event.relatedTarget)) setOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) setOpen(false);
  });
};

const initQuiz = () => {
  const el = {
    intro: document.getElementById('quiz-intro'),
    start: document.getElementById('quiz-start'),
    stage: document.getElementById('quiz-stage'),
    form: document.getElementById('quiz-form'),
    question: document.getElementById('quiz-question'),
    progress: document.getElementById('quiz-progress'),
    progressLabel: document.getElementById('quiz-progress-label'),
    error: document.getElementById('quiz-error'),
    back: document.getElementById('quiz-back'),
    nextLabel: document.getElementById('quiz-next-label'),
    result: document.getElementById('quiz-result'),
    resultTitle: document.getElementById('quiz-result-title'),
    score: document.getElementById('quiz-score'),
    scoreTotal: document.getElementById('quiz-score-total'),
    summary: document.getElementById('quiz-result-summary'),
    tips: document.getElementById('quiz-result-tips'),
    share: document.getElementById('quiz-share'),
    shareStatus: document.getElementById('quiz-share-status'),
    retake: document.getElementById('quiz-retake'),
  };

  if (Object.values(el).some((node) => !node) || QUESTIONS.length === 0) return;

  const total = QUESTIONS.length;
  const state = {
    index: 0,
    answers: new Array(total).fill(null),
  };

  const getSelectedAnswer = () => el.form.elements.answer.value || null;

  const setSelectedAnswer = (value) => {
    el.form.querySelectorAll('input[name="answer"]').forEach((input) => {
      input.checked = input.value === value;
    });
  };

  const clearError = () => {
    el.error.textContent = '';
  };

  const showSection = (section) => {
    [el.intro, el.stage, el.result].forEach((node) => {
      node.hidden = node !== section;
    });
    section.scrollIntoView({ block: 'start' });
  };

  const renderQuestion = () => {
    const { index, answers } = state;
    const isLast = index === total - 1;

    el.question.textContent = QUESTIONS[index];
    el.progress.max = total;
    el.progress.value = index + 1;
    el.progressLabel.textContent = `Question ${index + 1} of ${total}`;
    el.back.disabled = index === 0;
    el.nextLabel.textContent = isLast ? 'See my result' : 'Next';

    setSelectedAnswer(answers[index]);
    clearError();
    animateIn(el.form);
    el.question.focus({ preventScroll: true });
  };

  const renderResult = () => {
    const score = countTrue(state.answers);
    const band = getBand(score);

    renderTitle(el.resultTitle, band.title);
    el.score.textContent = String(score);
    el.scoreTotal.textContent = `out of ${total}`;
    el.summary.textContent = band.summary;
    el.tips.replaceChildren(
      ...band.tips.map((tip) => {
        const li = document.createElement('li');
        li.textContent = tip;
        return li;
      }),
    );
    el.shareStatus.textContent = '';

    showSection(el.result);
    animateIn(el.result);
    el.resultTitle.focus({ preventScroll: true });
  };

  const start = () => {
    state.index = 0;
    state.answers.fill(null);
    showSection(el.stage);
    renderQuestion();
  };

  el.start.addEventListener('click', start);
  el.retake.addEventListener('click', start);

  el.form.addEventListener('change', clearError);

  el.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const answer = getSelectedAnswer();
    if (!answer) {
      el.error.textContent = 'Please choose True or False to continue.';
      el.form.querySelector('input[name="answer"]').focus();
      return;
    }

    state.answers[state.index] = answer;

    if (state.index === total - 1) {
      renderResult();
      return;
    }

    state.index += 1;
    renderQuestion();
  });

  el.back.addEventListener('click', () => {
    if (state.index === 0) return;

    // Keep the current choice so going back never loses progress.
    state.answers[state.index] = getSelectedAnswer();
    state.index -= 1;
    renderQuestion();
  });

  initShare(el.share, el.shareStatus);

  el.start.disabled = false;
};

const initShare = (button, status) => {
  const shareData = {
    title: document.title,
    text: 'How well do you know your partner? Take the quiz:',
    url: window.location.href,
  };

  const canShare = 'share' in navigator && (!navigator.canShare || navigator.canShare(shareData));
  const canCopy = 'clipboard' in navigator && window.isSecureContext;
  if (!canShare && !canCopy) return;

  button.hidden = false;
  if (!canShare) button.textContent = 'Copy quiz link';

  button.addEventListener('click', async () => {
    status.textContent = '';

    try {
      if (canShare) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      status.textContent = 'Link copied to your clipboard.';
    } catch (error) {
      // User dismissing the share sheet is not an error worth reporting.
      if (error?.name === 'AbortError') return;
      status.textContent = 'Sorry, sharing isn’t available right now.';
    }
  });
};

const initFooterYear = () => {
  const year = document.getElementById('footer-year');
  if (year) year.textContent = String(new Date().getFullYear());
};

initNav();
initLangSwitch();
initQuiz();
initFooterYear();
