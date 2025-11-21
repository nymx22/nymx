import { domReady } from './lib/utils.js';
import { initWindowManager } from './lib/windowManager.js';
import { initDesktopLogic } from './lib/desktop/desktopLogic.js';
import { attachInteractions } from './lib/interactions.js';
import { bootstrapDesktopUI } from './ui/desktop.js';
import { GlitchEngine } from './lib/glitchEngine.js';
import { randomizeBgColor } from './lib/desktop/bgcolor.js';
import { initHumanoidGlow } from './lib/desktop/glow.js';
import { initWeldingSparks } from './lib/desktop/sparks.js';
import { initCustomCursor } from './lib/desktop/cursor.js';

domReady(() => {
  bootstrapDesktopUI();
  initWindowManager();
  initDesktopLogic();
  attachInteractions();
  
  // Initialize glitch system with dat.GUI
  const glitchEngine = new GlitchEngine();
  glitchEngine.init();
  
  // Randomize background color from humanoid GIF
  randomizeBgColor();
  
  // Initialize humanoid glow effect
  initHumanoidGlow();
  
  // Initialize welding sparks effect
  initWeldingSparks();
  
  // Initialize custom animated cursor
  initCustomCursor();
});
