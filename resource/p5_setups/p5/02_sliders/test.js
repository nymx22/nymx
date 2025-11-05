/* - - Minimalist Telephone Pole Scene - - */

let params = {
  numPoles: 6,
  depth: 50,  // Controls perspective/depth (0-100)
  wireSag: 50,  // Controls wire sag/curve (0-100, 0 = straight, 100 = maximum sag)
  sineWavePeriod: 4,  // Length of one horizontal sine wave period (in number of poles, 1-10)
  sineWavePeriodVertical: 4,  // Length of one vertical sine wave period (in number of poles, 1-10)
};

let gui;
let poles = [];

/* - - Pole Class - - */
class Pole {
  constructor(x, y, scaleFactor = 1) {
    this.x = x;
    this.y = y;
    this.scale = scaleFactor;
    
    // Base dimensions (will be scaled)
    this.shaftWidth = 10;
    this.shaftHeight = 250;
    this.crossbarWidth = 80;
    this.crossbarHeight = 4;
    this.insulatorWidth = 4;
    this.insulatorHeight = 14;

    
    // Positioning offsets
    this.insulatorMiddleX = 0;
    this.insulatorLeftX = -40;
    this.insulatorRightX = 40;
    this.insulatorY = -260;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    noStroke();
    fill(60); // Dark gray for pole
    
    // 1. Main vertical shaft
    rect(-this.shaftWidth/2, -this.shaftHeight, this.shaftWidth, this.shaftHeight, 2);
    
    // 2. Top crossbar
    fill(80);
    rect(-this.crossbarWidth/2, -this.shaftHeight, this.crossbarWidth, this.crossbarHeight, 2);
    
    // 3. Left insulator arm
    fill(100);
    rect(this.insulatorLeftX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);
    
    // 4. Right insulator arm
    rect(this.insulatorRightX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);
    
    // 5. Middle insulator arm (centered)
    fill(70);
    rect(-this.insulatorWidth/2, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);
    
    pop();
  }

  getWirePoints() {
    // Returns 3 p5.Vector points for wire attachment:
    // 1. Left insulator arm
    // 2. Middle insulator arm
    // 3. Right insulator arm
    return [
      createVector(this.x + this.insulatorLeftX * this.scale, this.y + this.insulatorY * this.scale),
      createVector(this.x + this.insulatorMiddleX * this.scale, this.y + this.insulatorY * this.scale),
      createVector(this.x + this.insulatorRightX * this.scale, this.y + this.insulatorY * this.scale)
    ];
  }
}

/* - - Wire Class - - */
class Wire {
  constructor(startPoint, endPoint, sag = 0) {
    this.start = startPoint;
    this.end = endPoint;
    this.sag = sag; // Sag amount (0-1, normalized from 0-100 slider)
  }

  display() {
    stroke(40);
    strokeWeight(1.5);
    noFill();
    
    if (this.sag === 0) {
      // Straight line when no sag
      line(this.start.x, this.start.y, this.end.x, this.end.y);
    } else {
      // Curved line with sag using quadratic curve
      beginShape();
      vertex(this.start.x, this.start.y);
      
      // Calculate midpoint
      let midX = (this.start.x + this.end.x) / 2;
      let midY = (this.start.y + this.end.y) / 2;
      
      // Calculate wire length and sag amount
      let wireLength = dist(this.start.x, this.start.y, this.end.x, this.end.y);
      let maxSagAmount = wireLength * 0.15; // Maximum sag is 15% of wire length
      let sagAmount = maxSagAmount * this.sag;
      
      // Control point for quadratic curve (below midpoint, creating sag)
      quadraticVertex(midX, midY + sagAmount, this.end.x, this.end.y);
      
      endShape();
    }
  }
}

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create GUI sliders
  gui = new dat.GUI();
  let polesController = gui.add(params, 'numPoles', 2, 10).step(1).name('Number of Poles');
  let depthController = gui.add(params, 'depth', 0, 100).name('Depth');
  let wireSagController = gui.add(params, 'wireSag', 0, 100).name('Wire Sag');
  let sineWaveController = gui.add(params, 'sineWavePeriod', 0, 10).step(0.5).name('Horizontal Sine Period');
  let sineWaveVerticalController = gui.add(params, 'sineWavePeriodVertical', 0, 10).step(0.5).name('Vertical Sine Period');
  
  // Regenerate poles when sliders change
  polesController.onChange(() => generatePoles());
  depthController.onChange(() => generatePoles());
  sineWaveController.onChange(() => generatePoles());
  sineWaveVerticalController.onChange(() => generatePoles());
  // Wire sag doesn't need regeneration, just redraws
  
  // Initialize poles
  generatePoles();
}

/* - - Generate Poles Based on Sliders - - */
function generatePoles() {
  poles = [];
  
  let poleCount = params.numPoles;
  let baseY = height * 0.8; // Position poles at 80% down the screen
  
  // Depth effect: controls how much poles recede
  let depthFactor = map(params.depth, 0, 100, 0, 0.85); // 0 = no depth, 100 = max depth (poles can get very small)
  
  // Sine wave parameters
  let sinePeriodH = params.sineWavePeriod; // Number of poles per complete horizontal sine wave cycle
  let sinePeriodV = params.sineWavePeriodVertical/3; // Number of poles per complete vertical sine wave cycle
  let maxSineAmplitudeH = width * 0.15; // Maximum horizontal offset (will be scaled)
  let sineAmplitudeV = height * 0.1; // Maximum vertical offset (10% of screen height)
  
  // First pass: calculate all positions without scaling to find bounds
  let positions = [];
  let maxSpacing = width / (poleCount + 1); // Base spacing
  
  for (let i = 0; i < poleCount; i++) {
    // Base position along recession line
    let baseX = i * maxSpacing;
    let baseYPos = baseY - i * (height * 0.08 * depthFactor);
    
    // Apply horizontal sine wave offset
    let sineOffsetX = 0;
    if (sinePeriodH > 0) {
      let phaseH = (i / sinePeriodH) * TWO_PI;
      sineOffsetX = sin(phaseH) * maxSineAmplitudeH;
    }
    
    // Apply vertical sine wave offset
    let sineOffsetY = 0;
    if (sinePeriodV > 0) {
      let phaseV = (i / sinePeriodV) * TWO_PI;
      sineOffsetY = sin(phaseV) * sineAmplitudeV;
    }
    
    // Final position
    let x = baseX + sineOffsetX;
    let y = baseYPos + sineOffsetY;
    
    positions.push({ x, y, scaleFactor: map(i, 0, poleCount - 1, 1, 1 - depthFactor) });
  }
  
  // Find bounds
  let minX = Math.min(...positions.map(p => p.x));
  let maxX = Math.max(...positions.map(p => p.x));
  let structureWidth = maxX - minX;
  
  // Calculate padding to keep poles within frame
  let padding = width * 0.1; // 10% padding on each side
  let availableWidth = width - (padding * 2);
  
  // Calculate scale factor if structure is too wide
  let scaleX = 1;
  if (structureWidth > availableWidth) {
    scaleX = availableWidth / structureWidth;
  }
  
  // Calculate offset to center the structure
  let scaledMinX = minX * scaleX;
  let scaledMaxX = maxX * scaleX;
  let scaledWidth = scaledMaxX - scaledMinX;
  let offsetX = (width - scaledWidth) / 2 - scaledMinX;
  
  // Second pass: create poles with scaled and centered positions
  for (let pos of positions) {
    let x = pos.x * scaleX + offsetX;
    let y = pos.y;
    poles.push(new Pole(x, y, pos.scaleFactor));
  }
}

/* - - Draw Wires Between Adjacent Poles - - */
function drawWires() {
  // Normalize sag from 0-100 to 0-1
  let sagNormalized = map(params.wireSag, 0, 100, 0, 1);
  
  for (let i = 0; i < poles.length - 1; i++) {
    let pole1 = poles[i];
    let pole2 = poles[i + 1];
    
    // Get wire attachment points from each pole
    let points1 = pole1.getWirePoints();
    let points2 = pole2.getWirePoints();
    
    // Connect 3 wires between corresponding points
    for (let j = 0; j < 3; j++) {
      let wire = new Wire(points1[j], points2[j], sagNormalized);
      wire.display();
    }
  }
}

/* - - Main Draw Loop - - */
function draw() {
  background(240); // Light gray background
  
  // Draw wires first (so poles appear on top)
  drawWires();
  
  // Draw poles
  for (let pole of poles) {
    pole.display();
  }
}

/* - - Handle Window Resize - - */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePoles(); // Regenerate poles with new dimensions
}
