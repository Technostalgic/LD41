///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class player{
    constructor(){
        this.hitBox = collisionModule.boxCollider(new vec2(8, 12));
        this.pos = new vec2();
        this.vel = new vec2();
        this.maxSpeed = 150;
        this.acceleration = 1500;
        
        this.xMove = 0;
        this.isFlipped = false;

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

    preInput(){
        this.xMove = 0;
    }

    action_move(dir = 0){
        this.xMove += Math.sign(dir);
    }
    action_jump(){
        var jumpPower = 250;

        if(!this.onGround) return;

        this.vel.y -= jumpPower;
    }
    action_jumpSustain(){
        var jumpLinger = 15;

        if(this.vel.y < 0)
            this.vel.y -= jumpLinger;
    }

    handleMovement(){
        this.applyMovement(this.xMove);

        if(this.xMove != 0)
            this.isFlipped = this.xMove < 0;
        else if(this.onGround)
            this.applyGroundFriction();
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
            if(this.onGround)
                this.applyGroundFriction();
            if(Math.abs(this.vel.x) < this.maxSpeed)
                this.vel.x = this.maxSpeed * velDir;
        }
    }

    handleCollisions(){
        this.onGround = false;
        var ths = this;
        currentTerrain.forEach(function(terrain){
            terrain.checkCollision(ths);
        });

        this.updateHitBox();
    }
    updateHitBox(){
        this.hitBox.centerAtPoint(this.pos);
    }

    getSprite(){
        var xframe = 0;
        var yframe = this.isFlipped ? 1 : 0;
        var spriteSize = new vec2(15, 20);

        if(this.onGround){
            if(this.xMove != 0){
                xframe = Math.floor(state.timeElapsed / 33) % 5;
            }
        }
        else{
            if(this.vel.y < 0)
                xframe = 5;
            else xframe = 6;
        }
        
        var sprBox = new spriteBox(
            new vec2(xframe * spriteSize.x, yframe * spriteSize.y), 
            spriteSize);

        var sprite = new spriteContainer(
            gfx.player, 
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone()) );
            
        sprite.bounds.setCenter(this.pos.plus(new vec2(0, -3)));
        return sprite;
    }

    update(){
        this.handleMovement();
        this.applyGravity();
        this.applyAirFriction();
        
        this.pos = this.pos.plus(this.vel.multiply(dt));
        this.updateHitBox();
        
        this.handleCollisions();

    }
    draw(){
        this.getSprite().draw();
        //this.hitBox.draw();
    }
}