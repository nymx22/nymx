let img;
let gridSize = 20; // Number of rows and columns
let canvasSize = 800;

function preload() {
  img = loadImage('image.png');
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  img.resize(gridSize, gridSize);
  img.loadPixels(); // Load the pixels of the resized image
  noLoop(); // No continuous drawing needed
}

function draw() {
  background('blue');

  let tileSize = canvasSize/gridSize;
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the brightness value of the pixel at (x, y)
      let i = (y * img.width + x) * 4;
      let r = img.pixels[i]; // Assuming grayscale, so use the red value

      let circleSize = r/255*tileSize;

      fill('red');
      stroke('green');
      strokeWeight(2);
      ellipse(x * tileSize + tileSize/2, y * tileSize + tileSize/2, circleSize, circleSize);
    }
  }
}
