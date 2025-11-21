import { domReady } from './lib/utils.js';
import { initWindowManager } from './lib/windowManager.js';
import { initDesktopLogic } from './lib/desktopLogic.js';
import { attachInteractions } from './lib/interactions.js';
import { bootstrapDesktopUI } from './ui/desktop.js';
import { GlitchEngine } from './lib/glitchEngine.js';

domReady(() => {
  bootstrapDesktopUI();
  initWindowManager();
  initDesktopLogic();
  attachInteractions();
  
  // Initialize glitch system with dat.GUI
  const glitchEngine = new GlitchEngine();
  glitchEngine.init();
});
