class Wire {
  constructor(startPoint, endPoint, sag = 0) {
    this.start = startPoint;
    this.end = endPoint;
    this.sag = sag;
  }

  display() {
    stroke(40);
    strokeWeight(1.5);
    noFill();

    if (this.sag === 0) {
      line(this.start.x, this.start.y, this.end.x, this.end.y);
      return;
    }

    beginShape();
    vertex(this.start.x, this.start.y);

    const midX = (this.start.x + this.end.x) / 2;
    const midY = (this.start.y + this.end.y) / 2;
    const wireLength = dist(this.start.x, this.start.y, this.end.x, this.end.y);
    const maxSagAmount = wireLength * 0.15;
    const sagAmount = maxSagAmount * this.sag;

    quadraticVertex(midX, midY + sagAmount, this.end.x, this.end.y);
    endShape();
  }
}

