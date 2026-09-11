/**
 * Neuria OS - Terminal App
 */
class TerminalApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.history = [];
    this.historyIndex = -1;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="terminal-body">
        <div class="terminal-banner">
          NEURIA SECURE TERMINAL [v3.8.4-OS]<br>
          (c) 2026 Neuria Security Systems & Ian Silva Mota Longo.<br>
          Digite <span class="highlight">help</span> para ver os comandos disponíveis.
        </div>
        <div class="terminal-output" id="term-output"></div>
        <div class="terminal-prompt-line">
          <span class="prompt-user">ian@neuria-os</span>:<span class="prompt-dir">~</span>$
          <input type="text" class="term-input" id="term-input" autocomplete="off" spellcheck="false">
        </div>
      </div>
    `;

    this.output = document.getElementById("term-output");
    this.input = document.getElementById("term-input");

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = this.input.value.trim();
        if (val) {
          this.history.push(val);
          this.historyIndex = this.history.length;
          this.exec(val);
        } else {
          this.printLine("");
        }
        this.input.value = "";
        if (window.soundEngine) window.soundEngine.playClick();
      } else if (e.key === "ArrowUp") {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = "";
        }
        e.preventDefault();
      }
    });

    this.container.addEventListener("click", () => {
      this.input.focus();
    });
  }

  printLine(html) {
    const div = document.createElement("div");
    div.className = "term-line";
    div.innerHTML = html;
    this.output.appendChild(div);
    this.output.scrollTop = this.output.scrollHeight;
  }

  exec(cmdStr) {
    const raw = cmdStr.trim();
    this.printLine(`<span class="prompt-user">ian@neuria-os</span>:<span class="prompt-dir">~</span>$ ${raw}`);
    const parts = raw.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        this.printLine(`
          <div class="help-grid">
            <div><span class="highlight">help</span> - Lista de comandos</div>
            <div><span class="highlight">whoami</span> - Dados do desenvolvedor</div>
            <div><span class="highlight">projects</span> - Ver portfólio</div>
            <div><span class="highlight">security</span> - Diagnóstico de segurança</div>
            <div><span class="highlight">vault</span> - Abrir cofre confidencial</div>
            <div><span class="highlight">skills</span> - Tecnologias dominadas</div>
            <div><span class="highlight">cat ideia.txt</span> - Ler documento confidencial</div>
            <div><span class="highlight">date</span> - Data e hora do sistema</div>
            <div><span class="highlight">reboot</span> - Reiniciar sequência de segurança</div>
            <div><span class="highlight">clear</span> - Limpar ecrã</div>
          </div>
        `);
        break;

      case "whoami":
        this.printLine(`
          <strong>Ian Silva Mota Longo</strong><br>
          Perfil: Dev | Designer | Criador<br>
          Lema: "Transformo ideias em soluções."<br>
          Status: <span class="status-online">ONLINE // DISPONÍVEL PARA PROJETOS</span>
        `);
        break;

      case "security":
        this.printLine(`
          [NEURIA SECURITY PROTOCOL STATUS]<br>
          Instalação: RADAR SECURE FACILITY<br>
          Nível de Encriptação: Quantum Lattice 512-bit<br>
          Integridade do Core: 100% SECURE<br>
          Conexão: Hub Central RADAR ativo
        `);
        break;

      case "vault":
        if (window.openWindow) window.openWindow("win-vault");
        this.printLine("A iniciar Neuria Vault...");
        break;

      case "projects":
        this.printLine(`
          1. <strong>Neuria OS</strong> - Sistema Operacional Web em Glassmorphism<br>
          2. <strong>Radar Intelligence Hub</strong> - Monitorização e infraestrutura<br>
          3. <strong>Confidential Vault</strong> - Cofre com tipografia CifraHacker<br>
          4. <strong>Nexus Platform</strong> - Plataforma de microsserviços modernos
        `);
        break;

      case "skills":
        this.printLine(`
          Linguagens: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3<br>
          Frameworks: React, Node.js, Express, TailwindCSS<br>
          Ferramentas: Docker, Git, Netlify, Linux, Web Audio
        `);
        break;

      case "cat":
        if (args[0] === "ideia.txt" || args[0] === "ideia") {
          this.printLine(`
            <span class="warning">[DOCUMENTO CONFIDENCIAL ABERTO]</span><br>
            "This document is confidential!<br>
            Not read if you are not an admin or have authorization for it!<br>
            Only AI has permission to read, its an exception!"<br>
            <em>Código de acesso: <strong>RADAR</strong> ou <strong>NEURIA2026</strong></em>
          `);
        } else {
          this.printLine(`cat: ${args[0] || "ficheiro"}: Ficheiro não encontrado`);
        }
        break;

      case "date":
        this.printLine(new Date().toString());
        break;

      case "reboot":
        this.printLine("A reiniciar sequência de introdução...");
        setTimeout(() => {
          if (window.restartBootSequence) window.restartBootSequence();
        }, 600);
        break;

      case "clear":
        this.output.innerHTML = "";
        break;

      default:
        this.printLine(`Comando desconhecido: ${cmd}. Digite <span class="highlight">help</span>.`);
        break;
    }
  }
}
window.TerminalApp = TerminalApp;
