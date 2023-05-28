import MarioWorld from "../core/MarioWorld.js";
import * as Phaser from "../../phaser.esm.js";


export default class MarioGraphics extends Phaser.GameObjects.Container{
    visible;
    alpha;
    originX; originY;
    flipX; flipY;
    width; height;

    constructor() {
        super(MarioWorld.Instance, 0, 0);
        this.visible = true;
        this.alpha = 1;
        this.originX = this.originY = 0;
        this.flipX = this.flipY = false;
        this.width = this.height = 32;
    }

    render(og, x, y){

        this.x = x
        this.y = y

        this.scaleX = this.flipX? -1: 1
        this.scaleY = this.flipY? -1: 1
    }
}