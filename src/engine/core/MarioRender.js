import MarioWorld from "./MarioWorld.js";
import Assets from "../helper/Assets.js";
const TICKS_PER_SECOND = 24;

export default class MarioRender {
    constructor() {
        this.size = [256, 240]
        this.canvas = document.getElementById("mario_canvas")
        this.og = this.canvas.getContext("2d")
    }

    async init(){
        await Assets.init()
    }

    /**
     * 
     * @param {MarioWorld} world 
     * @param {*} image 
     * @param {*} g 
     * @param {CanvasRenderingContext2D} og 
     * @param {boolean} verbose 
     */
    renderWorld(world, image, g, og=this.og, verbose=false) {
        og.fillRect(0, 0, 256, 240)
        world.render(og)
    }
}