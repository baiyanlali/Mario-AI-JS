import MarioAgent from "../engine/core/MarioAgent.js";

export default class ReplayAgent extends MarioAgent{
    actions;
    isPressed = false;
    p = 0;
    constructor(actions) {
        super();
        this.actions = actions
    }

    getActions(model, timer) {
        if(!this.isPressed){
            if(this.p >= this.actions.length)
                return [false, false, false, false, false, false]
            return this.actions[this.p++]
        }else{
            return [false, true, true, true, true, true]
        }
    }

    getAgentName() {
        return "ReplayAgent"
    }

}