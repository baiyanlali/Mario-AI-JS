import {Scene} from "./phaser.esm.js";

export class TestWorld extends Scene{
    constructor(){
        super("test scene")
    }

    preload(){
        this.load.image("tiles", "assets/mapsheet.png")
    }

    create(){
        const array =[[0,1,3],[0,1,2],[0,1,2]]
        const map = this.make.tilemap({data: array, tileWidth: 16, tileHeight: 16})
        map.addTilesetImage("tiles", "tiles", 16, 16)
        const layer = map.createLayer(0, "tiles", 0, 0)
    }
}