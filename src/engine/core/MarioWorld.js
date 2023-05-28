import MarioGame from "./MarioGame.js";
import {GameStatus} from "../helper/GameStatus.js";
import {New2DArray, Transpose} from "../../Util.js";
import MarioLevel from "./MarioLevel.js";
import Mario from "../sprites/Mario.js";
import {Scene} from "../../phaser.esm.js";
import {EventType} from "../helper/EventType.js";
import {SpriteType, spawnSprite} from "../helper/SpriteType.js";
import {TileFeature} from "../helper/TileFeature.js";

import MarioEvent from "./MarioEvent.js";
import MarioForwardModel from "./MarioForwardModel.js";
import Enemy from "../sprites/Enemy.js";
import FlowerEnemy from "../sprites/FlowerEnemy.js";
import LifeMushroom from "../sprites/LifeMushroom.js";
import BulletBill from "../sprites/BulletBill.js";
import CoinEffect from "../effects/CoinEffect";

export default class MarioWorld extends Scene {
    static onlineTimerMax = 100000;

    static Instance;

    gameStatus;
    pauseTimer = 0;
    fireballsOnScreen = 0;
    currentTimer = -1;
    cameraX;
    cameraY;
    mario;
    level;
    visuals;
    currentTick;
    //Status
    coins;
    lives;
    kills;
    deaths;
    jumps;
    items;
    airStart;
    airTime;
    lastFrameEvents;

    deathBuffer;

    //    segTime = -1;
    //    passedSegs = 0;
    killEvents;
    sprites;
    shellsToCheck;
    fireballsToCheck;
    addedSprites;
    removedSprites;

    effects;
    level;
    onReady = null;
    onUpdate = null;
    camera;
    // backgrounds = new MarioBackground[2];
    //    revivable = false;
    //    totalEnemies;

    constructor(killEvents, config) {
        super(config);
        this.pauseTimer = 0;
        this.gameStatus = GameStatus.RUNNING;
        this.sprites = [];
        this.shellsToCheck = [];
        this.fireballsToCheck = [];
        this.addedSprites = [];
        this.removedSprites = [];
        this.effects = [];
        this.lastFrameEvents = [];
        this.killEvents = killEvents;
        this.lives = 0;
        this.kills = 0;
        this.deaths = 0;
        this.deathBuffer = 0;

        MarioWorld.Instance = this;
    }

    preload() {
        this.load.image('tiles', 'assets/mapsheet.png')
        this.load.spritesheet('mario', 'assets/mariosheet.png', {frameWidth: 32, frameHeight: 32})
        // this.load.image('mario', 'assets/mariosheet.png')
        this.load.spritesheet('item', 'assets/itemsheet.png', {frameWidth: 8, frameHeight: 8})
        this.load.spritesheet('particle', 'assets/particlesheet.png', {frameWidth: 16, frameHeight: 16})
        this.load.spritesheet('font', 'assets/font.gif', {frameWidth: 8, frameHeight: 8})
        this.load.spritesheet('enemy', 'assets/enemysheet.png', {frameWidth: 16, frameHeight: 32})
        this.load.spritesheet('smallmario', 'assets/smallmariosheet.png', {frameWidth: 16, frameHeight: 16})
        this.load.spritesheet('firemario', 'assets/firemariosheet.png', {frameWidth: 32, frameHeight: 32})
        // this.load.tilemapTiledJSON('bg', 'assets/tilesets/mario-map.tsj')
    }

    create() {
        this.pauseTimer = 0;
        this.gameStatus = GameStatus.RUNNING;
        this.sprites = [];
        this.shellsToCheck = [];
        this.fireballsToCheck = [];
        this.addedSprites = [];
        this.removedSprites = [];
        this.effects = [];
        this.lastFrameEvents = [];
        // this.killEvents = killEvents;
        this.lives = 0;
        this.kills = 0;
        this.deaths = 0;
        this.deathBuffer = 0;


        this.anims.create({
            key: "enemy-walk",
            frames: this.anims.generateFrameNumbers('enemy', {start: 16, end: 17, first: 16}),
            frameRate: 16,
            repeat: -1
        })

        this.initializeVisuals()

        this.initializeLevel()


        this.camera_offset = this.cameras.main.scrollX - this.mario.x

        if (this.onReady !== null && this.onReady !== undefined) {
            this.onReady()
        }
    }

    timeCnt = 0

    timeMax = 30

    update(t, d) {
        if (this.onUpdate !== null && this.onUpdate !== undefined) {
            this.timeCnt += d
            if(this.timeCnt > this.timeMax){
                this.timeCnt -= this.timeMax
                this.onUpdate()
            }
            // this.cameras.main.scrollX = this.mario.x + this.camera_offset
        }
    }

    initializeVisuals(graphicsConfig) {
        let bg1 = New2DArray(16, 9, 0)

        let bg2 = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [31, 32, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [34, 35, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 31, 32, 33, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 34, 35, 36, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
        ]

        const map1 = this.make.tilemap({data: bg2, tileWidth: 16, tileHeight: 16})
        map1.addTilesetImage("tiles", "tiles", 16, 16)
        const background = map1.createLayer(0, "tiles", 0, 0)

    }

    initializeLevel(level, timer) {
        level = level ?? this.level
        timer = timer ?? null
        this.currentTimer = timer;
        this.level = new MarioLevel(level, this.visuals);


        const leveltile = this.make.tilemap({data: Transpose(this.level.levelTiles), tileWidth: 16, tileHeight: 16})
        leveltile.addTilesetImage("tiles", "tiles", 16, 16)
        const currground = leveltile.createLayer(0, "tiles", 0, 0)

        this.mario = new Mario(this.visuals, this.level.marioTileX * 16, this.level.marioTileY * 16, this, "mplayer");
        this.mario.alive = true;
        this.mario.world = this;
        this.sprites.push(this.mario);

        //        totalEnemies = getEnemies().size();
    }

    getTotalEnemies() {
        return this.level.totalEnemies;
    }

    getEnemiesRemain() {
        let n = 0;
        for (let x = parseInt((mario.x / 16) + MarioGame.width / 2); x < this.level.tileWidth; x++) {
            n += this.level.enemyNumList.get(x);
        }
        return n;
    }

    getEnemies() {
        let enemies = [];
        for (let sprite in sprites) {
            if (this.isEnemy(sprite)) {
                enemies.push(sprite);
            }
        }
        return enemies;
    }

    clone() {
        let world = new MarioWorld(this.killEvents);
        world.visuals = false;
        world.cameraX = this.cameraX;
        world.cameraY = this.cameraY;
        world.fireballsOnScreen = this.fireballsOnScreen;
        world.gameStatus = this.gameStatus;
        world.pauseTimer = this.pauseTimer;
        world.currentTimer = this.currentTimer;
        world.currentTick = this.currentTick;
        world.level = this.level.clone();
        for (let sprite in this.sprites) {
            let cloneSprite = sprite.clone();
            cloneSprite.world = world;
            if (cloneSprite.type === SpriteType.MARIO) {
                world.mario = cloneSprite;
            }
            world.sprites.push(cloneSprite);
        }
        if (world.mario == null) {
            world.mario = this.mario.clone();
        }
        //stats
        world.coins = this.coins;
        world.lives = this.lives;
        return world;
    }

    addEvent(eventType, eventParam) {
        let marioState = 0;
        if (this.mario.isLarge) {
            marioState = 1;
        }
        if (this.mario.isFire) {
            marioState = 2;
        }
        if (eventType === EventType.STOMP_KILL || eventType === EventType.FIRE_KILL || eventType === EventType.SHELL_KILL)
            this.kills++;
        if (eventType === EventType.COLLECT && eventParam !== MarioForwardModel.OBS_COIN)
            this.items++;
        if (eventType === EventType.JUMP) {
            this.jumps++;
            this.airStart = this.currentTick;
        }
        if (eventType === EventType.LAND)
            this.airTime += (this.currentTick - this.airStart);
        this.lastFrameEvents.push(new MarioEvent(eventType, eventParam, this.mario.x, this.mario.y, marioState, this.currentTick));
    }

    addEffect(effect) {
        this.effects.push(effect);
    }

    addSprite(sprite) {
        this.addedSprites.push(sprite);
        sprite.alive = true;
        sprite.world = this;
        // sprite.added();
        sprite.update();
    }

    removeSprite(sprite) {
        this.removedSprites.push(sprite);
        sprite.alive = false;
        sprite.removed();
        sprite.world = null;
    }

    checkShellCollide(shell) {
        this.shellsToCheck.push(shell);
    }

    checkFireballCollide(fireball) {
        this.fireballsToCheck.push(fireball);
    }

    win() {
        this.addEvent(EventType.WIN, 0);
        this.gameStatus = GameStatus.WIN;
    }

    lose() {
        this.addEvent(EventType.LOSE, 0);
        this.gameStatus = GameStatus.LOSE;
        this.mario.alive = false;
    }

    debug() {
        this.addEvent(EventType.LOSE, 0);
        this.gameStatus = GameStatus.DEBUG;
        this.mario.alive = false;
    }

    timeout() {
        console.log("Java: Time out");
        this.addEvent(EventType.LOSE, 0);
        this.gameStatus = GameStatus.TIME_OUT;
        this.mario.alive = false;
    }

    revive() {
        console.log("revive! from", this.mario.x , this.mario.y)
        let newTileX = parseInt(this.mario.x / 16);
        let newTileY = parseInt( this.mario.y / 16);
        let direction = 1;
        let nobreak = true
        while (nobreak) {
            if (newTileX < this.level.tileWidth) {
                //for (y = this.level.tileHeight-2; y >= 8; y--) {
                for (let y = 0; y <= this.level.tileHeight - 2; y++) {
                    if (this.level.standable(newTileX, y)) {
                        newTileY = y;
                        nobreak = false;
                        break;
                    }
                }
                newTileX += direction;
            } else {
                direction = -1;
                newTileX = this.mario.x / 16;
            }
        }

        this.mario.x = newTileX * 16.0 + 8;
        this.mario.y = newTileY * 16.0;
        console.log("to ", this.mario.x, this.mario.y, "tile Y:", newTileY)
        //Death Buffer
        this.deathBuffer = 50;

    }

    getSceneObservation(centerX, centerY, detail) {
        let ret = new New2DArray(MarioGame.tileWidth, MarioGame.tileHeight);
        let centerXInMap = parseInt(centerX / 16);
        let centerYInMap = parseInt(centerY / 16);
        let obsY = 0
        let obsX = 0
        for (y = centerYInMap - MarioGame.tileHeight / 2; y < centerYInMap + MarioGame.tileHeight / 2; y++, obsY++) {
            for (x = centerXInMap - MarioGame.tileWidth / 2; x < centerXInMap + MarioGame.tileWidth / 2; x++, obsX++) {
                let currentX = x;
                if (currentX < 0) {
                    currentX = 0;
                }
                if (currentX > this.level.tileWidth - 1) {
                    currentX = this.level.tileWidth - 1;
                }
                let currentY = y;
                if (currentY < 0) {
                    currentY = 0;
                }
                if (currentY > this.level.tileHeight - 1) {
                    currentY = this.level.tileHeight - 1;
                }
                ret[obsX][obsY] = MarioForwardModel.getBlockValueGeneralization(this.level.getBlock(currentX, currentY), detail);
            }
        }
        return ret;
    }

    getEnemiesObservation(centerX, centerY, detail) {
        let ret = New2DArray(MarioGame.tileWidth, MarioGame.tileHeight);
        let centerXInMap = parseInt(centerX / 16);
        let centerYInMap = parseInt(centerY / 16);

        for (let w = 0; w < ret.length; w++)
            for (let h = 0; h < ret[0].length; h++)
                ret[w][h] = 0;

        for (let sprite of this.sprites) {
            if (sprite.type === SpriteType.MARIO)
                continue;
            if (sprite.getMapX() >= 0 &&
                sprite.getMapX() > centerXInMap - MarioGame.tileWidth / 2 &&
                sprite.getMapX() < centerXInMap + MarioGame.tileWidth / 2 &&
                sprite.getMapY() >= 0 &&
                sprite.getMapY() > centerYInMap - MarioGame.tileHeight / 2 &&
                sprite.getMapY() < centerYInMap + MarioGame.tileHeight / 2) {
                let obsX = sprite.getMapX() - centerXInMap + MarioGame.tileWidth / 2;
                let obsY = sprite.getMapY() - centerYInMap + MarioGame.tileHeight / 2;
                ret[obsX][obsY] = MarioForwardModel.getSpriteTypeGeneralization(sprite.type, detail);
            }
        }
        return ret;
    }

    getMergedObservation(centerX, centerY, sceneDetail, enemiesDetail) {
        let ret = new New2DArray(MarioGame.tileWidth, MarioGame.tileHeight);
        let centerXInMap = parseInt(centerX / 16);
        let centerYInMap = parseInt(centerY / 16);
        let obsY = 0;
        let obsX = 0;
        for (y = centerYInMap - MarioGame.tileHeight / 2; y < centerYInMap + MarioGame.tileHeight / 2; y++, obsY++) {
            for (x = centerXInMap - MarioGame.tileWidth / 2; x < centerXInMap + MarioGame.tileWidth / 2; x++, obsX++) {
                let currentX = x;
                if (currentX < 0) {
                    currentX = 0;
                }
                if (currentX > this.level.tileWidth - 1) {
                    currentX = this.level.tileWidth - 1;
                }
                let currentY = y;
                if (currentY < 0) {
                    currentY = 0;
                }
                if (currentY > this.level.tileHeight - 1) {
                    currentY = this.level.tileHeight - 1;
                }
                ret[obsX][obsY] = MarioForwardModel.getBlockValueGeneralization(this.level.getBlock(x, y), sceneDetail);
            }
        }

        for (let sprite of this.sprites) {
            if (sprite.type === SpriteType.MARIO)
                continue;
            if (sprite.getMapX() >= 0 &&
                sprite.getMapX() > centerXInMap - MarioGame.tileWidth / 2 &&
                sprite.getMapX() < centerXInMap + MarioGame.tileWidth / 2 &&
                sprite.getMapY() >= 0 &&
                sprite.getMapY() > centerYInMap - MarioGame.tileHeight / 2 &&
                sprite.getMapY() < centerYInMap + MarioGame.tileHeight / 2) {
                obsX = sprite.getMapX() - centerXInMap + MarioGame.tileWidth / 2;
                obsY = sprite.getMapY() - centerYInMap + MarioGame.tileHeight / 2;
                let tmp = MarioForwardModel.getSpriteTypeGeneralization(sprite.type, enemiesDetail);
                if (tmp !== SpriteType.NONE) {
                    ret[obsX][obsY] = tmp;
                }
            }
        }

        return ret;
    }

    isEnemy(sprite) {
        return sprite instanceof Enemy || sprite instanceof FlowerEnemy || sprite instanceof BulletBill;
    }

    update_(actions) {
        // this.cameras.main.scrollX = this.mario.x + this.camera_offset

        if (this.gameStatus !== GameStatus.RUNNING) {
            return;
        }
        if (this.pauseTimer > 0) {
            this.pauseTimer -= 1;
            if (this.visuals) {
                this.mario.updateGraphics();
            }
            return;
        }

        if (this.currentTimer > 0) {
            this.currentTimer -= 30;
            if (this.currentTimer <= 0) {
                this.currentTimer = 0;
                this.timeout();
                return;
            }
        }
        this.currentTick += 1;
        this.cameraX = this.mario.x - MarioGame.width / 2;

        // console.log(this.level.width)
        if (this.cameraX + MarioGame.width > this.level.width) {
            this.cameraX = this.level.width - MarioGame.width;
        }
        if (this.cameraX < 0) {
            this.cameraX = 0;
        }
        this.cameraY = this.mario.y - MarioGame.height / 2;
        if (this.cameraY + MarioGame.height > this.level.height) {
            this.cameraY = this.level.height - MarioGame.height;
        }
        if (this.cameraY < 0) {
            this.cameraY = 0;
        }
        this.cameras.main.scrollX = this.cameraX
        this.cameras.main.scrollY = this.cameraY


        this.lastFrameEvents = [];

        this.fireballsOnScreen = 0;
        for (let sprite of this.sprites) {
            if (sprite.x < this.cameraX - 64 || sprite.x > this.cameraX + MarioGame.width + 64 || sprite.y > this.level.height + 32) {
                // console.log("some body fall!")
                if (sprite.type === SpriteType.MARIO) {
                    // console.log("mario fall!")
                    if (this.lives > 0) {
                        this.mario.getDrop();
                        this.revive();
                    } else
                        this.lose();
                } else {
                    this.removeSprite(sprite);
                    if (this.isEnemy(sprite) && sprite.y > MarioGame.height + 32) {
                        this.addEvent(EventType.FALL_KILL, sprite.type[0] ?? sprite.type);
                    }
                }
                continue;
            }
            if (sprite.type === SpriteType.FIREBALL) {
                this.fireballsOnScreen += 1;
            }
        }
        this.level.update(parseInt(this.cameraX), parseInt(this.cameraY));

        for (let x = parseInt(this.cameraX / 16 - 1); x <= parseInt((this.cameraX + MarioGame.width) / 16 + 1); x++) {
            for (let y = parseInt(this.cameraY / 16 - 1); y <= parseInt((this.cameraY + MarioGame.height) / 16 + 1); y++) {
                let dir = 0;
                if (x * 16 + 8 > this.mario.x + 16)
                    dir = -1;
                if (x * 16 + 8 < this.mario.x - 16)
                    dir = 1;

                let type = this.level.getSpriteType(x, y);
                if (type !== SpriteType.NONE) {
                    let spriteCode = this.level.getSpriteCode(x, y);
                    let found = false;
                    for (let sprite of this.sprites) {
                        if (sprite.initialCode === (spriteCode)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        if (this.level.getLastSpawnTick(x, y) !== this.currentTick - 1) {
                            let sprite = spawnSprite(type, this.visuals, x, y, dir, this);
                            sprite.initialCode = spriteCode;
                            this.addSprite(sprite);
                        }
                    }
                    this.level.setLastSpawnTick(x, y, this.currentTick);
                }

                if (dir !== 0) {
                    let features = TileFeature.getTileType(this.level.getBlock(x, y));
                    if (features.includes(TileFeature.SPAWNER)) {
                        if (this.currentTick % 100 === 0) {
                            this.addSprite(new BulletBill(this.visuals, x * 16 + 8 + dir * 8, y * 16 + 15, dir));
                        }
                    }
                }
            }
        }

        this.mario.actions = actions;
        for (let sprite of this.sprites) {
            if (!sprite.alive) {
                continue;
            }
            sprite.update();
        }
        for (let sprite of this.sprites) {
            if (!sprite.alive) {
                continue;
            }
            sprite.collideCheck();
        }

        for (let shell of this.shellsToCheck) {
            for (let sprite of this.sprites) {
                if (sprite !== shell && shell.alive && sprite.alive) {
                    if (sprite.shellCollideCheck(shell)) {
                        this.removeSprite(sprite);
                    }
                }
            }
        }
        this.shellsToCheck = [];

        for (let fireball of this.fireballsToCheck) {
            for (let sprite of this.sprites) {
                if (sprite !== fireball && fireball.alive && sprite.alive) {
                    if (sprite.fireballCollideCheck(fireball)) {
                        if (this.visuals) {
                            this.addEffect(new FireballEffect(fireball.x, fireball.y));
                        }
                        this.removeSprite(fireball);
                    }
                }
            }
        }
        this.fireballsToCheck = [];

        this.sprites.join(this.addedSprites);
        this.sprites = [...this.sprites, ...this.addedSprites]
        this.sprites.filter((s) => {
            this.removedSprites.includes(s)
        })
        // this.sprites.removeAll(removedSprites);
        this.addedSprites = []
        this.removedSprites = []
        // addedSprites.clear();
        // removedSprites.clear();

        //punishing forward model
        if (this.killEvents !== null) {
            for (let k of this.killEvents) {
                if (this.lastFrameEvents.includes(k)) {
                    //                    if (this.revivable)
                    //                        this.revive();
                    //                    else
                    this.lose();
                }
            }
        }

        // this.cameras.main.scrollY = this.cameraY
    }

    bump(xTile, yTile, canBreakBricks) {
        let block = this.level.getBlock(xTile, yTile);
        let features = TileFeature.getTileType(block);

        if (features.includes(TileFeature.BUMPABLE)) {
            this.bumpInto(xTile, yTile - 1);
            this.addEvent(EventType.BUMP, MarioForwardModel.OBS_QUESTION_BLOCK);
            this.level.setBlock(xTile, yTile, 14);
            this.level.setShiftIndex(xTile, yTile, 4);

            if (features.includes(TileFeature.SPECIAL)) {
                if (!this.mario.isLarge) {
                    this.addSprite(new Mushroom(this.visuals, xTile * 16 + 9, yTile * 16 + 8, this));
                } else {
                    this.addSprite(new FireFlower(this.visuals, xTile * 16 + 9, yTile * 16 + 8, this));
                }
            } else if (features.includes(TileFeature.LIFE)) {
                this.addSprite(new LifeMushroom(this.visuals, xTile * 16 + 9, yTile * 16 + 8, this));
            } else {
                this.mario.collectCoin();
                if (this.visuals) {
                    this.addEffect(new CoinEffect(xTile * 16 + 8, (yTile) * 16));
                }
            }
        }

        if (features.includes(TileFeature.BREAKABLE)) {
            this.bumpInto(xTile, yTile - 1);
            if (canBreakBricks) {
                this.addEvent(EventType.BUMP, MarioForwardModel.OBS_BRICK);
                this.level.setBlock(xTile, yTile, 0);
                if (this.visuals) {
                    for (let xx = 0; xx < 2; xx++) {
                        for (let yy = 0; yy < 2; yy++) {
                            this.addEffect(new BrickEffect(xTile * 16 + xx * 8 + 4, yTile * 16 + yy * 8 + 4,
                                (xx * 2 - 1) * 4, (yy * 2 - 1) * 4 - 8));
                        }
                    }
                }
            } else {
                this.level.setShiftIndex(xTile, yTile, 4);
            }
        }
    }

    bumpInto(xTile, yTile) {
        let block = this.level.getBlock(xTile, yTile);
        if (TileFeature.getTileType(block).includes(TileFeature.PICKABLE)) {
            this.addEvent(EventType.COLLECT, block);
            this.mario.collectCoin();
            this.level.setBlock(xTile, yTile, 0);
            if (this.visuals) {
                this.addEffect(new CoinEffect(xTile * 16 + 8, yTile * 16 + 8));
            }
        }

        for (let sprite of this.sprites) {
            sprite.bumpCheck(xTile, yTile);
        }
    }

    render(og) {
        for (let i = 0; i < backgrounds.length; i++) {
            this.backgrounds[i].render(this, parseInt(this.cameraX), parseInt(this.cameraY));
        }
        for (let sprite of this.sprites) {
            if (sprite.type === SpriteType.MUSHROOM || sprite.type === SpriteType.LIFE_MUSHROOM ||
                sprite.type === SpriteType.FIRE_FLOWER || sprite.type === SpriteType.ENEMY_FLOWER) {
                sprite.render(this);
            }
        }
        this.level.render(this, parseInt(this.cameraX), parseInt(this.cameraY));
        for (let sprite of this.sprites) {
            if (sprite.type !== SpriteType.MUSHROOM && sprite.type !== SpriteType.LIFE_MUSHROOM &&
                sprite.type !== SpriteType.FIRE_FLOWER && sprite.type !== SpriteType.ENEMY_FLOWER) {
                sprite.render(this);
            }
        }
        for (let i = 0; i < this.effects.size(); i++) {
            if (this.effects.get(i).life <= 0) {
                this.effects.remove(i);
                i--;
                continue;
            }
            this.effects.get(i).render(this, this.cameraX, this.cameraY);
        }
    }

    setCurrentTimer(currentTimer) {
        this.currentTimer = currentTimer;
    }

    setRevivable(revivable) {
        this.revivable = revivable;
    }
}
