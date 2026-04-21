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

function preload() {
  bgImg = loadImage('./IMG_0222.jpg');
}

function setup() {
  createCanvas(1600, 1000);

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
  void cx;
  void cy;
  void angle;
  void s;
  void pose;

  // Raw triangles, degrouped and renamed
  const t1 = { fill: [255], stroke: false, pivot: [-356, -242], pts: [-356, -242, -94, -160, -143, -115] };
  const t2 = { fill: [255], stroke: false, pivot: [-94, -160], pts: [-94, -160, -143, -115, 0, 0] };
  const t3 = { fill: [0], stroke: false, pivot: [-356, -242], pts: [-356, -242, -104, -153, -143, -115] };
  const t4 = { fill: [0], stroke: false, pivot: [-104, -153], pts: [-104, -153, -143, -115, 0, 0] };
  const t5 = { fill: [0], stroke: false, pivot: [0, 0], pts: [0, 0, -205, 28, 35, 58] };
  const t6 = { fill: [0], stroke: false, pivot: [0, 0], pts: [0, 0, 189, 81, 35, 58] };
  const t7 = { fill: [255], stroke: true, pivot: [-69, 31.5], pts: [-69, 31.5, -6, 16.5, 12, 43.5] };
  const t8 = { fill: [0], stroke: false, pivot: [-33, -5], pts: [-33, -5, 0, 0, 60, 94] };
  const t9 = { fill: [0], stroke: false, pivot: [116, 177], pts: [116, 177, 183, 175, 143, 311] };
  const t10 = { fill: [0], stroke: false, pivot: [0, 0], pts: [0, 0, 94, 178, 195, 177] };
  const t11 = { fill: [255], stroke: true, pivot: [0, 0], pts: [0, 0, 99, 121.5, 195, 177] };
  const t12 = { fill: [255], stroke: true, pivot: [128, 187.5], pts: [128, 187.5, 160, 187.5, 144, 260.5] };

  const triangles = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12];

  // Lay all triangles on one horizontal line, each with pivot at local (0,0).
  const baseY = height * 0.6;
  const startX = 60;
  const spacing = 120;
  const pivotSize = 7;
  const labelOffsetX = 6;
  const labelOffsetY = -6;

  push();
  for (let i = 0; i < triangles.length; i++) {
    const t = triangles[i];
    const [x1, y1, x2, y2, x3, y3] = t.pts;

    const [px, py] = t.pivot;

    push();
    translate(startX + i * spacing, baseY);
    // Keep all triangles unrotated.
    rotate(0);

    if (t.stroke) stroke(0);
    else noStroke();
    fill(...t.fill);
    triangle(x1 - px, y1 - py, x2 - px, y2 - py, x3 - px, y3 - py);

    // Pivot markers: main pivot + other two vertices
    noStroke();
    fill(0, 120, 255);
    circle(0, 0, pivotSize);
    fill(120, 200, 255); // lighter blue
    circle(x2 - px, y2 - py, pivotSize);
    fill(0, 70, 170); // darker blue
    circle(x3 - px, y3 - py, pivotSize);

    // Labels: triangle name + local Cartesian coordinates
    fill(20);
    noStroke();
    textSize(11);
    text(`t${i + 1}(0,0)`, labelOffsetX, labelOffsetY);
    text(
      `t${i + 1}(${(x2 - px).toFixed(1)},${(y2 - py).toFixed(1)})`,
      x2 - px + labelOffsetX,
      y2 - py + labelOffsetY
    );
    text(
      `t${i + 1}(${(x3 - px).toFixed(1)},${(y3 - py).toFixed(1)})`,
      x3 - px + labelOffsetX,
      y3 - py + labelOffsetY
    );
    pop();
  }
  pop();
}
