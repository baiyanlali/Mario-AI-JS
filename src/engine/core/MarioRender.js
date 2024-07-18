import MarioWorld from "./MarioWorld.js";
import Assets from "../helper/Assets.js";
const TICKS_PER_SECOND = 24;

export default class MarioRender {
    constructor(scaling_factor = 2) {
        this.size = [256, 240]
        this.canvas = document.getElementById("mario_canvas")
        this.og = this.canvas.getContext("2d")

        this.target_og = document.createElement("canvas")
        this.target_og.setAttribute("width", scaling_factor * this.size[0])
        this.target_og.setAttribute("height", scaling_factor * this.size[1])


        const destinationCtx = this.target_og.getContext('2d');
        destinationCtx.imageSmoothingEnabled = false; // 兼容性设置
        destinationCtx['webkitImageSmoothingEnabled'] = false;
        destinationCtx['mozImageSmoothingEnabled'] = false;
        destinationCtx['msImageSmoothingEnabled'] = false;
        destinationCtx['oImageSmoothingEnabled'] = false;

        document.body.appendChild(this.target_og)
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

        this.target_og.getContext("2d").drawImage(this.canvas, 0, 0, this.size[0], this.size[1], 0, 0, this.target_og.width, this.target_og.height)
    }
}