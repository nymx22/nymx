export class Pole {
  constructor(x, y, scaleFactor = 1) {
    this.x = x;
    this.y = y;
    this.scale = scaleFactor;

    // Base dimensions (will be scaled)
    this.shaftWidth = 10;
    this.shaftHeight = 250;
    this.crossbarWidth = 80;
    this.crossbarHeight = 4;
    this.insulatorWidth = 4;
    this.insulatorHeight = 14;

    // Positioning offsets
    this.insulatorMiddleX = 0;
    this.insulatorLeftX = -40;
    this.insulatorRightX = 40;
    this.insulatorY = -260;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    noStroke();
    const depthBrightness = map(this.scale, 0.05, 1, 200, 30);
    fill(depthBrightness);

    // 1. Main vertical shaft
    rect(-this.shaftWidth / 2, -this.shaftHeight, this.shaftWidth, this.shaftHeight, 2);

    // 2. Top crossbar
    fill(80);
    rect(-this.crossbarWidth / 2, -this.shaftHeight, this.crossbarWidth, this.crossbarHeight, 2);

    // 3. Left insulator arm
    fill(100);
    rect(this.insulatorLeftX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);

    // 4. Right insulator arm
    rect(this.insulatorRightX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);

    // 5. Middle insulator arm (centered)
    fill(70);
    rect(-this.insulatorWidth / 2, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);

    pop();
  }

  getWirePoints() {
    return [
      createVector(this.x + this.insulatorLeftX * this.scale, this.y + this.insulatorY * this.scale),
      createVector(this.x + this.insulatorMiddleX * this.scale, this.y + this.insulatorY * this.scale),
      createVector(this.x + this.insulatorRightX * this.scale, this.y + this.insulatorY * this.scale)
    ];
  }

  displayOnBuffer(buffer, pixelSize = 1) {
    buffer.push();
    buffer.translate(this.x * pixelSize, this.y * pixelSize);
    buffer.scale(this.scale * pixelSize);
    buffer.noStroke();
    const depthBrightness = map(this.scale, 0.05, 1, 200, 30);
    buffer.fill(depthBrightness);

    // Scale corner radius proportionally
    const cornerRadius = 2 * pixelSize;

    // 1. Main vertical shaft
    buffer.rect(-this.shaftWidth / 2, -this.shaftHeight, this.shaftWidth, this.shaftHeight, cornerRadius);

    // 2. Top crossbar
    buffer.fill(80);
    buffer.rect(-this.crossbarWidth / 2, -this.shaftHeight, this.crossbarWidth, this.crossbarHeight, cornerRadius);

    // 3. Left insulator arm
    buffer.fill(100);
    buffer.rect(this.insulatorLeftX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, cornerRadius);

    // 4. Right insulator arm
    buffer.rect(this.insulatorRightX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, cornerRadius);

    // 5. Middle insulator arm (centered)
    buffer.fill(70);
    buffer.rect(-this.insulatorWidth / 2, this.insulatorY, this.insulatorWidth, this.insulatorHeight, cornerRadius);

    buffer.pop();
  }
}
