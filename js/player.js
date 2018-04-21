///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class player{
    constructor(){
        this.hitBox = collisionModule.boxCollider(new vec2(20, 30));
        this.pos = new vec2();
        this.vel = new vec2();
        this.maxSpeed = 500;
        this.acceleration = 2500;
        this.xMove = 0;

        this.onGround = false;
    }

    applyGravity(){
        var gravity = 3000;
        this.vel = this.vel.plus(new vec2(0, gravity).multiply(dt));
    }
    applyAirFriction(){
        var frictionCoefficient = 0.8;
        var f = ((frictionCoefficient - 1) * ((dt - 1) * frictionCoefficient + 1)) + 1;
        this.vel = this.vel.multiply(f);
    }
    applyGroundFriction(){

    }

    action_move(dir = 0){
        this.xMove += Math.sign(dir);
    }
    action_jump(){
        var jumpPower = 750;

        if(!this.onGround) return;

        this.vel.y -= jumpPower;
    }
    action_jumpSustain(){
        var jumpLinger = 40;

        if(this.vel.y < 0)
            this.vel.y -= jumpLinger;
    }

    handleMovement(){
        console.log(this.xMove);
        this.applyMovement(this.xMove);
        this.xMove = 0;
    }
    applyMovement(dir){
        dir = Math.sign(dir);
        var velDir = Math.sign(this.vel.x);
        var accel = this.acceleration * dt;
        accel *= dir;

        // calculate the final velocity if all the acceleration is applied
        var fvel = this.vel.x + accel;

        // if the players speed is below their max speed, only allow the player to accelerate to their max speed
        if(this.vel.x <= this.maxSpeed){
            if(Math.abs(fvel) <= this.maxSpeed)
                this.vel.x = fvel;
            else if(Math.abs(fvel) > this.maxSpeed)
                this.vel.x = this.maxSpeed * velDir;
            return;
        }
        // if the player's speed is above their max speed, apply friction to slow them down to their max speed
        else{
            this.applyGroundFriction();
            if(Math.abs(this.vel.x) < this.maxSpeed)
                this.vel.x = this.maxSpeed * velDir;
        }
    }

    handleCollisions(){
        var ground = 400;

        this.onGround = false;

        if(this.hitBox.colBox.bottom >= ground){
            this.pos.y -= this.hitBox.colBox.bottom - ground;
            this.onGround = true;
            this.vel.y = 0;
        }

        this.hitBox.centerAtPoint(this.pos);
    }

    update(){
        this.handleMovement();
        this.applyGravity();
        this.applyAirFriction();
        
        this.pos = this.pos.plus(this.vel.multiply(dt));
        this.hitBox.centerAtPoint(this.pos);
        
        this.handleCollisions();

    }
    draw(){
        this.hitBox.draw();
    }
}