class MarioImage extends MarioGraphics {
    sheet;
    index;

    constructor(sheet, index) {
        super();
        this.sheet = sheet;
        this.index = index;
    }

    render(og, x, y) {
        if (!visible) return;

        let xPixel = x - super.originX;
        let yPixel = y - super.originY;
        let image = this.sheet[this.index % this.sheet.length][this.index / this.sheet.length];

        og.drawImage(image, xPixel + (super.flipX ? width : 0), yPixel + (super.flipY ? height : 0), super.flipX ? -width : width, super.flipY ? -height : height, null);
    }

}
