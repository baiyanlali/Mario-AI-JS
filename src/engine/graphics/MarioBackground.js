class MarioBackground extends MarioGraphics {
     image;
     g;
     screenWidth;

    constructor(graphicsConfiguration,  screenWidth,  indeces) {
    super();
    this.width = indeces[0].length * 16;
    this.height = indeces.length * 16;
    this.screenWidth = screenWidth;

    this.image = graphicsConfiguration.createCompatibleImage(width, height, Transparency.BITMASK);
    this.g = this.image.getGraphics();
    this.g.setComposite(AlphaComposite.Src);

    this.updateArea(indeces);
}

 updateArea(indeces) {
    g.setBackground(new Color(0, 0, 0, 0));
    g.clearRect(0, 0, this.width, this.height);
    for (let x = 0; x < indeces[0].length; x++) {
        for (let y = 0; y < indeces.length; y++) {
            let xTile = indeces[y][x] % 8;
            let yTile = indeces[y][x] / 8;
            g.drawImage(Assets.level[xTile][yTile], x * 16, y * 16, 16, 16, null);
        }
    }
}

render( og,  x,  y) {
    let xOff = x % this.width;
    for (let i = -1; i < this.screenWidth / this.width + 1; i++) {
        og.drawImage(this.image, -xOff + i * this.width, 0, null);
    }
}

}
