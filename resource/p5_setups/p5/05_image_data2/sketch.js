let img;
let gridSize = 50; // Number of rows and columns
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
  background('black');

  let tileSize = canvasSize/gridSize;
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the brightness value of the pixel at (x, y)
      let i = (y * img.width + x) * 4;
      let r = img.pixels[i]; // Assuming grayscale, so use the red value
     // r = max(0, (r - 5) / (255 - 10) * 250); // darken the shadow, increasing the contrast
     r = r / 255 * 220; // decrease the brightness

      let circleSize = r/255*tileSize;

      fill('white');
    //  stroke('black');
    noStroke();
     // strokeWeight(2);
    //  rect(x * tileSize + tileSize/2, y * tileSize + tileSize/2, circleSize*20, circleSize*.6);
    //  rect(x * tileSize + circleSize/2, y * tileSize + circleSize/2, circleSize*20, circleSize);
    //rect(x * tileSize , y * tileSize + circleSize/2, circleSize*30, circleSize*1.2);
      rect(x * tileSize , y * tileSize - circleSize/2, tileSize, circleSize);

    }
  }
}
