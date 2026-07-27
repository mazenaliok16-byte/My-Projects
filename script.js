const feedback = document.getElementById('feedback');
const commentList = document.getElementById('comment-list');
const COMMENTS_STORAGE_KEY = 'mzx-portfolio-comments';
const defaultComments = [];

function loadMessages() {
  try {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!stored) return defaultComments.slice();
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to read saved comments:', error);
  }
  return defaultComments.slice();
}

function saveMessages(messages) {
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('Unable to save comments:', error);
  }
}

const INTRO_STORAGE_KEY = 'mzx-intro-seen';

function shouldShowIntro() {
  return !localStorage.getItem(INTRO_STORAGE_KEY);
}

function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch (error) {
    console.warn('Unable to save intro seen state:', error);
  }
}

function hideIntroOverlay() {
  const intro = document.querySelector('.site-intro');
  if (!intro) return;
  intro.classList.add('hidden');
  setTimeout(() => {
    if (intro.parentNode) intro.parentNode.removeChild(intro);
  }, 1000);
}

function redirectToHome() {
  if (window.location.pathname.toLowerCase().endsWith('index.html')) {
    window.location.href = 'home.html';
  }
}

window.addEventListener('load', () => {
  const intro = document.querySelector('.site-intro');
  if (!intro) return;

  if (!shouldShowIntro()) {
    redirectToHome();
    return;
  }

  markIntroSeen();
  intro.style.pointerEvents = 'none';

  setTimeout(() => {
    hideIntroOverlay();
  }, 3000);

  setTimeout(() => {
    redirectToHome();
  }, 3400);
});

if ('serviceWorker' in navigator) {
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (window.location.protocol === 'https:' || isLocalHost) {
    window.addEventListener('load', () => {
      const workerUrl = new URL('./service-worker.js', window.location.href);

      navigator.serviceWorker.register(workerUrl.pathname, { scope: './' }).then((registration) => {
        console.log('Service worker registered successfully', registration.scope);
      }).catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
    });
  }
}

function renderMessages(messages) {
  if (!commentList) return;
  commentList.innerHTML = '';
  messages.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'comment-card';
    article.innerHTML = `
      <strong>${item.name}</strong>
      <p>${item.message}</p>
    `;
    commentList.appendChild(article);
  });
}

const projectsShell = document.querySelector('.projects-shell');
const progressBar = document.getElementById('timeline-progress');
const timelineRail = document.querySelector('.timeline-rail');
const timelineItems = document.querySelectorAll('.timeline-item');
const startDot = document.querySelector('.timeline-start-dot');
const projectCta = document.querySelector('.project-cta');

function updateTimelineProgress() {
  if (!projectsShell || !progressBar || !timelineRail) return;

  const railRect = timelineRail.getBoundingClientRect();
  const shellRect = projectsShell.getBoundingClientRect();
  const shellTop = shellRect.top + window.scrollY;
  const scrollY = window.scrollY;

  progressBar.style.top = '0px';

  let targetTop = railRect.height;
  if (projectCta) {
    const ctaRect = projectCta.getBoundingClientRect();
    targetTop = Math.min(railRect.height, Math.max(0, ctaRect.top - railRect.top - 24));
  }

  if (timelineItems.length) {
    const firstDot = timelineItems[0].querySelector('.timeline-dot');
    if (firstDot) {
      const firstDotTop = firstDot.getBoundingClientRect().top - railRect.top + firstDot.getBoundingClientRect().height / 2;
      targetTop = Math.min(targetTop, Math.max(0, firstDotTop));
    }
  }

  const startScroll = shellTop - window.innerHeight * 0.2;
  const endScroll = shellTop + 120;

  if (scrollY <= startScroll) {
    progressBar.style.height = '0px';
    return;
  }

  const progressFactor = Math.min(1, Math.max(0, (scrollY - startScroll) / Math.max(1, endScroll - startScroll)));
  const currentHeight = progressFactor * Math.max(0, targetTop);
  progressBar.style.height = `${currentHeight}px`;
}

function updateTimelineDots() {
  if (!timelineRail || !progressBar || !timelineItems.length) return;

  const railRect = timelineRail.getBoundingClientRect();
  const progressBottom = progressBar.getBoundingClientRect().bottom - railRect.top;

  if (startDot) {
    startDot.classList.toggle('is-lit', progressBottom >= 0);
  }

  timelineItems.forEach((item) => {
    const dot = item.querySelector('.timeline-dot');
    if (!dot) return;

    const itemRect = item.getBoundingClientRect();
    const dotTop = itemRect.top - railRect.top + itemRect.height / 2;
    dot.style.top = `${Math.round(dotTop)}px`;
    item.classList.toggle('is-lit', progressBottom >= dotTop);
  });
}

if (timelineItems.length && progressBar) {
  window.addEventListener('scroll', () => {
    updateTimelineProgress();
    updateTimelineDots();
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateTimelineProgress();
    updateTimelineDots();
  });

  updateTimelineProgress();
  updateTimelineDots();
}

if (feedback && commentList) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const isCommentsPage = window.location.pathname.toLowerCase().includes('comments');
  const savedMessages = loadMessages();

  if (isCommentsPage) {
    renderMessages(savedMessages);
  }
}
