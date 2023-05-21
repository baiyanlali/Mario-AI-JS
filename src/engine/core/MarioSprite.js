import * as Phaser from "../../phaser.esm.js";

export default class MarioSprite extends Phaser.GameObjects.Container{
    type
    initialCode
    x; y; xa; ya;
    width; height; facing
    alive
    world

    constructor(x, y, scene){
        super(scene, x, y);
        this.x = x
        this.y = y
        this.xa = 0
        this.ya = 0
        this.facing = 1
        this.alive = true
        this.world = scene
        this.width = 16
        this.height = 16
        this.initialCode = ""
    }

    clone(){
        return null;
    }

    added(){}
    removed(){}
    getMapX(){return parseInt(this.x / 16)}
    getMapY(){return parseInt(this.y / 16)}

    render(og){}
    update(){}
    collideCheck(){}
    bumpCheck(xTile, yTile){}
    shellCollideCheck(shell){return false}
    release(mario){}
    fireballCollideCheck(fireball){return false}
}