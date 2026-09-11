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
  const trackLabel = document.getElementById('spotify-track');
  const progressLabel = document.getElementById('spotify-progress');
  const playButton = document.querySelector('.music-play');
  const loginButton = document.getElementById('spotify-login');
  let spotifyClientId = localStorage.getItem('spotify_client_id') || 'COLOCA_AQUI_O_CLIENT_ID';
  const spotifyRedirectUri = `${window.location.origin}${window.location.pathname}`;
  const spotifyScope = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  let spotifyToken = sessionStorage.getItem('spotify_access_token');
  let spotifyPlaying = false;

  const base64UrlEncode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  async function createChallenge() {
    const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(64)));
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    sessionStorage.setItem('spotify_code_verifier', verifier);
    return base64UrlEncode(digest);
  }
  async function connectSpotify() {
    if (spotifyClientId === 'COLOCA_AQUI_O_CLIENT_ID') {
      window.location.assign('spotify-setup.html');
      return;
    }
    if (window.location.protocol === 'file:') {
      trackLabel.textContent = 'Precisa de servidor local';
      progressLabel.textContent = 'OAuth não funciona com file://';
      return;
    }
    const challenge = await createChallenge();
    const params = new URLSearchParams({ client_id: spotifyClientId, response_type: 'code', redirect_uri: spotifyRedirectUri, code_challenge_method: 'S256', code_challenge: challenge, scope: spotifyScope });
    window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
  }
  async function exchangeSpotifyCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const verifier = sessionStorage.getItem('spotify_code_verifier');
    if (!code || !verifier) return;
    const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: spotifyClientId, grant_type: 'authorization_code', code, redirect_uri: spotifyRedirectUri, code_verifier: verifier }) });
    if (!response.ok) throw new Error('Falha na autenticação Spotify');
    const token = await response.json();
    spotifyToken = token.access_token;
    sessionStorage.setItem('spotify_access_token', spotifyToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  async function spotifyRequest(path, options = {}) {
    if (!spotifyToken) return null;
    const response = await fetch(`https://api.spotify.com/v1${path}`, { ...options, headers: { Authorization: `Bearer ${spotifyToken}`, ...(options.headers || {}) } });
    if (response.status === 204) return null;
    if (response.status === 401) { spotifyToken = null; sessionStorage.removeItem('spotify_access_token'); throw new Error('Sessão Spotify expirada'); }
    if (!response.ok) throw new Error('Spotify indisponível');
    return response.json();
  }
  async function updateSpotifyTrack() {
    if (!spotifyToken) { trackLabel.textContent = 'Spotify desligado'; progressLabel.textContent = 'Liga para mostrar o que estás a ouvir'; loginButton.textContent = 'Ligar conta'; return; }
    try {
      const playback = await spotifyRequest('/me/player');
      const item = playback?.item;
      if (!item) { trackLabel.textContent = 'Nada a tocar'; progressLabel.textContent = 'Abre o Spotify para começar'; return; }
      trackLabel.innerHTML = `${item.artists.map(artist => artist.name).join(', ')} <em>- ${item.name}</em>`;
      spotifyPlaying = Boolean(playback.is_playing);
      progressLabel.textContent = spotifyPlaying ? 'A tocar agora' : 'Pausado';
      playButton.textContent = spotifyPlaying ? 'Ⅱ' : '▶';
      playButton.setAttribute('aria-label', spotifyPlaying ? 'Pausar' : 'Tocar');
      loginButton.textContent = 'Atualizar';
    } catch (error) {
      trackLabel.textContent = 'Spotify desligado';
      progressLabel.textContent = error.message;
    }
  }
  async function controlSpotify(action) {
    if (!spotifyToken) { await connectSpotify(); return; }
    try {
      if (action === 'toggle') await spotifyRequest(spotifyPlaying ? '/me/player/pause' : '/me/player/play', { method: 'PUT' });
      if (action === 'next') await spotifyRequest('/me/player/next', { method: 'POST' });
      if (action === 'previous') await spotifyRequest('/me/player/previous', { method: 'POST' });
      setTimeout(updateSpotifyTrack, 400);
    } catch (error) { progressLabel.textContent = error.message; }
  }
  document.querySelectorAll('[data-track-action]').forEach(control => {
    control.addEventListener('click', event => {
      event.stopPropagation();
      controlSpotify(control.dataset.trackAction);
    });
  });
  loginButton.addEventListener('click', event => { event.stopPropagation(); connectSpotify(); });
  exchangeSpotifyCode().then(updateSpotifyTrack).catch(error => { progressLabel.textContent = error.message; });
  if (new URLSearchParams(window.location.search).get('spotify-connect') === '1' && spotifyClientId !== 'COLOCA_AQUI_O_CLIENT_ID') connectSpotify();
  setInterval(updateSpotifyTrack, 15000);
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
