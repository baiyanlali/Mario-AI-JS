
import MarioGraphics from "./MarioGraphics.js";

export default class MarioImage extends MarioGraphics {
    sheet;
    index;

    constructor(sheet, index) {
        super();
        this.sheet = sheet;
        this.index = index;
    }

    render(og, x, y) {
        // console.log(this.visible)
        if (!this.visible) return;

        let xPixel = x - super.originX;
        let yPixel = y - super.originY;
        let image = this.sheet[this.index % this.sheet.length][Math.floor(this.index / this.sheet.length)];

        og.drawImage(image, 
            xPixel + (super.flipX ? this.width : 0), 
            yPixel + (super.flipY ? this.height : 0), 
            super.flipX ? -this.width : this.width, 
            super.flipY ? -this.height : this.height);
    }

}
