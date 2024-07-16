import MarioGame from "./engine/core/MarioGame.js";
import Replay from "./engine/helper/Replay.js";
import {New2DArray} from "./Util.js";

async function getLevel(filepath) {
    let response = await fetch(filepath)
    return await response.text()
}

async function getAgent(repPath){
    return Replay.getRepAgentFromFile(repPath);
}

let game = new MarioGame()
game.setLives(5)
let levelPath = "../levels/original/lvl-1.txt";			// For local
let repPath = "../reps/b179cbd3-ee8e-48de-baf8-da6438461d1d_lvl155.rep";
let level = await getLevel(levelPath)

let agent = await getAgent(repPath)
let result = game.playGame(agent, level, 60, repPath, 30)
