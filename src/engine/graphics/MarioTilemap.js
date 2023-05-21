class MarioTilemap extends MarioGraphics {
     sheet;
     currentIndeces;
     indexShift;
     moveShift;
     animationIndex;

    MarioTilemap( sheet,  currentIndeces) {
    this.sheet = sheet;
    this.currentIndeces = currentIndeces;
    this.indexShift = new int[currentIndeces.length][currentIndeces[0].length];
    this.moveShift = new float[currentIndeces.length][currentIndeces[0].length];
    this.animationIndex = 0;
}

render( og,  x,  y) {
    this.animationIndex = (this.animationIndex + 1) % 5;

    let xMin = (x / 16) - 1;
    let yMin = (y / 16) - 1;
    let xMax = (x + MarioGame.width) / 16 + 1;
    let yMax = (y + MarioGame.height) / 16 + 1;

    for (let xTile = xMin; xTile <= xMax; xTile++) {
        for (let yTile = yMin; yTile <= yMax; yTile++) {
            if (xTile < 0 || yTile < 0 || xTile >= this.currentIndeces.length || yTile >= this.currentIndeces[0].length) {
                continue;
            }
            if (this.moveShift[xTile][yTile] > 0) {
                this.moveShift[xTile][yTile] -= 1;
                if (this.moveShift[xTile][yTile] < 0) {
                    this.moveShift[xTile][yTile] = 0;
                }
            }
            let features = TileFeature.getTileType(this.currentIndeces[xTile][yTile]);
            if (features.contains(TileFeature.ANIMATED)) {
                if (this.animationIndex == 0) {
                    this.indexShift[xTile][yTile] = (this.indexShift[xTile][yTile] + 1) % 3;
                }
            } else {
                this.indexShift[xTile][yTile] = 0;
            }
            let index = this.currentIndeces[xTile][yTile] + this.indexShift[xTile][yTile];
            let move = parseInt( this.moveShift[xTile][yTile]);
            let img = this.sheet[index % 8][index / 8];
            og.drawImage(img, xTile * 16 - x, yTile * 16 - y - move, null);
        }
    }
}

}
