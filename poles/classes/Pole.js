class Pole {
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

  display(glow = false) {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    
    if (glow) {
      // Draw glow effect with multiple layers for a soft glow
      blendMode(ADD); // Use additive blending for brighter glow
      for (let i = 8; i > 0; i--) {
        let glowSize = i * 2;
        let glowAlpha = map(i, 0, 8, 0, 60);
        noFill();
        stroke(100, 150, 255, glowAlpha); // Light blue glow
        strokeWeight(glowSize);
        
        // Glow for main shaft
        rect(-this.shaftWidth / 2, -this.shaftHeight, this.shaftWidth, this.shaftHeight, 2);
        
        // Glow for crossbar
        rect(-this.crossbarWidth / 2, -this.shaftHeight, this.crossbarWidth, this.crossbarHeight, 2);
        
        // Glow for insulators
        rect(this.insulatorLeftX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);
        rect(this.insulatorRightX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);
        rect(-this.insulatorWidth / 2, this.insulatorY, this.insulatorWidth, this.insulatorHeight, 2);
      }
      blendMode(BLEND); // Reset to normal blending
    }
    
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
      createVector(this.x + this.insulatorRightX * this.scale, this.y + this.insulatorY * this.scale),
    ];
  }

  displayOnBuffer(buffer, pixelSize = 1) {
    buffer.push();
    buffer.translate(this.x * pixelSize, this.y * pixelSize);
    buffer.scale(this.scale * pixelSize);
    buffer.noStroke();
    const depthBrightness = map(this.scale, 0.05, 1, 200, 30);
    buffer.fill(depthBrightness);

    const cornerRadius = 2 * pixelSize;

    buffer.rect(-this.shaftWidth / 2, -this.shaftHeight, this.shaftWidth, this.shaftHeight, cornerRadius);
    buffer.fill(80);
    buffer.rect(-this.crossbarWidth / 2, -this.shaftHeight, this.crossbarWidth, this.crossbarHeight, cornerRadius);
    buffer.fill(100);
    buffer.rect(this.insulatorLeftX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, cornerRadius);
    buffer.rect(this.insulatorRightX, this.insulatorY, this.insulatorWidth, this.insulatorHeight, cornerRadius);
    buffer.fill(70);
    buffer.rect(-this.insulatorWidth / 2, this.insulatorY, this.insulatorWidth, this.insulatorHeight, cornerRadius);

    buffer.pop();
  }

  // Check if a point (mx, my) is inside the pole's bounding box
  containsPoint(mx, my) {
    // Calculate the bounding box of the pole
    // The pole extends from y - shaftHeight to y (base)
    // And from x - crossbarWidth/2 to x + crossbarWidth/2 (widest part)
    let minY = this.y - this.shaftHeight * this.scale;
    let maxY = this.y;
    let minX = this.x - (this.crossbarWidth / 2) * this.scale;
    let maxX = this.x + (this.crossbarWidth / 2) * this.scale;
    
    // Add some padding for easier clicking
    let padding = 20;
    return mx >= minX - padding && mx <= maxX + padding && 
           my >= minY - padding && my <= maxY + padding;
  }
}

