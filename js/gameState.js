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

    preInput(){}
    controlTap(controlID){ }
    controlPress(controlID){ }

    update(){}
    draw(){}
}

class gameState_gamePlay extends gameState{
    constructor(){
        super();

        this.player = new player();
        this.player.pos = new vec2(renderCanvas.width / 2);

        this.enemies = [];
        this.props = [];

        this.terrain = getTerrainScreenBounds();
    }

    update(){
        controlState.update();
        this.player.update();
    }
    draw(){
        this.player.draw();
        
        this.terrain.forEach(function(terrain){
            terrain.draw();
        });

        this.drawHUD();
    }

    drawHUD(){
        var col = color.White();
        col.a = 0.35;

        col.setFill();
        renderContext.fillRect(0, 0, renderCanvas.width, 125);
    }

    preInput(){
        this.player.preInput();
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