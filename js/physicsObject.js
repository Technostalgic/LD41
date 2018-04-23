///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class physicsObject{
    constructor(){
        this.pos = new vec2();
        this.vel = new vec2();
        this.hitBox = new collisionModule();
        this.onGround = false;

        this.gravity = 1250;
        this.airFriction = 0.8;
        this.groundFriction = 0.5;

        this.ignoreTypes = [];
    }

    applyGravity(){
        this.vel = this.vel.plus(new vec2(0, this.gravity).multiply(dt));
    }
    applyAirFriction(){
        var f = ((this.airFriction - 1) * ((dt - 1) * this.airFriction + 1)) + 1;
        this.vel = this.vel.multiply(f);
    }
    applyGroundFriction(){
        var f = ((this.groundFriction - 1) * ((dt - 1) * this.groundFriction + 1)) + 1;
        this.vel.x *= f;
    }

    ignoresType(obj){
        for(var i = this.ignoreTypes.length - 1; i >= 0; i--)
            if(obj instanceof this.ignoreTypes[i])
                return true;
        return false;
    }
    checkObjectCollision(obj){
        if(this.ignoresType(obj)) return;
        if(obj == this) return;
        
        var coll = obj.hitBox.getCollision(this.hitBox)
        if(coll) this.objectCollide(obj, coll);
    }
    objectCollide(obj){
    }
    terrainCollide(terrain){
    }

    add(){
        state.physObjects.push(this);
    }
    remove(){
        var index = state.physObjects.indexOf(this);
        if(index >= 0)
            state.physObjects.splice(index, 1);
    }

    handleTerrainCollisions(terrains){
        this.onGround = false;

        var ths = this;
        terrains.forEach(function(terrain){
            terrain.checkCollision(ths);
        });
        this.updateHitBox();
    }
    handleObjectCollisions(phyObjs){
        var ths = this;
        phyObjs.forEach(function(obj){
            ths.checkObjectCollision(obj);
        });
        this.updateHitBox();
    }
    updateHitBox(){
        this.hitBox.centerAtPoint(this.pos);
    }
    
    update(){
        this.applyGravity();
        this.applyAirFriction();
        if(this.onGround)
            this.applyGroundFriction();
        
        this.pos = this.pos.plus(this.vel.multiply(dt));
        this.updateHitBox();
    }
    draw(){
        this.hitBox.draw();
    }
}