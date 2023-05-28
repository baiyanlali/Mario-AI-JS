import {Assets} from "../helper/Assets";
import MarioImage from "../graphics/MarioImage";

export default class MarioEffect extends Phaser.Sprite.Container{
     x; y; xv; yv; xa; ya;
     life; startingIndex;
     graphics;

    constructor(x, y, xv, yv, xa, ya, startIndex, life) {
        super();
        this.x = x;
        this.y = y;
        this.xv = xv;
        this.yv = yv;
        this.xa = xa;
        this.ya = ya;
        this.life = life;

        this.graphics = new MarioImage(Assets.particles, startIndex);

        this.graphics.width = 16;
        this.graphics.height = 16;
        this.graphics.originX = 8;
        this.graphics.originY = 8;
        this.startingIndex = startIndex;

        const sprite = this.scene.add.sprite(0, -8 , 'smallmario')

    }

    render(og, cameraX, cameraY) {
        if (this.life <= 0) {
            return;
        }
        this.life -= 1;
        this.x += this.xv;
        this.y += this.yv;
        this.xv += this.xa;
        this.yv += this.ya;

        this.graphics.render(og, parseInt (this.x - cameraX), parseInt (this.y - cameraY));
    }
}
