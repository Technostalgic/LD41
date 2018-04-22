///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class enemy extends physicsObject{
    constructor(){
        super();
        this.health = 10;
        this.points = 50;
        this.tilSpawn = 2.5;
        this.isSpawning = true;
        this.isFlipped = false;

        this.seekDir = new vec2(0, 0);
    }

    spawn(pos){
        this.pos = pos;
        this.tilSpawn = 2.5;
    }
    finishSpawn(){
        this.isSpawning = false;
    }

    damage(dmg){
        this.health -= dmg;
        if(this.health <= 0)
            this.kill();
    }
    kill(){
        this.remove();
    }

    findPlayer(){
        this.seekDir = state.player.pos.minus(this.pos).normalized();
    }
    seekPlayer(){
    }

    update(){
        if(this.isSpawning){
            this.tilSpawn -= dt;
            if(this.tilSpawn <= 0)
                this.finishSpawn();
            else return false;
        }
        super.update();
        return true;
    }
    draw(){
        if(this.isSpawning)
            return false;
        return true;
    }
}

class enemy_zombie extends enemy{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(12, 19));
        this.health = 10;
        this.maxSpeed = 100;
        this.acceleration = 250;

        this.xMove = 0;
    }

    applyGroundFriction(){
        if(this.xMove != 0) return;
        super.applyGroundFriction();
    }
    findPlayer(){
        this.seekDir.x = state.player.pos.x > this.pos.x ? 1 : -1;
    }
    seekPlayer(){
        this.findPlayer();
        this.xMove = Math.sign(this.seekDir.x);
        if(this.onGround)
            this.applyMovement(this.xMove);
    }
    
    applyMovement(dir){
        dir = Math.sign(dir);
        var velDir = Math.sign(this.vel.x);
        var accel = this.acceleration * dt;
        accel *= dir;

        // calculate the final velocity if all the acceleration is applied
        var fvel = this.vel.x + accel;

        // if the enemy speed is below their max speed, only allow it to accelerate to their max speed
        if(this.vel.x <= this.maxSpeed){
            if(Math.abs(fvel) <= this.maxSpeed)
                this.vel.x = fvel;
            else if(Math.abs(fvel) > this.maxSpeed)
                this.vel.x = this.maxSpeed * velDir;
            return;
        }
        // if the enemy's speed is above their max speed, apply friction to slow them down to their max speed
        else{
            if(this.onGround)
                this.applyGroundFriction();
            if(Math.abs(this.vel.x) < this.maxSpeed)
                this.vel.x = this.maxSpeed * velDir;
        }
    }

    update(){
        if(!super.update())
            return false;

        this.seekPlayer();
        
        return true;
    }
    draw(){
        if(this.isSpawning)
            return false;
        
        var frame = 0;
        var sprBox = new spriteBox();
        if(this.onGround)
            frame = Math.floor(state.timeElapsed / 100) % 3;
        else frame = 3;

        if(frame <= 3) 
            sprBox.size = new vec2(12, 19);
        else {
            frame -= 3;
            sprBox.size = new vec2(18, 11);
            sprBox.pos.y = 19;
        }
        sprBox.pos.x = frame * sprBox.size.x;

        var sprite = new spriteContainer(
            gfx.enemy1, 
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);
        sprite.isFlipped = this.xMove < 0;

        sprite.draw();
        return true;
    }
}