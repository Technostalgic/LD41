///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class gameState{
    constructor(){
        this.startTime = lastRecordedTimeStamp;
    }

    get timeElapsed(){
        return lastRecordedTimeStamp - this.startTime;
    }

    controlTap(controlID){ }
    controlPress(controlID){ }

    update(){}
    draw(){}
}

class gameState_gamePlay extends gameState{
    constructor(){
        super();

        this.player = new player();
        this.enemies = [];
        this.props = [];
    }

    update(){
        controlState.update();
        this.player.update();
    }
    draw(){
        this.player.draw();
    }

    controlTap(controlID){
        switch(controlID){
            case controlState.controlEnum.jump:
                this.player.action_jump();
                break;
        }
    }
    controlPress(controlID){
        switch(controlID){
            case controlState.controlEnum.left:
                this.player.action_move(-1);
                break;
            case controlState.controlEnum.right: 
                this.player.action_move(1);
                break;
            case controlState.controlEnum.up: break;
            case controlState.controlEnum.down: break;
            case controlState.controlEnum.jump:
                this.player.action_jumpSustain();
                break;
            case controlState.controlEnum.use: break;
            case controlState.controlEnum.pause: break;
        }
    }
}