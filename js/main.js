import { domReady } from './lib/utils.js';
import { initWindowManager } from './lib/windowManager.js';
import { initDesktopLogic } from './lib/desktopLogic.js';
import { attachInteractions } from './lib/interactions.js';
import { bootstrapDesktopUI } from './ui/desktop.js';

domReady(() => {
  bootstrapDesktopUI();
  initWindowManager();
  initDesktopLogic();
  attachInteractions();
});
