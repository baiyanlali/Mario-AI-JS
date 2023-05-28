import MarioGraphics from "./MarioGraphics";
import MarioWorld from "../core/MarioWorld";

export default class MarioImage extends MarioGraphics {
    sheet;
    index;

    constructor(sheet, index) {
        super();
        this.sheet = sheet;
        this.index = index;

        MarioWorld.Instance.add.sprite(super.originX, super.originY, this.sheet, this.index)
    }

    render(og, x, y) {
        let xPixel = x - super.originX;
        let yPixel = y - super.originY;

        this.x = x
        this.y = y





        // let image = this.sheet[this.index % this.sheet.length][this.index / this.sheet.length];

        // og.drawImage(image, xPixel + (super.flipX ? width : 0), yPixel + (super.flipY ? height : 0), super.flipX ? -width : width, super.flipY ? -height : height, null);
    }

}
