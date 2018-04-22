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
        this.findPlayer();
    }
    kill(){
        state.addScore(this.points);
        this.remove();
    }

    findPlayer(){
        this.seekDir = state.player.pos.minus(this.pos).normalized();
    }
    seekPlayer(){
    }
    canSeePlayer(){
        var rayTest = ray.fromPoints(this.pos, state.player.pos);
        var raycols = [];
        state.terrain.forEach(function(terrain){
            let col = rayTest.getBoxCollision(terrain.hitBox.getBoundingBox());
            if(col)
                raycols.push(col);
        });
        return raycols.length <= 0;
    }

    handleObjectCollisions(physObjs){
        if(this.isSpawning)
            return false;

        super.handleObjectCollisions(physObjs);

        return true;
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
        this.maxSpeed = 45 + Math.random() * 25;
        this.acceleration = 250;

        this.xMove = 0;
        this.playerSeekCountdown = 1;
    }

    applyGroundFriction(){
        if(this.xMove != 0) return;
        super.applyGroundFriction();
    }
    findPlayer(){
        if(this.canSeePlayer)
            this.seekDir.x = state.player.pos.x > this.pos.x ? 1 : -1;
        this.seekDir.x = Math.sign(Math.random() - 0.5);
    }
    seekPlayer(){
        this.playerSeekCountdown -= dt;
        if(this.playerSeekCountdown <= 0){
            this.findPlayer();
            this.playerSeekCountdown = Math.random() + 2.5;
        }
        if(this.onGround)
            this.xMove = Math.sign(this.seekDir.x);
        this.applyMovement(this.xMove);
    }
    jump(){
        if(!this.onGround) return;
        var jumpPow = 375;
        this.vel.y = -jumpPow;
    }
    
    kill(){
        this.spawnCorpse();
        super.kill();
    }
    spawnCorpse(){
        var c = new corpse();
        c.pos = this.pos;
        c.updateHitBox();
        c.spritesheet = gfx.enemy1;
        c.risingSprite = new spriteBox(
            new vec2(0, 19),
            new vec2(18, 11)
        );
        c.fallingSprite = new spriteBox(
            new vec2(18, 19),
            new vec2(18, 11)
        );
        c.lyingSprite = new spriteBox(
            new vec2(36, 19),
            new vec2(18, 11)
        );
        c.vel = this.vel;
        c.isFlipped = this.xMove > 0;

        state.physObjects.push(c);
    }

    hitPlayer(plr){
        plr.damage(15);

        var force = Math.sign(plr.pos.x - this.pos.x) * 300;
        plr.vel.x = force;
        plr.vel.y = -150;

        this.vel.x = -force;
        this.vel.y = -150;

        this.findPlayer();
    }

    objectCollide(obj){
        if(obj instanceof player)
            this.hitPlayer(obj);
    }
    terrainCollide(terrain){
        var col = this.hitBox.getCollision(terrain.hitBox);
        if(!col) return;
        if(col.height > col.width)
            this.jump();
    }

    applyMovement(dir){
        dir = Math.sign(dir);
        var velDir = Math.sign(this.vel.x);
        var accel = this.acceleration * dt;
        accel *= dir;

        // calculate the final velocity if all the acceleration is applied
        var fvel = this.vel.x + accel;

        // if the enemy speed is below their max speed, only allow it to accelerate to their max speed
        if(Math.abs(this.vel.x) <= this.maxSpeed){
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
        sprite.isFlippedX = this.xMove < 0;

        sprite.draw();
        return true;
    }
}