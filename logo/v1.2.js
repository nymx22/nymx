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
let joinAnalysis = null;

const JOIN_OPTIONS = {
  rotationMode: 'exactEdge', // 'exactEdge' | 'step15'
  angleStepDeg: 15,
  epsilon: 1.5,
  lengthEpsilon: 1.0,
  directionCosThreshold: -0.985, // closer to -1 means stricter opposite direction
};

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
  joinAnalysis = analyzeTriangleJoins(getRawTriangles(), JOIN_OPTIONS);
  console.log('Join analysis:', joinAnalysis.summary);
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

  drawJoinSummary(joinAnalysis);
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
  const transforms = triangles.map(() => ({
    tx: 0,
    ty: 0,
    rot: 0,
  }));

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
    const tr = transforms[i];
    const [x1, y1, x2, y2, x3, y3] = t.pts;

    const [px, py] = t.pivot;

    push();
    translate(startX + i * spacing + tr.tx, baseY + tr.ty);
    rotate(tr.rot);

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

function getRawTriangles() {
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
  return [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12];
}

function triangleLocalVertices(triangle) {
  const [x1, y1, x2, y2, x3, y3] = triangle.pts;
  const [px, py] = triangle.pivot;
  return [
    { x: x1 - px, y: y1 - py },
    { x: x2 - px, y: y2 - py },
    { x: x3 - px, y: y3 - py },
  ];
}

function getTriangleEdges(vertices) {
  return [
    { a: vertices[0], b: vertices[1], vA: 0, vB: 1 },
    { a: vertices[1], b: vertices[2], vA: 1, vB: 2 },
    { a: vertices[2], b: vertices[0], vA: 2, vB: 0 },
  ];
}

function rotatePoint(pt, rot) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return { x: pt.x * c - pt.y * s, y: pt.x * s + pt.y * c };
}

function transformPoint(pt, transform) {
  const r = rotatePoint(pt, transform.rot);
  return { x: r.x + transform.tx, y: r.y + transform.ty };
}

function pointDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function edgeLength(edge) {
  return pointDistance(edge.a, edge.b);
}

function edgeDirection(edge) {
  const dx = edge.b.x - edge.a.x;
  const dy = edge.b.y - edge.a.y;
  const mag = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / mag, y: dy / mag };
}

function edgeAngle(edge) {
  return Math.atan2(edge.b.y - edge.a.y, edge.b.x - edge.a.x);
}

function normalizeAngle(rad) {
  let a = rad;
  while (a <= -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

function closestStepAngle(targetRad, stepDeg) {
  const step = (Math.PI / 180) * stepDeg;
  const k = Math.round(targetRad / step);
  return k * step;
}

function getRotationCandidates(edgeA, edgeB, options) {
  // Opposite alignment means B edge direction should map to A reversed direction.
  const exact = normalizeAngle(edgeAngle({ a: edgeA.b, b: edgeA.a }) - edgeAngle(edgeB));
  if (options.rotationMode === 'step15') {
    return [closestStepAngle(exact, options.angleStepDeg || 15)];
  }
  return [exact];
}

function testEdgeJoin(edgeA, edgeB, options) {
  const lenA = edgeLength(edgeA);
  const lenB = edgeLength(edgeB);
  if (Math.abs(lenA - lenB) > options.lengthEpsilon) return null;

  const rots = getRotationCandidates(edgeA, edgeB, options);
  for (const rot of rots) {
    // Enforce opposite direction alignment using cosine similarity.
    const dirA = edgeDirection(edgeA);
    const dirBRot = edgeDirection({
      a: rotatePoint(edgeB.a, rot),
      b: rotatePoint(edgeB.b, rot),
    });
    const dot = dirA.x * dirBRot.x + dirA.y * dirBRot.y;
    if (dot > options.directionCosThreshold) continue;

    // Map B endpoints to A reversed endpoints: B.a -> A.b and B.b -> A.a
    const bA = rotatePoint(edgeB.a, rot);
    const bB = rotatePoint(edgeB.b, rot);
    const tx = edgeA.b.x - bA.x;
    const ty = edgeA.b.y - bA.y;
    const bAT = { x: bA.x + tx, y: bA.y + ty };
    const bBT = { x: bB.x + tx, y: bB.y + ty };

    const endDist1 = pointDistance(bAT, edgeA.b);
    const endDist2 = pointDistance(bBT, edgeA.a);
    if (endDist1 > options.epsilon || endDist2 > options.epsilon) continue;

    return {
      transform: { rot, tx, ty },
      checks: {
        lengthDiff: Math.abs(lenA - lenB),
        directionDot: dot,
        endpointDistanceA: endDist1,
        endpointDistanceB: endDist2,
      },
    };
  }
  return null;
}

function analyzeTriangleJoins(triangles, options) {
  const local = triangles.map(triangleLocalVertices);
  const edges = local.map(getTriangleEdges);
  const matches = [];

  for (let i = 0; i < triangles.length; i++) {
    for (let j = 0; j < triangles.length; j++) {
      if (i === j) continue;
      for (let ei = 0; ei < 3; ei++) {
        for (let ej = 0; ej < 3; ej++) {
          const result = testEdgeJoin(edges[i][ei], edges[j][ej], options);
          if (!result) continue;
          matches.push({
            triangleA: i + 1,
            edgeA: ei,
            triangleB: j + 1,
            edgeB: ej,
            transformB: result.transform,
            checks: result.checks,
          });
        }
      }
    }
  }

  const pairCounts = {};
  for (const m of matches) {
    const key = `${m.triangleA}-${m.triangleB}`;
    pairCounts[key] = (pairCounts[key] || 0) + 1;
  }

  return {
    options,
    matches,
    summary: {
      totalMatches: matches.length,
      directedPairsWithAnyMatch: Object.keys(pairCounts).length,
    },
  };
}

function drawJoinSummary(analysis) {
  if (!analysis) return;
  const x = 22;
  const y = 24;
  fill(20);
  noStroke();
  textSize(14);
  text(
    `joins: ${analysis.summary.totalMatches} | pairs: ${analysis.summary.directedPairsWithAnyMatch} | mode: ${analysis.options.rotationMode}`,
    x,
    y
  );
}
