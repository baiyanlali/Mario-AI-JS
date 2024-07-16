
import Assets from "../helper/Assets.js";
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
        if (!this.visible) {
            return;
        }

        let xPixel = x - this.originX;
        let yPixel = y - this.originY;
        let image = this.sheet[this.index % this.sheet.length][Math.floor(this.index / this.sheet.length)];

        // if(this.sheet == Assets.smallMario){
        //     console.log(xPixel + (this.flipX ? this.width : 0), 
        //     yPixel + (this.flipY ? this.height : 0), 
        //     this.flipX ? -this.width : this.width, 
        //     this.flipY ? -this.height : this.height,
        //     this.flipX, this.flipY)
        // }
        

        og.drawImage(image, 
            xPixel + (this.flipX ? this.width : 0), 
            yPixel + (this.flipY ? this.height : 0), 
            this.flipX ? -this.width : this.width, 
            this.flipY ? -this.height : this.height);
    }

}
