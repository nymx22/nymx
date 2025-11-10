/* - - Minimalist Telephone Pole Scene - - */

let params = {
  numPoles: 2,
  depth: 0,  // Controls perspective/depth (0-100)
  wireSag: 0,  // Controls wire sag/curve (0-100, 0 = straight, 100 = maximum sag)
  sineWavePeriod: 0,  // Length of one horizontal sine wave period (in number of poles, 1-10)
  sineWavePeriodVertical: 0,  // Length of one vertical sine wave period (in number of poles, 1-10)
  pixelation: 0,  // Pixelation effect (0-100, 0 = no pixelation, 100 = maximum)
  digitalNoise: 0,  // Digital noise intensity (0-100, 0 = no noise, 100 = maximum)
  noiseSpeed: 5,  // Noise animation speed (0-100, 0 = slow, 100 = fast)
};

let gui;
let poles = [];
let pixelBuffer; // Buffer for pixelation effect
let noiseTexturePool;

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize pixel buffer
  pixelBuffer = createGraphics(width, height);
  noiseTexturePool = new NoiseTexturePool();
  noiseTexturePool.build(1);
  
  // Create GUI sliders
  gui = new dat.GUI();
  let polesController = gui.add(params, 'numPoles', 2, 10).step(1).name('count');
  let depthController = gui.add(params, 'depth', 0, 100).name('depth');
  let wireSagController = gui.add(params, 'wireSag', 0, 100).name('sag');
  let sineWaveController = gui.add(params, 'sineWavePeriod', 0, 10).step(0.5).name('x sine');
  let sineWaveVerticalController = gui.add(params, 'sineWavePeriodVertical', 0, 10).step(0.5).name('y sine');
  let pixelationController = gui.add(params, 'pixelation', 0, 50).name('pixel');

  let noiseFolder = gui.addFolder('noise');
  noiseFolder.add(params, 'digitalNoise', 0, 100).name('level');
  noiseFolder.add(params, 'noiseSpeed', 0, 50).name('speed');
  noiseFolder.open();
  
  // Regenerate poles when sliders change
  polesController.onChange(() => generatePoles());
  depthController.onChange(() => generatePoles());
  sineWaveController.onChange(() => generatePoles());
  sineWaveVerticalController.onChange(() => generatePoles());
  // Wire sag, pixelation, and digital noise don't need regeneration, just redraws
  
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

/* - - Draw Digital Noise (Broken TV Screen) - - */
function drawDigitalNoise() {
  let noiseIntensity = map(params.digitalNoise, 0, 100, 0, 1);
  if (noiseIntensity <= 0) {
    return;
  }

  let noiseSpeed = map(params.noiseSpeed, 0, 50, 0.001, 2); // 0.001 = extremely slow

  if (noiseTexturePool) {
    noiseTexturePool.update(noiseIntensity, noiseSpeed);
    noiseTexturePool.draw({ intensity: noiseIntensity, stretch: true, alphaScale: 255 });
  }

  // Use speed to control animation - faster speed = more frequent updates
  let timeFactor = floor(frameCount * noiseSpeed * 0.1);

  // Horizontal scan line glitches (broken TV lines)
  let numScanLines = noiseIntensity * 8; // Up to 8 glitched scan lines
  randomSeed(timeFactor + 1000); // Different seed for scan lines
  for (let i = 0; i < numScanLines; i++) {
    if (random() < noiseIntensity) {
      let glitchY = random(height);
      let glitchWidth = random(1, 4);

      strokeWeight(glitchWidth);
      randomSeed(timeFactor + i * 100); // Different pattern per line
      for (let x = 0; x < width; x += 2) {
        let brightness = random() > 0.5 ? 255 : 0;
        stroke(brightness, 180 * noiseIntensity);
        line(x, glitchY, x + 2, glitchY);
      }
    }
  }

  // Vertical interference bars (TV signal interference)
  randomSeed(timeFactor + 2000); // Different seed for bars
  if (random() < noiseIntensity * 0.2) {
    let barX = random(width);
    let barWidth = random(2, 10);
    let barHeight = random(height * 0.3, height);
    let barY = random(height - barHeight);

    for (let y = barY; y < barY + barHeight; y += 2) {
      randomSeed(timeFactor + y * 10); // Different pattern per row
      for (let x = barX; x < barX + barWidth; x++) {
        let brightness = random() > 0.5 ? 255 : 0;
        fill(brightness, 150 * noiseIntensity);
        rect(x, y, 1, 2);
      }
    }
  }

  // Random horizontal bands of static
  randomSeed(timeFactor + 3000); // Different seed for bands
  if (random() < noiseIntensity * 0.3) {
    let bandY = random(height);
    let bandHeight = random(5, 15);
    noStroke();
    for (let y = bandY; y < bandY + bandHeight; y++) {
      randomSeed(timeFactor + y * 5); // Different pattern per row
      for (let x = 0; x < width; x += 2) {
        let brightness = random() > 0.5 ? 255 : 0;
        fill(brightness, 120 * noiseIntensity);
        rect(x, y, 2, 1);
      }
    }
  }
}

/* - - Main Draw Loop - - */
function draw() {
  let pixelationAmount = map(params.pixelation, 0, 50, 0, 1);
  
  // If pixelation is enabled, draw to buffer first
  if (pixelationAmount > 0) {
    // Calculate pixelation size (larger = more pixelated)
    // Map from 1.0 (very pixelated) to 0.1 (no pixelation)
    let pixelSize = map(pixelationAmount, 0, 1, 1.0, 0.1);
    let bufferWidth = Math.floor(width * pixelSize);
    let bufferHeight = Math.floor(height * pixelSize);
    
    // Resize buffer if needed
    if (!pixelBuffer || pixelBuffer.width !== bufferWidth || pixelBuffer.height !== bufferHeight) {
      pixelBuffer = createGraphics(bufferWidth, bufferHeight);
    }
    
    // Draw scene to buffer at smaller resolution
    pixelBuffer.background(240);
    
    // Draw wires to buffer
    let sagNormalized = map(params.wireSag, 0, 50, 0, 1);
    for (let i = 0; i < poles.length - 1; i++) {
      let pole1 = poles[i];
      let pole2 = poles[i + 1];
      let points1 = pole1.getWirePoints();
      let points2 = pole2.getWirePoints();
      for (let j = 0; j < 3; j++) {
        let wire = new Wire(points1[j], points2[j], sagNormalized);
        pixelBuffer.stroke(40);
        pixelBuffer.strokeWeight(3 * pixelSize);
        pixelBuffer.noFill();
        if (wire.sag === 0) {
          pixelBuffer.line(wire.start.x * pixelSize, wire.start.y * pixelSize, 
                          wire.end.x * pixelSize, wire.end.y * pixelSize);
        } else {
          pixelBuffer.beginShape();
          pixelBuffer.vertex(wire.start.x * pixelSize, wire.start.y * pixelSize);
          let midX = ((wire.start.x + wire.end.x) / 2) * pixelSize;
          let midY = ((wire.start.y + wire.end.y) / 2) * pixelSize;
          let wireLength = dist(wire.start.x, wire.start.y, wire.end.x, wire.end.y);
          let maxSagAmount = wireLength * 0.15;
          let sagAmount = maxSagAmount * wire.sag * pixelSize;
          pixelBuffer.quadraticVertex(midX, midY + sagAmount, 
                                    wire.end.x * pixelSize, wire.end.y * pixelSize);
          pixelBuffer.endShape();
        }
      }
    }
    
    // Draw poles to buffer
    for (let pole of poles) {
      pole.displayOnBuffer(pixelBuffer, pixelSize);
    }
    
    // Draw buffer to main canvas with no smoothing (pixelated look)
    noSmooth();
    image(pixelBuffer, 0, 0, width, height);
    smooth(); // Re-enable smoothing for other effects
  } else {
    // No pixelation - draw normally
    background(240);
    drawWires();
    for (let pole of poles) {
      pole.display();
    }
  }
  
  // Apply digital noise on top
  drawDigitalNoise();
}

/* - - Handle Window Resize - - */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePoles(); // Regenerate poles with new dimensions
  if (noiseTexturePool) {
    noiseTexturePool.handleResize();
  }
}

