import MarioGame from "./MarioGame.js";
import {New2DArray} from "../../Util.js";
import {SpriteType} from "../helper/SpriteType.js";
import { TileFeature } from "../helper/TileFeature.js";
export default class MarioLevel {

    width = MarioGame.width;
    tileWidth = MarioGame.width / 16;
    height = MarioGame.height;
    tileHeight = MarioGame.height / 16;
    totalCoins = 0;
    marioTileX;
    marioTileY;
    exitTileX;
    exitTileY;

    levelTiles;
    spriteTemplates;
    lastSpawnTime;
    solidMap;
    graphics;
    flag;

    constructor(level, visuals) {
        if (level.trim().length === 0) {
            this.tileWidth = 0;
            this.width = 0;
            this.tileHeight = 0;
            this.height = 0;
            return;
        }
        let lines = level.split("\n");
        this.tileHeight = lines[0].length;
        this.tileWidth = lines.length;
        this.width = this.tileHeight * 16;
        this.height = this.tileWidth * 16;
        // console.log(level)
        // console.log(lines)
        this.levelTiles = New2DArray(lines.length, lines[0].length, 0)
        this.spriteTemplates = New2DArray(lines.length, lines[0].length, SpriteType.NONE)
        this.lastSpawnTime = New2DArray(lines.length, lines[0].length, -40)
        this.solidMap = New2DArray(lines.length, lines[0].length, false)
        for (let x = 0; x < lines.length; x++) {
            for (let y = 0; y < lines[x].length; y++) {
                this.levelTiles[x][y] = 0;
                this.spriteTemplates[x][y] = SpriteType.NONE;
                this.lastSpawnTime[x][y] = -40;
            }
        }

        let marioLocInit = false;
        let exitLocInit = false;
        for (let x = 0; x < lines.length; x++) {
            for (let y = 0; y < lines[x].length; y++) {
                let c = lines[x].charAt(y);
                this.solidMap[x][y] = this.isSolid(c);
                switch (c) {
                    case 'M':
                        this.marioTileX = x;
                        this.marioTileY = y;
                        marioLocInit = true;
                        break;
                    case 'F':
                        this.exitTileX = x;
                        this.exitTileY = y;
                        exitLocInit = true;
                        break;
                    case 'y':
                        this.spriteTemplates[x][y] = SpriteType.SPIKY;
                        break;
                    case 'Y':
                        this.spriteTemplates[x][y] = SpriteType.SPIKY_WINGED;
                        break;
                    case 'E':
                    case 'g':
                        this.spriteTemplates[x][y] = SpriteType.GOOMBA;
                        break;
                    case 'G':
                        this.spriteTemplates[x][y] = SpriteType.GOOMBA_WINGED;
                        break;
                    case 'k':
                        this.spriteTemplates[x][y] = SpriteType.GREEN_KOOPA;
                        break;
                    case 'K':
                        this.spriteTemplates[x][y] = SpriteType.GREEN_KOOPA_WINGED;
                        break;
                    case 'r':
                        this.spriteTemplates[x][y] = SpriteType.RED_KOOPA;
                        break;
                    case 'R':
                        this.spriteTemplates[x][y] = SpriteType.RED_KOOPA_WINGED;
                        break;
                    case 'X':
                        //floor
                        this.levelTiles[x][y] = 1;
                        break;
                    case '#':
                        //pyramidBlock
                        this.levelTiles[x][y] = 2;
                        break;
                    case '%':
                        //jump through block
                    {
                        let tempIndex = 0;
                        if (x > 0 && lines[x].charAt(y - 1) === '%') {
                            tempIndex += 2;
                        }
                        if (x < this.levelTiles.length - 1 && lines[x].charAt(y + 1) === '%') {
                            tempIndex += 1;
                        }
                        this.levelTiles[x][y] = 43 + tempIndex;
                        break;
                    }
                    case '|':
                        //background for jump through block
                        this.levelTiles[x][y] = 47;
                        break;
                    case '*':
                        //bullet bill
                    {
                        let tempIndex = 0;
                        if (y > 0 && lines[x - 1].charAt(y) === '*') {
                            tempIndex += 1;
                        }
                        if (y > 1 && lines[x - 2].charAt(y) === '*') {
                            tempIndex += 1;
                        }
                        this.levelTiles[x][y] = 3 + tempIndex;
                        break;
                    }
                    case 'B':
                        //bullet bill head
                        this.levelTiles[x][y] = 3;
                        break;
                    case 'b': {
                        //bullet bill neck and body
                        let tempIndex = 0;
                        if (y > 1 && lines[x - 2].charAt(y) === 'B') {
                            tempIndex += 1;
                        }
                        this.levelTiles[x][y] = 4 + tempIndex;
                        break;
                    }
                    case '?':
                    case '@':
                        //mushroom question block
                        this.levelTiles[x][y] = 8;
                        break;
                    case 'Q':
                    case '!':
                        //coin question block
                        this.totalCoins += 1;
                        this.levelTiles[x][y] = 11;
                        break;
                    case '1':
                        //invisible 1 up block
                        this.levelTiles[x][y] = 48;
                        break;
                    case '2':
                        //invisible coin block
                        this.totalCoins += 1;
                        this.levelTiles[x][y] = 49;
                        break;
                    case 'D':
                        //used
                        this.levelTiles[x][y] = 14;
                        break;
                    case 'S':
                        //normal block
                        this.levelTiles[x][y] = 6;
                        break;
                    case 'C':
                        //coin block
                        this.totalCoins += 1;
                        this.levelTiles[x][y] = 7;
                        break;
                    case 'U':
                        //mushroom block
                        this.levelTiles[x][y] = 50;
                        break;
                    case 'L':
                        //1up block
                        this.levelTiles[x][y] = 51;
                        break;
                    case 'o':
                        //coin
                        this.totalCoins += 1;
                        this.levelTiles[x][y] = 15;
                        break;
                    case 't': {
                        //empty Pipe
                        let tempIndex = 0;
                        let singlePipe = false;
                        if (x < lines[x].length - 1 && Character.toLowerCase(lines[x].charAt(y + 1)) !== 't' &&
                            x > 0 && Character.toLowerCase(lines[x].charAt(y - 1)) !== 't') {
                            singlePipe = true;
                        }
                        if (x > 0 && (this.levelTiles[x - 1][y] === 18 || this.levelTiles[x - 1][y] === 20)) {
                            tempIndex += 1;
                        }
                        if (y > 0 && Character.toLowerCase(lines[x - 1].charAt(y)) === 't') {
                            if (singlePipe) {
                                tempIndex += 1;
                            } else {
                                tempIndex += 2;
                            }
                        }
                        if (singlePipe) {
                            this.levelTiles[x][y] = 52 + tempIndex;
                        } else {
                            this.levelTiles[x][y] = 18 + tempIndex;
                        }
                        break;
                    }
                    case 'T': {
                        //flower pipe
                        let tempIndex = 0;
                        let singlePipe = x < lines[x].length - 1 && lines[x].charAt(y + 1).toLowerCase() !== 't' &&
                            x > 0 && lines[x].charAt(y - 1).toLowerCase() !== 't';
                        if (x > 0 && (this.levelTiles[x - 1][y] === 18 || this.levelTiles[x - 1][y] === 20)) {
                            tempIndex += 1;
                        }
                        if (y > 0 && lines[x - 1].charAt(y).toLowerCase() === 't') {
                            if (singlePipe) {
                                tempIndex += 1;
                            } else {
                                tempIndex += 2;
                            }
                        }
                        if (singlePipe) {
                            this.levelTiles[x][y] = 52 + tempIndex;
                        } else {
                            if (tempIndex === 0) {
                                this.spriteTemplates[x][y] = SpriteType.ENEMY_FLOWER;
                            }
                            this.levelTiles[x][y] = 18 + tempIndex;
                        }
                        break;
                    }
                    case '<':
                        //pipe top left
                        this.levelTiles[x][y] = 18;
                        break;
                    case '>':
                        //pipe top right
                        this.levelTiles[x][y] = 19;
                        break;
                    case '[':
                        //pipe body left
                        this.levelTiles[x][y] = 20;
                        break;
                    case ']':
                        //pipe body right
                        this.levelTiles[x][y] = 21;
                        break;
                }
            }
        }
        // TODO: Find first floor may crash
        if (!marioLocInit) {
            this.marioTileY = 0;
            this.marioTileX = this.findFirstFloor(lines, this.marioTileY);
        }
        if (!exitLocInit) {
            this.exitTileY = lines[0].length - 1;
            this.exitTileX = this.findFirstFloor(lines, this.exitTileY);
            // console.log("exit tile x", this.exitTileX)
        }
        for (let y = this.exitTileY; y > Math.max(1, this.exitTileY - 11); y--) {
            this.levelTiles[this.exitTileX][y] = 40;
        }
        this.levelTiles[this.exitTileX][Math.max(1, this.exitTileY - 11)] = 39;

    }

    clone() {
        let level = new MarioLevel("", false);
        level.width = this.width;
        level.height = this.height;
        level.tileWidth = this.tileWidth;
        level.tileHeight = this.tileHeight;
        level.totalCoins = this.totalCoins;
        level.marioTileX = this.marioTileX;
        level.marioTileY = this.marioTileY;
        level.exitTileX = this.exitTileX;
        level.exitTileY = this.exitTileY;
        //TODO: fix this
        level.levelTiles = new int[this.levelTiles.length][this.levelTiles[0].length];
        level.lastSpawnTime = new int[this.levelTiles.length][this.levelTiles[0].length];
        level.solidMap = new boolean[this.levelTiles.length][this.levelTiles[0].length];
        for (x = 0; x < level.levelTiles.length; x++) {
            for (y = 0; y < level.levelTiles[x].length; y++) {
                level.levelTiles[x][y] = this.levelTiles[x][y];
                level.lastSpawnTime[x][y] = this.lastSpawnTime[x][y];
                level.solidMap[x][y] = this.solidMap[x][y];
            }
        }
        level.spriteTemplates = this.spriteTemplates;
        return level;
    }

    isBlocking(xTile, yTile, xa, ya) {
        //xTile 指横着的，代表的是Y， yTile相反
        let block = this.getBlock(yTile, xTile);
        let features = TileFeature.getTileType(block);
        let blocking = features.includes(TileFeature.BLOCK_ALL);
        blocking |= (ya < 0) && features.includes(TileFeature.BLOCK_UPPER);
        blocking |= (ya > 0) && features.includes(TileFeature.BLOCK_LOWER);

        return blocking;
    }

    getBlock(xTile, yTile) {
        if (xTile < 0) {
            xTile = 0;
        }
        if (xTile > this.tileWidth - 1) {
            xTile = this.tileWidth - 1;
        }
        if (yTile < 0 || yTile > this.tileHeight - 1) {
            return 0;
        }
        return this.levelTiles[xTile][yTile];
    }

    setBlock(xTile, yTile, index) {
        if (xTile < 0 || yTile < 0 || xTile > this.tileWidth - 1 || yTile > this.tileHeight - 1) {
            return;
        }
        this.levelTiles[xTile][yTile] = index;
    }

    setShiftIndex(xTile, yTile, shift) {
        if (this.graphics == null || xTile < 0 || yTile < 0 || xTile > this.tileWidth - 1 || yTile > this.tileHeight - 1) {
            return;
        }
        this.graphics.moveShift[xTile][yTile] = shift;
    }

    getSpriteType(xTile, yTile) {
        if (xTile < 0 || yTile < 0 || xTile >= this.tileWidth || yTile >= this.tileHeight) {
            return SpriteType.NONE;
        }
        return this.spriteTemplates[xTile][yTile];
    }

    getLastSpawnTick(xTile, yTile) {
        if (xTile < 0 || yTile < 0 || xTile > this.tileWidth - 1 || yTile > this.tileHeight - 1) {
            return 0;
        }
        return this.lastSpawnTime[xTile][yTile];
    }

    setLastSpawnTick(xTile, yTile, tick) {
        if (xTile < 0 || yTile < 0 || xTile > this.tileWidth - 1 || yTile > this.tileHeight - 1) {
            return;
        }
        this.lastSpawnTime[xTile][yTile] = tick;
    }

    getSpriteCode(xTile, yTile) {
        return xTile + "_" + yTile + "_" + this.getSpriteType(xTile, yTile)[0]??this.getSpriteType(xTile, yTile);
    }

    isSolid(c) {
        return c === 'X' || c === '#' || c === '@' || c === '!' || c === 'B' || c === 'C' ||
            c === 'Q' || c === '<' || c === '>' || c === '[' || c === ']' || c === '?' ||
            c === 'S' || c === 'U' || c === 'D' || c === '%' || c === 't' || c === 'T';
    }

    findFirstFloor(lines, y) {
        let skipLines = true;
        for (let i = lines.length - 1; i >= 0; i--) {
            let c = lines[i].charAt(y);
            if (this.isSolid(c)) {
                skipLines = false;
                continue;
            }
            if (!skipLines && !this.isSolid(c)) {
                return i;
            }
        }
        return -1;
    }

    update(cameraX, cameraY) {

    }

    render(og, cameraX, cameraY) {
        this.graphics.render(og, cameraX, cameraY);
        if (cameraX + MarioGame.width >= this.exitTileY * 16) {
            this.flag.render(og, this.exitTileY * 16 - 8 - cameraX, Math.max(1, this.exitTileX - 11) * 16 + 16 - cameraY);
        }
    }

    standable(yTile, xTile) {

        if (xTile >= this.tileHeight)
            return false;
        else
            return !this.solidMap[xTile][yTile] && this.solidMap[xTile+1][yTile];
    }
}