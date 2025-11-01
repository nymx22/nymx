/* - - Ellipse with GUI Controls - - */

let params = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fill: [255, 0, 0],
  stroke: "#008000",
  strokeWeight: 10,
  classSize: 15,
};

let gui;

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create GUI
  gui = new dat.GUI();
  gui.add(params, 'x', -500, 500);
  gui.add(params, 'y', -500, 500);
  gui.add(params, 'width', 10, 1000);
  gui.add(params, 'height', 10, 1000);
  gui.addColor(params, 'fill');
  gui.addColor(params, 'stroke');
  gui.add(params, 'strokeWeight', 0, 20);
  gui.add(params, 'classSize', 0, 16);

  // // Add Folders
  // var folder1 = gui.addFolder('FolderNameA');
  // folder1.add(params, 'x', -500, 500);
  // folder1.add(params, 'y', -500, 500);

  // // Add Buttons
  // gui.add({ Randomize: randomizeParams }, "Randomize").name("Randomize");

}

/* - - Draw - - */
function draw() {
  background('blue');

  fill(params.fill);
  stroke(params.stroke);
  strokeWeight(params.strokeWeight + params.classSize);
  ellipse(windowWidth/2+params.x, windowHeight/2+params.y, params.width, params.height);
}

// function: window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
