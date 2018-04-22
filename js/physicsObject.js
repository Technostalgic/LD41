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
    }

    applyGravity(){
        var gravity = 1250;
        this.vel = this.vel.plus(new vec2(0, gravity).multiply(dt));
    }
    applyAirFriction(){
        var frictionCoefficient = 0.8;
        var f = ((frictionCoefficient - 1) * ((dt - 1) * frictionCoefficient + 1)) + 1;
        this.vel = this.vel.multiply(f);
    }
    applyGroundFriction(){
        var frictionCoefficient = 0.5;
        var f = ((frictionCoefficient - 1) * ((dt - 1) * frictionCoefficient + 1)) + 1;
        this.vel.x *= f;
    }

    checkObjectCollision(obj){
        if(obj == this) return;
        
        var coll = obj.hitBox.getCollision(this.hitBox)
        if(coll) this.objectCollide(obj);
    }
    objectCollide(obj){
    }
    terrainCollide(terrain){
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