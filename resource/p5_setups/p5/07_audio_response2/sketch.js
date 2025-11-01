let song;
let fft;
let numDots = 20;
let spectrum;

let audioStarted = false; // Track whether audio has started

/* - - Preload - - */
function preload() {
  // Load the audio file
  song = loadSound('audio.mp3');
}

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize FFT analyzer
  fft = new p5.FFT();
}

/* - - Draw - - */
function draw() {
  background('blue');

  if (!audioStarted) {
    fill('white');
    textAlign('center');
    text("Click to start audio", width / 2, height / 2);
    return; // Don't run the rest of draw until audio has started
  }

  // Get the current frequency spectrum
  spectrum = fft.analyze();

  // Define limits
  let startRatio = 0.1; // Ignore the first part of the spectrum
  let endRatio = 0.7;   // Ignore the last part of the spectrum

  let startIndex = Math.floor(spectrum.length * startRatio);
  let endIndex = Math.floor(spectrum.length * endRatio);
  let usableRange = endIndex - startIndex;

  // Visualize as dots
  let dotSpacing = width / numDots;
  
  for (let i = 0; i < numDots; i++) {
    
    let index = startIndex + Math.floor(i * (usableRange / numDots)); // Map within the range

    let freqValue = spectrum[index]; // Get frequency value for each dot
    let dotSize = map(freqValue, 0, 255, 10, 100); // Map frequency to dot size
    
    fill('red');
    stroke('green');
    strokeWeight(10);
    ellipse(i * dotSpacing + dotSpacing / 2, height / 2, dotSize, dotSize);
  }
}

// Start audio when the user clicks
function mousePressed() {
  if (!audioStarted) {
    song.play();
    audioStarted = true;
  }
}

// function: window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
