let bgImg;
let bgDrawW;
let bgDrawH;
let bgDrawX;
let bgDrawY;

let cx = 500;
let cy = 500;
let angle = 0;
let birdScale = 0.654;

// Per-part rotations (radians)
let leftWingAngle = 0;
let bodyAngle = 0;
let tailAngle = 0;
let headAngle = 0;
let rightWingUpperAngle = 0;
let rightWingMidAngle = 0;
let rightWingLowerAngle = 0;

function preload() {
  bgImg = loadImage('./IMG_0222.jpg');
}

function setup() {
  createCanvas(1000, 1000);

  const scale = Math.min(width / bgImg.width, height / bgImg.height);
  bgDrawW = bgImg.width * scale;
  bgDrawH = bgImg.height * scale;
  bgDrawX = (width - bgDrawW) / 2;
  bgDrawY = (height - bgDrawH) / 2;
}

function draw() {
  background(255);
  tint(255, 255, 255, 90);
  //image(bgImg, bgDrawX, bgDrawY, bgDrawW, bgDrawH);
  noTint();
  // Optional per-part angles: pass {} or omit last arg to use globals above.
  drawBird(cx, cy, angle, birdScale, {
    leftWingAngle: -0.0,
  });
}

function mousePressed() {
  console.log(mouseX + ',' + mouseY);
}

function drawBird(cx, cy, angle, s, pose = {}) {
  const {
    leftWingAngle: lw = leftWingAngle,
    bodyAngle: ba = bodyAngle,
    tailAngle: ta = tailAngle,
    headAngle: ha = headAngle,
    rightWingUpperAngle: rwu = rightWingUpperAngle,
    rightWingMidAngle: rwm = rightWingMidAngle,
    rightWingLowerAngle: rwl = rightWingLowerAngle,
  } = pose;
  void ta;

  push();
  translate(cx, cy);
  rotate(angle);
  scale(s);

  // Left wing (joint near -143, -115)
  push();
  translate(-143, -115);
  rotate(lw);
  noStroke();
  fill(255);
  triangle(-213, -127, 49, -45, 0, 0);
  triangle(49, -45, 0, 0, 143, 115);
  stroke(0);
  line(49, -45, 143, 115);
  line(-213, -127, 49, -45);
  noStroke();
  fill(0);
  triangle(-213, -127, 39, -38, 0, 0);
  triangle(39, -38, 0, 0, 143, 115);
  pop();

  // Body (joint at 0,0)
  push();
  translate(0, 0);
  rotate(ba);
  noStroke();
  fill(0);
  triangle(0, 0, -205, 28, 35, 58);
  triangle(0, 0, 189, 81, 35, 58);
  fill(255);
  stroke(0);
  triangle(-69, 31.5, -6, 16.5, 12, 43.5);
  pop();

  // Head (joint near 189,81)
  push();
  translate(189, 81);
  rotate(ha);
  noStroke();
  fill(0);
  triangle(-33, -5, 0, 0, 60, 94);
  pop();

  // Right wing upper portion (joint near 189,81)
  push();
  translate(189, 81);
  rotate(rwu);
  noStroke();
  fill(0);
  triangle(-38, 154, 29, 152, -11, 288);
  pop();

  // Right wing middle portion (joint at 35,58)
  push();
  translate(35, 58);
  rotate(rwm);
  noStroke();
  fill(0);
  triangle(0, 0, 94, 178, 195, 177);
  fill(255);
  stroke(0);
  triangle(0, 0, 99, 121.5, 195, 177);
  pop();

  // Right wing lower portion (joint at 129,236)
  push();
  translate(129, 236);
  rotate(rwl);
  noStroke();
  fill(255);
  stroke(0);
  triangle(34, 9.5, 66, 9.5, 50, 82.5);
  pop();
  // Joint debug points
  push();
  noStroke();
  fill(0, 120, 255);
  const jointSize = 8;
  circle(-143, -115, jointSize); // left wing joint
  circle(0, 0, jointSize); // body joint
  circle(189, 81, jointSize); // head + right upper wing joint
  circle(35, 58, jointSize); // right middle wing joint
  circle(129, 236, jointSize); // right lower wing joint
  pop();

  pop();
}
