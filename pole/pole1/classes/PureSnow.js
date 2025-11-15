class PureSnow {
  constructor({ tileSize = 256, poolSize = 6 } = {}) {
    this.tileSize = tileSize;
    this.poolSize = poolSize;
    this.textures = [];
    this.lastIntensity = 0;
    this.needsRefresh = true;
  }

  createTexture(intensity = 1) {
    const g = createGraphics(this.tileSize, this.tileSize);
    g.loadPixels();

    for (let i = 0; i < g.pixels.length; i += 4) {
      const brightness = (180 + Math.random() * 75) * intensity;
      g.pixels[i] = brightness;
      g.pixels[i + 1] = brightness;
      g.pixels[i + 2] = brightness;
      g.pixels[i + 3] = 255;
    }

    g.updatePixels();
    return g;
  }

  build(intensity = 1) {
    this.textures = [];
    for (let i = 0; i < this.poolSize; i++) {
      this.textures.push(this.createTexture(intensity));
    }
    this.lastIntensity = intensity;
    this.needsRefresh = false;
  }

  refreshOne(intensity) {
    if (!this.textures.length) {
      return;
    }
    const index = Math.floor(Math.random() * this.textures.length);
    this.textures[index] = this.createTexture(intensity);
    this.lastIntensity = intensity;
  }

  update(intensity, speed = 0.001) {
    if (intensity <= 0) {
      return;
    }

    if (this.needsRefresh || !this.textures.length || Math.abs(intensity - this.lastIntensity) > 0.1) {
      this.build(intensity);
      return;
    }

    const clampedSpeed = constrain(speed, 0.001, 2);
    const mappedInterval = Math.max(1, Math.floor(map(clampedSpeed, 0.001, 2, 120, 6)));

    if (frameCount % mappedInterval === 0) {
      this.refreshOne(intensity);
    }
  }

  draw({ intensity, stretch = true, alphaScale = 255 } = {}) {
    if (!this.textures.length || intensity <= 0) {
      return;
    }

    const texture = this.textures[frameCount % this.textures.length];

    push();
    tint(255, alphaScale * intensity);

    if (stretch) {
      image(texture, 0, 0, width, height);
    } else {
      for (let y = 0; y < height; y += this.tileSize) {
        for (let x = 0; x < width; x += this.tileSize) {
          image(texture, x, y, this.tileSize, this.tileSize);
        }
      }
    }

    pop();
  }

  handleResize() {
    this.needsRefresh = true;
  }
}
