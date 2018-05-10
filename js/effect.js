///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class effect{
    constructor(){
        this.pos = new vec2();
        this.frameCount = 1;
        this.animRate = 33;
        this.spriteSheet = null;
        this.frameWidth = 0;
        this.isFlippedX = Math.random() >= 5;
        this.isFlippedY = Math.random() >= 5;
        this.scale = 1;

        this._startTime = state.timeElapsed;
    }

    static build(spritesheet, frameCount, animRate = 33){
        var r = new effect();

        r.spriteSheet = spritesheet;
        r.animRate = animRate;
        r.frameWidth = Math.floor(spritesheet.width / frameCount);
        r.frameCount = frameCount;

        return r;
    }
    static fx_hit(pos){
        var r = effect.build(gfx.effect_hit, 10, 33);
        r.pos = pos.clone();
        r.add();
    }
    static fx_explosion(pos, scale = 1){
        var r = effect.build(gfx.effect_explosion, 7, 33);
        r.pos = pos.clone();
        r.scale = scale;
        r.add();
    }
    static fx_explosionBlue(pos, vel, spread){
        var r = effect.build(gfx.effect_explosionBlue, 7, 33);
        r.pos = pos.clone();
        r.add();
    }
	
	
    add(){
        state.effects.push(this);
    }
    remove(){
        var index = state.effects.indexOf(this);
        if(index >= 0)
            state.effects.splice(this, 1);
    }
    
    getCurrentFrame(){
        var timeOffset = state.timeElapsed - this._startTime;
        var fr = Math.floor(timeOffset / this.animRate);
        if(fr >= this.frameCount)
            return null;
        return fr;
    }
    getSprite(){
        var frame = this.getCurrentFrame();
        if(frame == null) return null;

        var r = new spriteContainer(
            this.spriteSheet,
            new spriteBox(
                new vec2(this.frameWidth * frame, 0), 
                new vec2(this.frameWidth, this.spriteSheet.height)
            )
        );
        r.bounds.size = r.bounds.size.multiply(this.scale);
        r.bounds.setCenter(this.pos);
        r.isFlippedX = this.isFlippedX;
        r.isFlippedY = this.isFlippedY;

        return r;
    }
    draw(){
        var sprite = this.getSprite();
        if(!sprite) {
            this.remove();
            return;
        }
        sprite.draw();
    }
}