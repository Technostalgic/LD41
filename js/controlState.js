///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class controlState{
    constructor(){ }

    static init(){
        controlState.keysPressed = [];
        controlState.controlEnum = {
            left: 0,
            right: 1,
            up: 2,
            down: 3,
            jump: 4,
            use: 5,
            pause: 6,
            start: 7
        };
        controlState.controls = [
            37,
            39,
            38,
            40,
            90,
            88,
            27,
            32
        ];
        controlState.startKeyboardEventHandlers();
    }

    static event_keyPress(e){
        if(!controlState.keysPressed.includes(e.keyCode)){
            controlState.keysPressed.push(e.keyCode);

            var m = controlState.getControlID(e.keyCode);
            if(m != null) state.controlTap(m);
        }
        
        //console.log(e.key + ": " + e.keyCode);
    }
    static event_keyRelease(e){
        var keyIndex = controlState.keysPressed.indexOf(e.keyCode);
        if(keyIndex >= 0) 
        controlState.keysPressed.splice(keyIndex, 1);
    }
    static startKeyboardEventHandlers(){
        window.addEventListener("keydown", controlState.event_keyPress);
        window.addEventListener("keyup", controlState.event_keyRelease);
    }

    static getControlID(keyCode){
        var r = controlState.controls.indexOf(keyCode);
        if(r >= 0) return r;
        return null;
    }
    static getControlsPressed(){
        var r = [];

        this.keysPressed.forEach(function(key){
            let cnum = controlState.controls.indexOf(key);
            if(cnum >= 0)
                r.push(cnum);
        });

        return r;
    }
    static update(){
        var controlsPressed = controlState.getControlsPressed();
        controlsPressed.forEach(function(controlID){
            state.controlPress(controlID);
        });
    }
}