import MarioSprite from "../core/MarioSprite.js";
import { MarioActions } from "../helper/MarioActions.js";
import { EventType } from "../helper/EventType.js";
import {TileFeature} from "../helper/TileFeature.js"
import MarioGame from "../core/MarioGame.js";
import {SpriteType} from "../helper/SpriteType.js";

export default class Mario extends MarioSprite{


    isLarge;
    isFire;
    onGround;
    wasOnGround;
    isDucking;
    canShoot;
    mayJump;
    actions = null;
    jumpTime = 0;

    xJumpSpeed;
    yJumpSpeed = 0;
    invulnerableTime = 0;

    marioFrameSpeed = 0;
    oldLarge;
    oldFire = false;
    graphics = null;

    // stats
    xJumpStart = -100;

    GROUND_INERTIA = 0.89;
    AIR_INERTIA = 0.89;
    POWERUP_TIME = 3;

    scene;
    
    /** @type {MarioWorld} */
    world;
    type;

    constructor(visuals, x, y, scene, type) {
        super(x + 8, y + 15, scene, type)
        this.isLarge = this.oldLarge = false;
        this.isFire = this.oldFire = false;
        this.width = 4;
        this.height = 24;
        this.world = scene;
        this.scene = scene;
        this.type = SpriteType.MARIO;
        this.x = x + 8;
        this.y = y + 15;

        this.scene.anims.create({
            key: "walk",
            frames: this.scene.anims.generateFrameNumbers('mario',  { start: 0, end: 10, first: 0 }),
            frameRate: 16,
            repeat: -1
        })

        this.scene.anims.create({
            key: "mwalk",
            frames: this.scene.anims.generateFrameNumbers('smallmario',  { start: 0, end: 10, first: 0 }),
            frameRate: 16,
            repeat: -1
        })

        // const sprite = this.scene.add.sprite(-8, -8 , 'smallmario').play('mwalk')
        const sprite = this.scene.add.sprite(0, -8 , 'smallmario').play('mwalk')
        this.add(sprite)
        this.scene.add.existing(this)
            
    }

    move( xa,  ya) {
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
                this.x = parseInt ((this.x - this.width) / 16) * 16 + this.width;
                this.xa = 0;
            }
            if (xa > 0) {
                this.x = parseInt ((this.x + this.width) / 16 + 1) * 16 - this.width - 1;
                this.xa = 0;
            }
            if (ya < 0) {
                this.y = parseInt ((this.y - this.height) / 16) * 16 + this.height;
                this.jumpTime = 0;
                this.ya = 0;
            }
            if (ya > 0) {
                this.y = parseInt ((this.y - 1) / 16 + 1) * 16 - 1;
                this.onGround = true;
            }
            return false;
        } else {
            this.x += xa;
            this.y += ya;
            return true;
        }
    }
    updateGraphics() {}
    update(){
        // console.log("mario update: x: "+this.x + " y: ", this.y)
        // this.setPosition(0, 0)
        // return
        if (!this.alive) {
            return;
        }

        if (this.invulnerableTime > 0) {
            this.invulnerableTime--;
        }
        this.wasOnGround = this.onGround;

        let sideWaysSpeed = this.actions[MarioActions.SPEED[0]] ? 1.2: 0.6;

        if (this.onGround) {
            this.isDucking = this.actions[MarioActions.DOWN[0]] && this.isLarge;
        }

        if (this.isLarge) {
            this.height = this.isDucking ? 12 : 24;
        } else {
            this.height = 12;
        }

        if (this.xa > 2) {
            this.facing = 1;
        }
        if (this.xa < -2) {
            this.facing = -1;
        }

        if (this.actions[MarioActions.JUMP[0]] || (this.jumpTime < 0 && !this.onGround)) {
            if (this.jumpTime < 0) {
                this.xa = this.xJumpSpeed;
                this.ya = -this.jumpTime * this.yJumpSpeed;
                this.jumpTime++;
            } else if (this.onGround && this.mayJump) {
                this.xJumpSpeed = 0;
                this.yJumpSpeed = -1.9;
                this.jumpTime = 7;
                this.ya = this.jumpTime * this.yJumpSpeed;
                this.onGround = false;
                if (!(this.isBlocking(this.x, this.y - 4 - this.height, 0, -4) || this.isBlocking(this.x - this.width, this.y - 4 - this.height, 0, -4)
                        || this.isBlocking(this.x + this.width, this.y - 4 - this.height, 0, -4))) {
                    this.xJumpStart = this.x;
                    this.world.addEvent(EventType.JUMP, 0);
                }
            } else if (this.jumpTime > 0) {
                this.xa += this.xJumpSpeed;
                this.ya = this.jumpTime * this.yJumpSpeed;
                this.jumpTime--;
            }
        } else {
            this.jumpTime = 0;
        }

        if (this.actions[MarioActions.LEFT[0]] && !this.isDucking) {
            this.xa -= sideWaysSpeed;
            if (this.jumpTime >= 0)
            this.facing = -1;
        }



        if (this.actions[MarioActions.RIGHT[0]] && !this.isDucking) {
            this.xa += sideWaysSpeed;
            if (this.jumpTime >= 0)
            this.facing = 1;
        }

        if (this.actions[MarioActions.SPEED[0]] && this.canShoot && this.isFire && this.world.fireballsOnScreen < 2) {
            this.world.addSprite(new Fireball(this.graphics != null, this.x + this.facing * 6, this.y - 20, this.facing));
        }

        this.canShoot = !this.actions[MarioActions.SPEED[0]];

        this.mayJump = this.onGround && !this.actions[MarioActions.JUMP[0]];

        if (Math.abs(this.xa) < 0.5) {
            this.xa = 0;
        }

        this.onGround = false;
        this.move(this.xa, 0);
        this.move(0, this.ya);
        if (!this.wasOnGround && this.onGround && this.xJumpStart >= 0) {
            this.world.addEvent(EventType.LAND, 0);
            this.xJumpStart = -100;
        }

        if (this.x < 0) {
            this.x = 0;
            this.xa = 0;
        }

        if (this.x > this.world.level.exitTileY * 16) {
            this.x = this.world.level.exitTileY * 16;
            this.xa = 0;
            this.world.win();
        }

        this.ya *= 0.85;
        if (this.onGround) {
            this.xa *= this.GROUND_INERTIA;
        } else {
            this.xa *= this.AIR_INERTIA;
        }

        if (!this.onGround) {
            this.ya += 3;
        }

        this.scaleX = this.facing;

    }

    isBlocking(_x,  _y,  xa,  ya) {
        let xTile = parseInt (_x / 16);
        let yTile = parseInt (_y / 16);
        if (xTile === parseInt (this.x / 16) && yTile === parseInt (this.y / 16))
            return false;

        let blocking = this.world.level.isBlocking(xTile, yTile, xa, ya);
        let block = this.world.level.getBlock(xTile, yTile);

        if (TileFeature.getTileType(block).includes(TileFeature.PICKABLE)) {
            this.world.addEvent(EventType.COLLECT, block);
            this.collectCoin();
            this.world.level.setBlock(xTile, yTile, 0);
        }
        if (blocking && ya < 0) {
            this.world.bump(xTile, yTile, this.isLarge);
        }
        return blocking;
    }
    
    
    getHurt() {
        if (this.invulnerableTime > 0 || !this.alive)
            return;

        if (this.isLarge) {
            this.world.pauseTimer = 3 * this.POWERUP_TIME;
            this.oldLarge = this.isLarge;
            this.oldFire = this.isFire;
            if (this.isFire) {
                this.isFire = false;
            } else {
                this.isLarge = false;
            }
            this.invulnerableTime = 75;
        } else if (this.world != null) {
            if (this.world.lives <= 0) {
                this.world.lose();
            } else {
                this.world.deathBuffer = 50;
                this.xa = 0;
                this.world.lives -= 1;
                this.world.deaths += 1;
                this.world.pauseTimer = 3 * this.POWERUP_TIME;
                this.invulnerableTime = 75;
            }
        }
    }

    getDrop() {
        if (!this.alive)
            return;

        this.oldLarge = this.isLarge;
        this.oldFire = this.isFire;
        this.isFire = false;
        this.isLarge = false;
        if (this.world != null) {
            if (this.world.lives <= 0) {
                this.world.lose();
            } else if (this.invulnerableTime <= 0) {
                this.world.lives -= 1;
                this.world.deaths += 1;
                this.xa = 0;
                this.world.pauseTimer = 3 * this.POWERUP_TIME;
            }
        }
        this.invulnerableTime = 150;
    }

    getFlower() {
        if (!this.alive) {
            return;
        }

        if (!this.isFire) {
            this.world.pauseTimer = 3 * this.POWERUP_TIME;
            this.oldFire = this.isFire;
            this.oldLarge = this.isLarge;
            this.isFire = true;
            this.isLarge = true;
        } else {
            this.collectCoin();
        }
    }

    getMushroom() {
        if (!this.alive) {
            return;
        }

        if (!this.isLarge) {
            this.world.pauseTimer = 3 * this.POWERUP_TIME;
            this.oldFire = this.isFire;
            this.oldLarge = this.isLarge;
            this.isLarge = true;
        } else {
            this.collectCoin();
        }
    }

    kick(shell) {
        if (!this.alive) {
            return;
        }

        this.invulnerableTime = 1;
    }

    stomp(shell) {
        if (!this.alive) {
            return;
        }
        let targetY = shell.y - shell.height / 2;
        this.move(0, targetY - this.y);

        this.xJumpSpeed = 0;
        this.yJumpSpeed = -1.9;
        this.jumpTime = 8;
        this.ya = this.jumpTime * this.yJumpSpeed;
        this.onGround = false;
        this.invulnerableTime = 1;
    }

    getMarioType() {
        if (this.isFire) {
            return "fire";
        }
        if (this.isLarge) {
            return "large";
        }
        return "small";
    }

    collect1Up() {
        if (!this.alive) {
            return;
        }

        this.world.lives++;
    }

    collectCoin() {
        if (!this.alive) {
            return;
        }

        this.world.coins++;
        if (this.world.coins % 100 === 0) {
            this.collect1Up();
        }
    }

    clone() {
        let sprite = new Mario(false, this.x - 8, y - 15, this.scene, this.type);
        sprite.xa = this.xa;
        sprite.ya = this.ya;
        sprite.initialCode = this.initialCode;
        sprite.width = this.width;
        sprite.height = this.height;
        sprite.facing = this.facing;
        sprite.isLarge = this.isLarge;
        sprite.isFire = this.isFire;
        sprite.wasOnGround = this.wasOnGround;
        sprite.onGround = this.onGround;
        sprite.isDucking = this.isDucking;
        sprite.canShoot = this.canShoot;
        sprite.mayJump = this.mayJump;
        sprite.actions = Array(this.actions.length);
        for (let i = 0; i < this.actions.length; i++) {
            sprite.actions[i] = this.actions[i];
        }
        sprite.xJumpSpeed = this.xJumpSpeed;
        sprite.yJumpSpeed = this.yJumpSpeed;
        sprite.invulnerableTime = this.invulnerableTime;
        sprite.jumpTime = this.jumpTime;
        sprite.xJumpStart = this.xJumpStart;
        return sprite;
    }

}