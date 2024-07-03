import MarioWorld from "./MarioWorld.js";
import {GameStatus} from "../helper/GameStatus.js";
import Replay from "../helper/Replay.js";
import MarioResult from "./MarioResult.js";
import * as Phaser from "../../phaser.esm.js";
import { MarioTimer } from "./MarioTimer.js";
import MarioAgentEvent from "./MarioAgentEvent.js";
import HumanAgent from "../../agents/HumanAgent.js";

export default class MarioGame {
    /**
     * the maximum time that agent takes for each step
     */
    static maxTime = 40;
    /**
     * extra time before reporting that the agent is taking more time that it should
     */
    static graceTime = 10;
    /**
     * Screen width
     */
    static width = 256;
    /**
     * Screen height
     */
    static height = 256;
    /**
     * Screen width in tiles
     */
    static tileWidth = this.width / 16;
    /**
     * Screen height in tiles
     */
    static tileHeight = this.height / 16;
    /**
     * print debug details
     */
    static verbose = false;

    /**
     * pauses the whole game at any moment
     */
    pause = false;

    /**
     * events that kills the player when it happens only care about type and param
     */
    killEvents;

    //visualization
    window = null;
    render = null;
    /**@type {MarioAgent} */
    agent = null;
    /**@type {MarioWorld} */
    world = null;
    /**@type {Phaser.Game}*/
    game;
    initialLives;


    /**
     * Create a mario game with a different forward model where the player on certain event
     *
     * @param killEvents events that will kill the player
     */
    constructor(killEvents) {
        this.killEvents = killEvents;
    }


    getDelay(fps) {
        if (fps <= 0) {
            return 0;
        }
        return 1000 / fps;
    }

    setAgent(agent) {
        this.agent = agent;
        // if (agent instanceof KeyAdapter) {
        //     this.render.addKeyListener(this.agent);
        // }
    }

    /**
     * Play a certain mario level
     *
     * @param gameAgent MarioAgent
     * @param level a that constitutes the mario level, it uses the same representation as the VGLC but with more details. for more details about each symbol check the json file in the levels folder.
     * @param timer number of ticks for that level to be played. Setting timer to anything &lt;=0 will make the time infinite
     * @param resultPath
     * @param col
     * @return statistics about the current game
     */
    playGame(gameAgent, level, timer, resultPath, col) {
        return this.runGame(gameAgent, level, timer, 0, true, 60, 2, resultPath, col);
    }



    /**
     * Run a certain mario level with a certain agent
     *
     * @param agent      the current AI agent used to play the game
     * @param level      a that constitutes the mario level, it uses the same representation as the VGLC but with more details. for more details about each symbol check the json file in the levels folder.
     * @param timer      number of ticks for that level to be played. Setting timer to anything &lt;=0 will make the time infinite
     * @param marioState the initial state that mario appears in. 0 small mario, 1 large mario, and 2 fire mario.
     * @param visuals    show the game visuals if it is true and false otherwise
     * @param fps        the number of frames per second that the update function is following
     * @param scale      the screen scale, that scale value is multiplied by the actual width and height
     * @param resultPath
     * @param col
     * @return statistics about the current game
     */
    runGame(agent, level, timer, marioState, visuals, fps, scale, resultPath, col) {
        if (visuals) {

            this.world = new MarioWorld(null, {
                key: "SceneMain",
                active: true,
                visible: true
            })
            const config = {
                width: MarioGame.width,
                height: MarioGame.height,
                type: Phaser.AUTO,
                pixelArt: true,
                scene: this.world,
                backgroundColor: "#6d8ffc",
                fps:{
                    target:fps
                }
            }
            this.game = new Phaser.Game(config)

        }
        this.world.level = level;
        this.setAgent(agent);
        // this.setAgent(humanagent);

        this.world.onReady = ()=>{
            this.gameLoop(level, timer, marioState, visuals, fps, resultPath, col)
            const humanagent = new HumanAgent(this.world)
            this.setAgent(humanagent)
        }
    }

    gameLoop(level, timer, marioState, visual, fps, resultPath, col) {

        // this.world = new MarioWorld(this.killEvents);
        this.world.visuals = visual;
        // this.world.initializeLevel(level, 1000 * timer);
        // if (visual) {
        //     this.world.initializeVisuals(null);
        // }
        this.world.lives = this.initialLives;
        this.world.mario.isLarge = marioState > 0;
        this.world.mario.isFire = marioState > 1;


        let currentTime = Date.now();

        let agentTimer = new MarioTimer(MarioGame.maxTime);
        //TODO: MarioForwardModel
        //this.agent.initialize(new MarioForwardModel(this.world.clone()), agentTimer);
        this.agent.initialize(null, agentTimer);

        let gameEvents = [];
        let agentEvents = [];
        let replayBreak = false;
        let cheatBreak = false;
        let segNum = 0;

        this.world.onUpdate = ()=>{
            if(this.world.gameStatus !== GameStatus.RUNNING){
                console.log("game end!" + this.world.gameStatus)
                let res = new MarioResult(this.world, gameEvents, agentEvents);
                if (!resultPath && !replayBreak) {
                    Replay.saveReplay(resultPath, res.getAgentEvents());
                }
                return new MarioResult(this.world, gameEvents, agentEvents);
            }
            if (!this.pause) {
                //Update Timer

                if (this.world.mario.x / (16 * col) > segNum) {
                    segNum++;
                    this.world.setCurrentTimer(1000 * timer);
                }

                agentTimer = new MarioTimer(MarioGame.maxTime);
                //get actions
                //boolean[] actions = this.agent.getActions(new MarioForwardModel(this.world), agentTimer);
                //TODO: MarioForwardModel
                let actions = this.agent.getActions(null, agentTimer);
                // if (MarioGame.verbose) {
                //     if (agentTimer.getRemainingTime() < 0 && Math.abs(agentTimer.getRemainingTime()) > MarioGame.graceTime) {
                //         console.log("The Agent is slowing down the game by: "
                //             + Math.abs(agentTimer.getRemainingTime()) + " msec.");
                //     }
                // }
                if (timer === 0) {
                    this.world.lose();
                    replayBreak = true;
                }
                // Mid Break & Cheat Mode
                if (actions[0] && !actions[1] && actions[2] && actions[3] && actions[4] && actions[5]) {
                    this.world.debug();
                    cheatBreak = true;
                    //break;
                }
                if (!actions[0] && actions[1] && actions[2] && actions[3] && actions[4] && actions[5]) {
                    this.world.debug();
                    replayBreak = true;
                    //break;
                }
                if (this.world.deathBuffer > 0) {
                    actions = new Array(6).fill(false)
                    this.world.deathBuffer--;
                } else {
                    this.world.deathBuffer = 0;
                }
                
                
                // update world
                this.world.update_(actions);
                //System.out.println((int) this.world.mario.y / 16);
                gameEvents.push(this.world.lastFrameEvents)
                // gameEvents.addAll(this.world.lastFrameEvents);
                agentEvents.push(new MarioAgentEvent(actions, this.world.mario.x,
                    this.world.mario.y, (this.world.mario.isLarge ? 1 : 0) + (this.world.mario.isFire ? 1 : 0),
                    this.world.mario.onGround, this.world.currentTick));
            }

        }

    }

    stopGame() {
        this.world.lose();
    }


    keyPressed(e) {
        toggleKey(e.getKeyCode(), true);
    }


    keyReleased(e) {
        toggleKey(e.getKeyCode(), false);
    }

    toggleKey(keyCode, isPressed) {
        if (keyCode == KeyEvent.VK_Q) {
            if (isPressed) {
                stopGame();
                System.out.println("Pressed mg");
            }
        }
    }

    setLives(lives) {
        this.initialLives = lives;
    }


}

