/* - - Draw All Shapes - - */

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);
}

/* - - Draw - - */
function draw() {
  background('blue');

  // Draw shapes
  fill('red');
  stroke('green');
  strokeWeight(10);
  ellipse(100, 100, 50, 50); // Circle
  rect(200, 100, 60, 60);    // Rectangle
  triangle(300, 140, 330, 100, 360, 140); // Triangle
  quad(400, 100, 450, 100, 470, 140, 430, 140); // Quadrilateral
  arc(550, 120, 80, 80, 0, PI); // Arc
  line(650, 100, 700, 140); // Line
  point(750, 120); // Point
}

// function: window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
