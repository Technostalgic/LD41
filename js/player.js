///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class player{
    constructor(){
        this.hitBox = collisionModule.boxCollider(new collisionBox(new vec2(), new vec2(20, 10)));
        this.pos = new vec2();
        this.vel = new vec2();
    }

    applyGravity(){
        var gravity = 10;
        this.vel = this.vel.plus(new vec2(0, gravity).multiply(dt));
    }
    applyAirFriction(){
        var frictionCoefficient = 0.8;
        var f = ((frictionCoefficient - 1) * dt) + 1;
        this.vel = this.vel.multiply(f);
    }

    update(){
        this.pos = this.pos.plus(this.vel.multiply(dt));
        this.applyGravity();
        this.applyAirFriction();

        this.hitBox.centerAtPoint(this.pos);
    }
    draw(){
        this.hitBox.draw();
    }
}