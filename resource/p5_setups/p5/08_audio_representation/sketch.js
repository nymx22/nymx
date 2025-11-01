let song;
let fft;
let numDots = 50;
let dotData = []; // Store data for each dot

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



  // Visualize the pre-calculated data as dots
  let dotSpacing = width / numDots;
  
  for (let i = 0; i < numDots; i++) {
    let dotSize = dotData[i]; // Get the pre-stored size for each dot
    fill('red');
    stroke('green');
    strokeWeight(10);
    ellipse(i * dotSpacing + dotSpacing / 2, height / 2, dotSize, dotSize);
  }
}

// Function: Analyze the song in 10 static segments
function analyzeSong() {
  let totalDuration = song.duration();
  
  for (let i = 0; i < numDots; i++) {
    // Calculate the start and end of each segment of the song
    let startTime = (i * totalDuration) / numDots;
    let endTime = ((i + 1) * totalDuration) / numDots;
    
    // Temporarily load the part of the song into the FFT analyzer
    song.play(startTime, endTime - startTime); 
    
    // Analyze spectrum for this segment
    let spectrum = fft.analyze();
    
    // Calculate average frequency value for this segment
    let avgFreqValue = 0;
    for (let j = 0; j < spectrum.length; j++) {
      avgFreqValue += spectrum[j];
    }
    avgFreqValue /= spectrum.length;
    
    // Map the average frequency value to dot size and store it
    let dotSize = map(avgFreqValue, 0, 255, 10, 100);
    dotData.push(dotSize); // Store calculated size
  }
  
  song.stop(); // Stop the song after analysis
}


// Start audio and analysis when the user clicks
function mousePressed() {
  if (!audioStarted) {
    // song.play();
    analyzeSong();
    audioStarted = true;
  }
}

// function: window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
