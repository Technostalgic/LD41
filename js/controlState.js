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
            primary: 5,
            secondary: 6,
            pause: 7,
            start: 8
        };
        controlState.controls = [
            37,
            39,
            38,
            40,
            90,
            67,
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
        state.preInput();
        
        var controlsPressed = controlState.getControlsPressed();
        
        // ensure the primary control is always the last in the list of pressed controls
        var primIndex = controlsPressed.indexOf(controlState.controlEnum.primary);
        if(primIndex >= 0){
            controlsPressed.splice(primIndex, 1);
            controlsPressed.push(controlState.controlEnum.primary);
        }

        controlsPressed.forEach(function(controlID){
            state.controlPress(controlID);
        });
    }
}