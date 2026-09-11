document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('[data-view]');
  const views = document.querySelectorAll('.view');
  const langButton = document.getElementById('lang-toggle-btn');
  const soundButton = document.getElementById('audio-toggle-btn');
  const statusButton = document.getElementById('profile-status-btn');
  const statusLabel = document.getElementById('profile-status');
  const profilePopup = document.getElementById('profile-popup');
  const liveClock = document.getElementById('live-clock');
  const descriptions = { PT: 'Product designer specialising in UI design and design systems.', EN: 'Product designer focused on thoughtful interfaces and design systems.' };
  let language = 'PT';
  let statusOnline = false;
  function updateClock() {
    if (!liveClock) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    liveClock.innerHTML = `<span>${hours}</span><small>:${minutes}</small>`;
    liveClock.setAttribute('aria-label', `${hours} horas e ${minutes} minutos`);
  }
  updateClock();
  setInterval(updateClock, 60000);

  const utilityPanels = [...document.querySelectorAll('.utility-panel')];
  let activeUtility = 0;
  function renderUtility() {
    utilityPanels.forEach((panel, index) => {
      const distance = (index - activeUtility + utilityPanels.length) % utilityPanels.length;
      panel.classList.toggle('is-active', distance === 0);
      panel.classList.toggle('is-next', distance === 1);
      panel.classList.toggle('is-last', distance === 2);
      panel.setAttribute('aria-hidden', String(distance !== 0));
    });
  }
  function rotateUtility() {
    activeUtility = (activeUtility + 1) % utilityPanels.length;
    renderUtility();
  }
  if (utilityPanels.length) {
    renderUtility();
    utilityPanels.forEach(panel => panel.addEventListener('click', rotateUtility));
    setInterval(rotateUtility, 5000);
  }
  function switchView(viewName) {
    views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
    document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  navItems.forEach(item => item.addEventListener('click', event => { event.preventDefault(); switchView(item.dataset.view); }));
  langButton.addEventListener('click', () => { language = language === 'PT' ? 'EN' : 'PT'; langButton.querySelector('.lang-label').textContent = language; document.getElementById('text-desc').textContent = descriptions[language]; });
  soundButton.addEventListener('click', () => soundButton.classList.toggle('muted'));
  statusButton.addEventListener('click', () => {
    const isOpen = !profilePopup.hidden;
    profilePopup.hidden = isOpen;
    statusButton.setAttribute('aria-expanded', String(!isOpen));
  });
  profilePopup.addEventListener('click', event => {
    if (event.target.closest('.popup-action:first-of-type')) {
      statusOnline = !statusOnline;
      statusLabel.textContent = statusOnline ? 'Disponível' : 'Ausente';
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.profile-widget, .profile-popup')) {
      profilePopup.hidden = true;
      statusButton.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      profilePopup.hidden = true;
      statusButton.setAttribute('aria-expanded', 'false');
    }
  });
});
