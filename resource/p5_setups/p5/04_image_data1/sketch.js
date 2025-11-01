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
  background(255);

  let tileSize = canvasSize/gridSize;
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the brightness value of the pixel at (x, y)
      let i = (y * img.width + x) * 4;
      let r = img.pixels[i]; // Assuming grayscale, so use the red value
      // let g = img.pixels[i+1];
      // let b = img.pixels[i+2];
      // let a = img.pixels[i+3];



      // // Processing Example 1
      // r = max(0, (r - 125) / (255 - 125) * 255);
      
      // // Processing Example 2
      // r = r / 255 * 200;

      // // Processing Example 3 (Threshold)
      // if (r > 128) {
      //   r = 255;
      // } else {
      //   r = 0;
      // }

      // // Processing Example 3 (Threshold) alt
      // r = r > 128 ? 255 : 0;
      
      // // Processing Example 4 (invert)
      // r = 255 - r;
      
      // // Processing Example 5 (posterize)
      // let levels = 4; // Number of posterization levels
      // r = int(r / (255 / levels)) * (255 / levels);

      // // Processing Example 6 (brightness)
      // r = constrain(r * 1.5, 0, 255); // Clamp between 0 and 255

      // // Processing Example 7 (color mapping)
      // let colorValue = map(r, 0, 255, 0, 360); // Map brightness to a hue value
      // fill(color(colorValue, 100, 100)); // Use HSB color mode for colorizing
      
      // // Processing Example 8 (edge detection)
      // let neighborIndex = ((y + 1) * img.width + x) * 4; // Downwards neighbor
      // let neighborR = img.pixels[neighborIndex];
      // r = abs(r - neighborR);

      // Draw the tile
      fill(r);
      strokeWeight(2);
      rect(x * tileSize, y * tileSize, tileSize, tileSize);
      
      // Write the brightness value in the center of the tile
      fill(255-r);
      textSize(16);
      textAlign(CENTER, CENTER);
      text(int(r), x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
    }
  }
}
