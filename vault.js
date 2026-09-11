/**
 * Neuria OS - Confidential Archive & Vault App
 * Uses CifraHacker font and secret document unlocking
 */

class VaultApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.unlocked = false;
    this.crypted = true;
    this.init();
  }

  init() {
    this.renderLockScreen();
  }

  renderLockScreen() {
    this.container.innerHTML = `
      <div class="vault-wrapper">
        <div class="vault-card">
          <div class="vault-shield-icon">
            <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="#00d2ff" stroke-width="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h2 class="vault-title">NEURIA ARCHIVE CONFIDENCIAL</h2>
          <p class="vault-subtitle">Inserção de código de autorização de segurança</p>

          <div class="vault-input-group">
            <input type="password" id="vault-code-input" class="vault-input" placeholder="Insira o Código de Acesso..." maxlength="16" autocomplete="off">
            <button id="vault-submit-btn" class="vault-btn">AUTORIZAR</button>
          </div>
          <div id="vault-feedback" class="vault-feedback"></div>

          <div class="vault-hints">
            <span>Dica de Protocolo: <strong>RADAR</strong> ou <strong>NEURIA2026</strong></span>
          </div>

          <div class="vault-reference-grid">
            <div class="vault-ref-item">
              <span class="ref-tag">BLUEPRINT DA SALA</span>
              <img src="assets/images/radar_board.png" alt="Radar Board" class="ref-thumb">
            </div>
            <div class="vault-ref-item">
              <span class="ref-tag">TELA DE SEGURANÇA</span>
              <img src="assets/images/tela_codigo.png" alt="Tela Código" class="ref-thumb">
            </div>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById("vault-code-input");
    const btn = document.getElementById("vault-submit-btn");

    const tryAuth = () => {
      const code = input.value.trim().toUpperCase();
      this.authenticate(code);
    };

    btn.addEventListener("click", tryAuth);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryAuth();
    });
  }

  authenticate(code) {
    const feedback = document.getElementById("vault-feedback");
    const input = document.getElementById("vault-code-input");
    const validCodes = ["RADAR", "NEURIA2026", "1337", "ADMIN", "NEURIA"];

    if (validCodes.includes(code)) {
      if (window.soundEngine) window.soundEngine.playSecurityGranted();
      feedback.className = "vault-feedback success";
      feedback.innerHTML = "✓ CÓDIGO ACEITE: ACESSO DE NÍVEL 5 CONCEDIDO";
      setTimeout(() => {
        this.renderUnlockedScreen();
      }, 700);
    } else {
      if (window.soundEngine) window.soundEngine.playAccessDenied();
      feedback.className = "vault-feedback error";
      feedback.innerHTML = `
        <div class="denied-container">
          <img src="assets/images/acesso_negado.png" alt="Acesso Negado" class="denied-icon">
          <span>✕ ACESSO NEGADO // CÓDIGO INVÁLIDO</span>
        </div>
      `;
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 500);
    }
  }

  renderUnlockedScreen() {
    this.container.innerHTML = `
      <div class="vault-unlocked">
        <div class="unlocked-header">
          <div class="unlocked-badge">
            <img src="assets/images/tela_desbloqueada.png" alt="Desbloqueado" class="unlocked-img-badge">
            <div>
              <h3 style="font-size: 15px; color: #fff;">SISTEMA DESBLOQUEADO // NEURIA ARCHIVE</h3>
              <p style="font-size: 12px; color: #00d2ff;">Ficheiro: <code>ideia.txt</code> | Classificação: SECRETO</p>
            </div>
          </div>
          <button id="toggle-cifra-btn" class="vault-btn-secondary">VER EM TEXTO NORMAL</button>
        </div>

        <div class="secret-doc-container">
          <div class="doc-meta">
            <span>DOCUMENT_ID: NAI-SEC-2026-X</span>
            <span>CLEARED FOR: IAN SILVA MOTA LONGO & AI SYSTEM</span>
          </div>

          <div id="secret-text" class="secret-text cifra-active">
This document its confidencial!
Not read if you are a admin our have autorization for it!
Only IA have a permision to read, its a exception!

[NEURIA CORE DIRECTIVE]
RADAR facility established as secure operational node.
All client systems operating under active defense parameters.
Interface verified and synchronized.
          </div>
        </div>

        <div class="vault-actions" style="margin-top: 14px; display: flex; justify-content: flex-end;">
          <button id="vault-relock-btn" class="vault-btn-secondary">Bloquear Novamente</button>
        </div>
      </div>
    `;

    const toggleBtn = document.getElementById("toggle-cifra-btn");
    const secretText = document.getElementById("secret-text");
    const relockBtn = document.getElementById("vault-relock-btn");

    toggleBtn.addEventListener("click", () => {
      this.crypted = !this.crypted;
      if (this.crypted) {
        secretText.classList.add("cifra-active");
        toggleBtn.textContent = "VER EM TEXTO NORMAL";
      } else {
        secretText.classList.remove("cifra-active");
        toggleBtn.textContent = "ATIVAR CIFRA HACKER";
      }
      if (window.soundEngine) window.soundEngine.playClick();
    });

    relockBtn.addEventListener("click", () => {
      this.renderLockScreen();
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }
}

window.VaultApp = VaultApp;
