import MarioSprite from "../core/MarioSprite.js";
import {SpriteType} from "../helper/SpriteType.js";
import {EventType} from "../helper/EventType.js";
import {GameObjects} from "../../phaser.esm.js";

export default class LifeMushroom extends MarioSprite {
    onGround = false;
    life;
    graphics = {};

    static GROUND_INERTIA = 0.89;
    static AIR_INERTIA = 0.89;

    constructor(visuals, x, y, scene) {
        super(x, y, scene);
        this.width = 4;
        this.height = 12;
        this.facing = 1;
        this.life = 0;

        const sprite = new GameObjects.Sprite(this.world, 0, 0, 'item', 3)
        this.add(sprite)
        this.world.add.existing(this)

        if (visuals) {
            // this.graphics = new MarioImage(Assets.items, 3);
            this.graphics.width = 16;
            this.graphics.height = 16;
            this.graphics.originX = 8;
            this.graphics.originY = 15;
        }
    }


    clone() {
        let m = new LifeMushroom(false, this.x, this.y);
        m.xa = this.xa;
        m.ya = this.ya;
        m.initialCode = this.initialCode;
        m.width = this.width;
        m.height = this.height;
        m.facing = this.facing;
        m.life = this.life;
        m.onGround = this.onGround;
        return m;
    }

    collideCheck() {
        if (!this.alive) {
            return;
        }

        let xMarioD = this.world.mario.x - this.x;
        let yMarioD = this.world.mario.y - this.y;
        if (xMarioD > -16 && xMarioD < 16) {
            if (yMarioD > -this.height && yMarioD < this.world.mario.height) {
                this.world.addEvent(EventType.COLLECT, this.type);
                this.world.mario.collect1Up();
                this.world.removeSprite(this);
            }
        }
    }

    isBlocking(_x, _y, xa, ya) {
        let x = parseInt(_x / 16);
        let y = parseInt(_y / 16);
        if (x === parseInt(this.x / 16) && y === parseInt(this.y / 16))
            return false;

        let blocking = this.world.level.isBlocking(x, y, xa, ya);
        return blocking;
    }

    bumpCheck(xTile, yTile) {
        let x = this.x
        let y = this.y
        if (!this.alive) {
            return;
        }

        if (x + width > xTile * 16 && x - width < xTile * 16 + 16 && yTile === parseInt((y - 1) / 16)) {
            this.facing = -this.world.mario.facing;
            this.ya = -10;
        }
    }

    move(xa, ya) {
        while (xa > 8) {
            if (!this.move(8, 0))
                return false;
            xa -= 8;
        }
        while (xa < -8) {
            if (!this.move(-8, 0))
                return false;
            xa += 8;
        }
        while (ya > 8) {
            if (!this.move(0, 8))
                return false;
            ya -= 8;
        }
        while (ya < -8) {
            if (!this.move(0, -8))
                return false;
            ya += 8;
        }

        let collide = false;
        if (ya > 0) {
            if (this.isBlocking(this.x + xa - this.width, this.y + ya, xa, 0))
                collide = true;
            else if (this.isBlocking(this.x + xa + this.width, this.y + ya, xa, 0))
                collide = true;
            else if (this.isBlocking(this.x + xa - this.width, this.y + ya + 1, xa, ya))
                collide = true;
            else if (this.isBlocking(this.x + xa + this.width, this.y + ya + 1, xa, ya))
                collide = true;
        }
        if (ya < 0) {
            if (this.isBlocking(this.x + xa, this.y + ya - this.height, xa, ya))
                collide = true;
            else if (collide || this.isBlocking(this.x + xa - this.width, this.y + ya - this.height, xa, ya))
                collide = true;
            else if (collide || this.isBlocking(this.x + xa + this.width, this.y + ya - this.height, xa, ya))
                collide = true;
        }
        if (xa > 0) {
            if (this.isBlocking(this.x + xa + this.width, this.y + ya - this.height, xa, ya))
                collide = true;
            if (this.isBlocking(this.x + xa + this.width, this.y + ya - this.height / 2, xa, ya))
                collide = true;
            if (this.isBlocking(this.x + xa + this.width, this.y + ya, xa, ya))
                collide = true;
        }
        if (xa < 0) {
            if (this.isBlocking(this.x + xa - this.width, this.y + ya - this.height, xa, ya))
                collide = true;
            if (this.isBlocking(this.x + xa - this.width, this.y + ya - this.height / 2, xa, ya))
                collide = true;
            if (this.isBlocking(this.x + xa - this.width, this.y + ya, xa, ya))
                collide = true;
        }

        if (collide) {
            if (xa < 0) {
                this.x = parseInt((this.x - this.width) / 16) * 16 + this.width;
                this.xa = 0;
            }
            if (xa > 0) {
                this.x = parseInt((this.x + this.width) / 16 + 1) * 16 - this.width - 1;
                this.xa = 0;
            }
            if (ya < 0) {
                this.y = parseInt((this.y - this.height) / 16) * 16 + this.height;
                this.ya = 0;
            }
            if (ya > 0) {
                this.y = parseInt(this.y / 16 + 1) * 16 - 1;
                this.onGround = true;
            }
            return false;
        } else {
            this.x += xa;
            this.y += ya;
            return true;
        }
    }

    update() {
        if (!this.alive) {
            return;
        }

        if (this.life < 9) {
            this.y--;
            this.life++;
            return;
        }
        let sideWaysSpeed = 1.75;
        if (this.xa > 2) {
            this.facing = 1;
        }
        if (this.xa < -2) {
            this.facing = -1;
        }

        this.xa = this.facing * sideWaysSpeed;

        if (!this.move(this.xa, 0))
            this.facing = -this.facing;
        this.onGround = false;
        this.move(0, this.ya);

        this.ya *= 0.85;
        if (this.onGround) {
            this.xa *= this.GROUND_INERTIA;
        } else {
            this.xa *= this.AIR_INERTIA;
        }

        if (!this.onGround) {
            this.ya += 2;
        }
    }

    render(og) {
        super.render(og);

        this.graphics.render(og, parseInt(this.x - this.world.cameraX), parseInt(this.y - this.world.cameraY));
    }
}