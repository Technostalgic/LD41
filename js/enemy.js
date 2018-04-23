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
        this.fallThroughPlatforms = false;

        this.seekDir = new vec2(0, 0);
    }

    static randomEnemy(){
        var m = [
            enemy_zombie,
            enemy_eyeball
        ];

        return new m[Math.floor(m.length * Math.random())]();
    }

    findSpawnPos(){
        var terrainOverlap = false;
        do{
            terrainOverlap = false;
            this.pos = getRandomScreenPos();
            this.updateHitBox();

            for(let i = state.terrain.length - 1; i >= 0; i--){
                if(this.hitBox.getCollision(state.terrain[i].hitBox)){
                    terrainOverlap = true;
                    break;
                }
            }
        } while(terrainOverlap);
        return this.pos;
    }
    spawn(){
        this.pos = this.findSpawnPos();

        state.enemies.push(this);
        state.physObjects.push(this);
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
    remove(){
        var index = state.enemies.indexOf(this); 
        if(index >= 0)
            state.enemies.splice(index, 1);
        super.remove();
    }

    findPlayer(){
        if(this.canSeePlayer())
            this.seekDir = state.player.pos.minus(this.pos).normalized();
        else this.seekDir = vec2.fromAng(Math.random() * Math.PI * 2, 10);
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

    hitPlayer(plr, colbox){
        effect.fx_hit(colbox.center);
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
        if(this.isSpawning){
            this.drawSpawning();
            return false;
        }
        return true;
    }
    drawSpawning(){
        var box = this.hitBox.getBoundingBox();

        var fillColor = state.timeElapsed / 100 % 2 < 1 ? 
            color.fromHex("#F00", 1) : color.fromHex("#800", 1);
        box.pos.round();
        box.drawOutline(renderContext, color.Black().toRGBA(), 2);
        box.drawFill(renderContext, fillColor.toRGBA());
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
        this.playerSeekCountdown = 0;
    }

    applyGroundFriction(){
        if(this.xMove != 0) return;
        super.applyGroundFriction();
    }
    findPlayer(){
        if(this.canSeePlayer())
            this.seekDir.x = state.player.pos.x > this.pos.x ? 1 : -1;
        this.seekDir.x = Math.sign(Math.random() - 0.5);
    }
    seekPlayer(){
        this.playerSeekCountdown -= dt;
        if(this.playerSeekCountdown <= 0){
            this.findPlayer();
            this.playerSeekCountdown = Math.random() + 2;
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

    hitPlayer(plr, colbox){
        super.hitPlayer(plr, colbox);
        plr.damage(15);

        var force = Math.sign(plr.pos.x - this.pos.x) * 300;
        plr.vel.x = force;
        plr.vel.y = -150;

        this.vel.x = -force;
        this.vel.y = -150;

        this.findPlayer();
    }

    objectCollide(obj, colbox){
        if(obj instanceof player)
            this.hitPlayer(obj, colbox);
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
        if(this.isSpawning){
            this.drawSpawning();
            return false;
        }
        
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

class enemy_eyeball extends enemy{
    constructor(){
        super();
        this.hitBox = collisionModule.circleCollider(8);
        this.health = 20;
        this.points = 100;
        this.maxSpeed = 20 + Math.random() * 10;
        this.moveDir = new vec2();
        this.playerSeekCountdown = 0;
        this.fallThroughPlatforms = true;
    }

    findPlayer(){
        if(this.canSeePlayer())
            this.seekDir = state.player.pos;
        else this.seekDir = getRandomScreenPos();
    }
    seekPlayer(){
        this.playerSeekCountdown -= dt;
        if(this.playerSeekCountdown <= 0){
            this.findPlayer();
            this.playerSeekCountdown = Math.random() * 2 + 4;
        }
        var dif = this.seekDir.minus(this.pos);
        if(this.pos.distance(this.seekDir) <= 50){
            this.moveDir = dif.normalized();
            return;
        }
        if(this.pos.x > this.seekDir.x + 35 || this.pos.x < this.seekDir.x - 35){
            this.moveDir = new vec2(Math.sign(dif.x), (Math.random() - 0.5) * 0.5);
            return;
        }
        this.moveDir = new vec2((Math.random() - 0.5) * 0.25, Math.sign(dif.y));
    }
    applyMovement(){
        var jitter = 200;
        var acc = 50;
        var accel = this.moveDir.multiply(acc).plus(vec2.fromAng(Math.random() * Math.PI * 2, jitter));
        var fmov = this.vel.plus(accel.multiply(dt));

        var spd0 = this.vel.distance();
        var spd1 = fmov.distance();
        if(spd1 >= this.maxSpeed){
            if(spd0 > spd1) {
                this.vel = fmov;
                return;
            }
        }
        this.vel = fmov;
    }
    applyGravity(){ }

    objectCollide(obj, colbox){
        if(obj instanceof player)
            this.hitPlayer(obj, colbox);
    }
    hitPlayer(plr, colbox){
        super.hitPlayer(plr, colbox);
        var force = plr.pos.minus(this.pos).normalized(200);
        plr.vel = force;
        this.vel = force.multiply(-1);

        plr.damage(10);
    }

    kill(){
        this.spawnCorpse();
        super.kill();
    }
    spawnCorpse(){
        var c = new corpse();
        c.hitBox = collisionModule.boxCollider(new vec2(13, 8));
        c.pos = this.pos;
        c.updateHitBox();
        c.spritesheet = gfx.enemy2;
        c.risingSprite = new spriteBox(
            new vec2(0, 15),
            new vec2(18, 19)
        );
        c.fallingSprite = new spriteBox(
            new vec2(18, 15),
            new vec2(18, 19)
        );
        c.lyingSprite = new spriteBox(
            new vec2(36, 15),
            new vec2(18, 19)
        );
        c.vel = this.vel;
        c.isFlipped = this.vel.x < 0;

        state.physObjects.push(c);
    }

    update(){
        if(!super.update()) return false;

        this.seekPlayer();
        this.applyMovement();

        return true;
    }
    draw(){
        if(this.isSpawning){
            this.drawSpawning()
            return false;
        }
        
        var frame = Math.floor(state.timeElapsed / 100) % 4;
        var sprBox = new spriteBox(
            new vec2(22 * frame, 0),
            new vec2(22, 15)
        );
        var sprite = new spriteContainer(
            gfx.enemy2,
            sprBox
        );
        sprite.bounds.setCenter(this.pos);
        sprite.isFlippedX = this.vel.x < 0;

        sprite.draw();
    }
}