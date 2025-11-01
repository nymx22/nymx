let song;
let amp; // amplitude analyzer
let circleSize = 100;

let audioStarted = false; // Track whether audio has started

function preload() {
  // Load the audio file
  song = loadSound('audio.mp3');
}

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize amplitude analyzer
  amp = new p5.Amplitude();
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

  // Get the current amplitude (volume level) and map it to the circle size
  let volume = amp.getLevel();
  let circleSize = map(volume, 0, 1, 50, 500);
  
  // Draw circle in the center
  fill('red');
  stroke('green');
  strokeWeight(10);
  ellipse(width / 2, height / 2, circleSize, circleSize);
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
