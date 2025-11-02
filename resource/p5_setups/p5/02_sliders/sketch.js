/* - - Electric Pole Scene with Sliders - - */

let params = {
  polePosition: 50, // Path position (0-100)
  rainAmount: 50,
  birdCount: 3,
  birdsActive: true,
};

let gui;
let birds = [];
let rainParticles = [];
let wireHeights = [];

// 3D Path constants - Diagonal path from back-left to front-right
let PATH_START_X = 0;  // Will be set in setup
let PATH_END_X = 0;
let PATH_START_Z = 0;    // Far
let PATH_END_Z = 100;    // Close
const MIN_SCALE = 0.3;
const MAX_SCALE = 1.5;
let HORIZON_Y = 0;  // Will be set in setup
let FAR_BASE_Y = 0;
let CLOSE_BASE_Y = 0;

// Pole dimensions (base size, will be scaled)
const POLE_WIDTH = 16;
const POLE_HEIGHT = 400;
const CROSSBEAM_WIDTH = 120;
const CROSSBEAM_HEIGHT = 12;
const CROSSBEAM_OFFSET = 50;  // Distance from center to insulator
const INSULATOR_SIZE = 8;

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize path constants based on canvas size
  PATH_START_X = width * 0.2;
  PATH_END_X = width * 0.8;
  HORIZON_Y = height * 0.7;
  FAR_BASE_Y = HORIZON_Y + 50;
  CLOSE_BASE_Y = height - 100;

  // Create GUI
  gui = new dat.GUI();
  gui.add(params, 'polePosition', 0, 100).name('Pole Position (Z-Axis)');
  gui.add(params, 'rainAmount', 0, 100).name('Rain Amount');
  gui.add(params, 'birdCount', 0, 10).step(1).name('Number of Birds');
  gui.add(params, 'birdsActive').name('Birds Active (Flying)');

  // Define wire heights relative to top of pole (will be scaled)
  wireHeights = [50, 100, 150, 200];
  
  // Initialize birds
  initializeBirds();
  
  // Initialize rain particles
  initializeRain();
}

/* - - Calculate Pole Position on 3D Path - - */
function getPolePositionOnPath(sliderValue) {
  // Map slider (0-100) to path parameter t (0-1)
  let t = map(sliderValue, 0, 100, 0, 1);
  
  // Linear interpolation along diagonal path
  let x = lerp(PATH_START_X, PATH_END_X, t);
  let z = lerp(PATH_START_Z, PATH_END_Z, t); // z: 0=far, 100=close
  
  // Calculate scale based on Z depth
  let scale = map(z, PATH_START_Z, PATH_END_Z, MIN_SCALE, MAX_SCALE);
  
  // Calculate base Y position (horizon effect: far objects appear higher)
  let baseY = lerp(FAR_BASE_Y, CLOSE_BASE_Y, t);
  
  return { x, z, scale, baseY, t };
}

/* - - Initialize Birds - - */
function initializeBirds() {
  birds = [];
  for (let i = 0; i < params.birdCount; i++) {
    let wireIndex = floor(random(wireHeights.length));
    birds.push({
      x: random(width),
      wireIndex: wireIndex,
      onWire: !params.birdsActive,
      wingAngle: 0,
      speed: random(2, 4),
      size: random(15, 25)
    });
  }
}

/* - - Initialize Rain - - */
function initializeRain() {
  rainParticles = [];
  for (let i = 0; i < params.rainAmount; i++) {
    rainParticles.push({
      x: random(width),
      y: random(-height, 0),
      speed: random(3, 8),
      length: random(10, 20),
      thickness: random(1, 2)
    });
  }
}

/* - - Calculate Insulator Positions - - */
function calculateInsulatorPositions(perspective) {
  let poleX = perspective.x;
  let poleBaseY = perspective.baseY;
  let scale = perspective.scale;
  
  // Calculate scaled dimensions
  let poleHeight = POLE_HEIGHT * scale;
  let crossbeamHeight = CROSSBEAM_HEIGHT * scale;
  let crossbeamOffset = CROSSBEAM_OFFSET * scale;
  
  // Pole top Y position (above base)
  let poleTopY = poleBaseY - poleHeight;
  
  // Top crossbeam insulator positions
  let topLeftInsulatorX = poleX - crossbeamOffset;
  let topRightInsulatorX = poleX + crossbeamOffset;
  let topInsulatorY = poleTopY + crossbeamHeight/2;
  
  // Bottom crossbeam insulator positions
  let bottomCrossbeamOffset = poleHeight * 0.6; // 60% down the pole
  let bottomCrossbeamY = poleTopY + bottomCrossbeamOffset + crossbeamHeight/2;
  
  // Store insulator positions for wire connections
  perspective.insulators = [
    { x: topLeftInsulatorX, y: topInsulatorY },
    { x: topRightInsulatorX, y: topInsulatorY },
    { x: topLeftInsulatorX, y: bottomCrossbeamY },
    { x: topRightInsulatorX, y: bottomCrossbeamY }
  ];
  
  // Also store other calculated values for use in drawPole
  perspective.poleData = {
    poleX: poleX,
    poleTopY: poleTopY,
    poleHeight: poleHeight,
    scale: scale,
    crossbeamHeight: crossbeamHeight,
    crossbeamOffset: crossbeamOffset,
    bottomCrossbeamOffset: bottomCrossbeamOffset,
    bottomCrossbeamY: bottomCrossbeamY
  };
}

/* - - Draw Electric Pole (Three Parts) - - */
function drawPole(perspective) {
  push();
  noStroke();
  
  let poleX = perspective.x;
  let poleBaseY = perspective.baseY;
  let scale = perspective.scale;
  
  // Calculate scaled dimensions
  let poleWidth = POLE_WIDTH * scale;
  let poleHeight = POLE_HEIGHT * scale;
  let crossbeamWidth = CROSSBEAM_WIDTH * scale;
  let crossbeamHeight = CROSSBEAM_HEIGHT * scale;
  let crossbeamOffset = CROSSBEAM_OFFSET * scale;
  let insulatorSize = INSULATOR_SIZE * scale;
  
  // Pole top Y position (above base)
  let poleTopY = poleBaseY - poleHeight;
  
  // Main vertical pole (rounded rectangle)
  fill(100);
  rect(poleX - poleWidth/2, poleTopY, poleWidth, poleHeight, 4 * scale);
  
  // Top horizontal crossbeam (rounded rectangle)
  fill(120);
  rect(poleX - crossbeamWidth/2, poleTopY, crossbeamWidth, crossbeamHeight, 3 * scale);
  
  // Bottom horizontal crossbeam (second crossbeam, positioned lower)
  let bottomCrossbeamOffset = poleHeight * 0.6; // 60% down the pole
  fill(120);
  rect(poleX - crossbeamWidth/2, poleTopY + bottomCrossbeamOffset, crossbeamWidth, crossbeamHeight, 3 * scale);
  
  // Insulators (small circles at wire connection points)
  fill(200);
  // Use the pre-calculated insulator positions
  if (perspective.insulators && perspective.insulators.length >= 4) {
    ellipse(perspective.insulators[0].x, perspective.insulators[0].y, insulatorSize, insulatorSize);
    ellipse(perspective.insulators[1].x, perspective.insulators[1].y, insulatorSize, insulatorSize);
    ellipse(perspective.insulators[2].x, perspective.insulators[2].y, insulatorSize, insulatorSize);
    ellipse(perspective.insulators[3].x, perspective.insulators[3].y, insulatorSize, insulatorSize);
  }
  
  pop();
}

/* - - Draw Wires (Connected to Pole) - - */
function drawWires(perspective) {
  push();
  stroke(50);
  strokeWeight(2 * perspective.scale);
  
  if (!perspective.insulators || perspective.insulators.length < 4) {
    pop();
    return;
  }
  
  // We have 4 insulators: top-left (0), top-right (1), bottom-left (2), bottom-right (3)
  // Draw 2 wires (one for each crossbeam level)
  
  // Top wire (connects top-left and top-right insulators)
  let topWireY = perspective.insulators[0].y;
  let topLeftX = perspective.insulators[0].x;
  let topRightX = perspective.insulators[1].x;
  line(0, topWireY, topLeftX, topWireY); // Left edge to left insulator
  line(topRightX, topWireY, width, topWireY); // Right insulator to right edge
  
  // Bottom wire (connects bottom-left and bottom-right insulators)
  let bottomWireY = perspective.insulators[2].y;
  let bottomLeftX = perspective.insulators[2].x;
  let bottomRightX = perspective.insulators[3].x;
  line(0, bottomWireY, bottomLeftX, bottomWireY); // Left edge to left insulator
  line(bottomRightX, bottomWireY, width, bottomWireY); // Right insulator to right edge
  
  pop();
}

/* - - Draw Birds - - */
function drawBirds(polePerspective) {
  // Update bird count if changed
  if (birds.length !== params.birdCount) {
    initializeBirds();
  }
  
  // Update bird states based on birdsActive
  for (let bird of birds) {
    if (params.birdsActive) {
      // Birds are flying
      bird.onWire = false;
      bird.x += bird.speed;
      bird.wingAngle += 0.2;
      
      // Reset bird position when it goes off screen
      if (bird.x > width + 50) {
        bird.x = -50;
        bird.y = random(100, height - 100);
      }
      
      // Flapping motion
      if (!bird.y) bird.y = random(100, height - 100);
      bird.y += sin(bird.wingAngle) * 2;
    } else {
      // Birds are perched on wires
      bird.onWire = true;
      // Calculate wire Y based on pole perspective if available
      if (polePerspective && polePerspective.insulators && polePerspective.insulators.length > 0) {
        let wireIndex = min(bird.wireIndex, polePerspective.insulators.length - 1);
        bird.y = polePerspective.insulators[wireIndex].y;
      } else {
        // Fallback to original wire heights
        bird.y = wireHeights[bird.wireIndex] + 100;
      }
      bird.wingAngle = 0;
    }
  }
  
  // Draw each bird
  for (let bird of birds) {
    push();
    translate(bird.x, bird.y);
    
    if (bird.onWire) {
      // Perched bird (simpler shape)
      fill(60);
      // Body (small rectangle)
      rect(-bird.size/2, -5, bird.size, 10, 2);
      // Head (circle)
      ellipse(bird.size/2 + 3, 0, 12, 12);
      // Beak (small triangle)
      fill(180);
      triangle(bird.size/2 + 12, 0, bird.size/2 + 18, -3, bird.size/2 + 18, 3);
    } else {
      // Flying bird (with wings)
      fill(60);
      // Body (rectangle)
      rect(-bird.size/2, 0, bird.size, 8, 2);
      // Head (circle)
      ellipse(bird.size/2 + 3, 0, 12, 12);
      // Wings (triangles that flap)
      let wingOffset = sin(bird.wingAngle) * 8;
      fill(80);
      // Left wing
      triangle(-bird.size/2, 0, -bird.size/2 - 10, wingOffset - 10, -bird.size/2 - 5, wingOffset);
      // Right wing
      triangle(-bird.size/2, 0, -bird.size/2 - 10, -wingOffset - 10, -bird.size/2 - 5, -wingOffset);
      // Beak
      fill(180);
      triangle(bird.size/2 + 12, 0, bird.size/2 + 18, -3, bird.size/2 + 18, 3);
    }
    
    pop();
  }
}

/* - - Draw Rain - - */
function drawRain() {
  // Update rain particle count if changed
  if (rainParticles.length !== params.rainAmount) {
    initializeRain();
  }
  
  push();
  fill(180, 200);
  noStroke();
  
  for (let rain of rainParticles) {
    // Update position
    rain.y += rain.speed;
    
    // Reset when off screen
    if (rain.y > height) {
      rain.y = random(-100, 0);
      rain.x = random(width);
    }
    
    // Draw rain drop (small rectangle)
    rect(rain.x, rain.y, rain.thickness, rain.length, 1);
  }
  
  pop();
}

/* - - Draw - - */
function draw() {
  // Sky gradient background (grayscale)
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(180), color(220), inter);
    stroke(c);
    line(0, i, width, i);
  }
  
  // Calculate pole position and perspective from slider
  let polePerspective = getPolePositionOnPath(params.polePosition);
  
  // Calculate insulator positions (needed for both wires and pole)
  calculateInsulatorPositions(polePerspective);
  
  // Draw wires first (so pole appears on top)
  drawWires(polePerspective);
  
  // Draw electric pole
  drawPole(polePerspective);
  
  // Draw rain
  if (params.rainAmount > 0) {
    drawRain();
  }
  
  // Draw birds
  if (params.birdCount > 0) {
    drawBirds(polePerspective);
  }
}

// function: window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Update path constants for new canvas size
  PATH_START_X = width * 0.2;
  PATH_END_X = width * 0.8;
  HORIZON_Y = height * 0.7;
  FAR_BASE_Y = HORIZON_Y + 50;
  CLOSE_BASE_Y = height - 100;
}
