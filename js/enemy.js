///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

var slimeColor = color.fromHex("#0C0");
var goreColor = color.fromHex("#900");

class enemy extends lifeForm{
    constructor(){
        super();
        this.health = 10;
        this.points = 50;
        this.tilSpawn = 2.5;
        this.isSpawning = true;
        this.isFlipped = false;
        this.fallThroughPlatforms = false;
        
        this.isActivated = false;
        this.seekDir = new vec2(0, 0);
    }

    static randomEnemy(){
        //return new enemy_slime();
        var m = [
            enemy_slime,
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

		this.add();
    }
    finishSpawn(){
        this.isActivated = true;
        this.isSpawning = false;
    }

    damage(dmg, colbox){
        playSound(sfx.enemyHit);
		super.damage(dmg, colbox);
        this.findPlayer();
        if(colbox) {
			effect.fx_hit(colbox.center);
		}
    }
    destroy(){
        state.addScore(this.points);
        this.remove();
    }
    add(){
        state.enemies.push(this);
        state.physObjects.push(this);
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
			if(terrain instanceof terrain_platform) return;
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
		this.updateLVPos();
        if(this.isSpawning){
            this.drawSpawning();
            return false;
        }
        return true;
    }
    drawSpawning(){
        var box = this.hitBox.getBoundingBox();

        var lineColor = state.timeElapsed / 100 % 2 < 1 ? 
            color.fromHex("#F00", 1) : color.fromHex("#800", 1);
        box.pos.round();
		box.pos = box.pos.plus(new vec2(0.5));
        box.drawOutline(renderContext, lineColor.toRGBA(), 1);
		
		var frm = Math.floor((state.timeElapsed / 100) % 2);
		
		var sprt = new spriteContainer(
			gfx.spawnWarning,
			new spriteBox(
				new vec2(frm * 16, 0),
				new vec2(16)
			)
		);
		sprt.bounds.setCenter(this.pos);
		sprt.draw();
    }
}

class enemy_zombie extends enemy{
    constructor(size = null){
        super();
		this.size = size;
		if(!this.size)
			this.size = Math.floor(Math.random() * 2) + 1;
        this.hitBox = collisionModule.boxCollider(new vec2(12, 19).multiply(this.size));
		
        this.health = 10 + ((this.size - 1) * 25);
        this.maxSpeed = (45 + Math.random() * 25) / (this.size / 2 + 0.5);
        this.acceleration = 250;

        this.points = 50 * ((this.size - 1) * 150);
		
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
    
	damage(dmg, colbox){
		super.damage(dmg, colbox);
		if(this.health <= 0)
			drawBloodSplotch(colbox.center, Math.random() * 2 + 2);
	}
    destroy(){
        this.spawnCorpse();
        super.destroy();
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
		c.inflate(this.size);

        state.physObjects.push(c);
    }

    hitPlayer(plr, colbox){
        super.hitPlayer(plr, colbox);
        plr.damage(15 + (this.size - 1) * 10);

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
		this.updateLVPos();
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
		sprite.bounds.size = sprite.bounds.size.multiply(this.size);
        sprite.bounds.setCenter(this.pos);
        sprite.isFlippedX = this.xMove < 0;

        sprite.draw();
        return true;
    }
}

class enemy_eyeball extends enemy{
    constructor(size = null){
        super();
		this.size = size;
		if(!this.size)
			this.size = Math.floor(Math.random() * 2) + 1;
        this.hitBox = collisionModule.circleCollider(8 * this.size);
        this.health = 20 * this.size;
        this.points = 100;
        this.maxSpeed = 20 + Math.random() * 10;
        this.moveDir = new vec2();
        this.playerSeekCountdown = 0;
        this.fallThroughPlatforms = true;

        this.bulletCooldown = 0;
    }

	fireBullet(){
        if(this.bulletCooldown > 0) return;
        playSound(sfx.enemyShoot);
        this.bulletCooldown = 0.5;
		if(this.size > 1){
			var count = 8;
			var anginc = Math.PI * 2 / count;
			for(let i = count; i > 0; i--){
				let ang = i * anginc;
				projectile.fire(proj_enemyBullet, this.pos.clone(), 100, ang, [enemy]);
			}
			return;
		}
		var dir = this.seekDir.minus(this.pos).direction();
		dir += (Math.random() - 0.5) * 0.35;
		projectile.fire(proj_enemyBullet, this.pos.clone(), 100, dir, [enemy]);
	}
	
    findPlayer(){
        if(this.canSeePlayer())
            this.seekDir = state.player.pos;
        else this.seekDir = getRandomScreenPos();
        if(this.health > 0)
		    this.fireBullet();
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
	
	damage(dmg, colbox){
		super.damage(dmg, colbox);
		if(this.health <= 0)
			drawBloodSplotch(colbox.center, Math.random() * 3 + 2);
	}
    destroy(){
        this.spawnCorpse();
		if(this.size > 1){
			var bb = new enemy_eyeball(this.size - 1);
			bb.pos = this.pos.clone();
			bb.updateHitBox();
			bb.vel = this.vel.multiply(0.5);
			bb.tilSpawn = -1;
			bb.isSpawning = false;
			bb.isActivated = true;
			bb.add();
		}
        super.destroy();
    }
    spawnCorpse(){
		if(this.size > 1){
			giblet.spawnGibs(giblet_gore, this.pos, 10, this.vel, 200);
			return;
		}
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
        c.vel = this.vel.clone();
        c.isFlipped = this.vel.x < 0;

        state.physObjects.push(c);
    }

    update(){
        if(!super.update()) return false;

        this.bulletCooldown -= dt;
        this.seekPlayer();
        this.applyMovement();

        return true;
    }
    draw(){
		this.updateLVPos();
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
		sprite.bounds.size = sprite.bounds.size.multiply(this.size);
        sprite.bounds.setCenter(this.pos);
        sprite.isFlippedX = this.vel.x < 0;

        sprite.draw();
    }
}

class enemy_slime extends enemy{
    constructor(size){
        super();
		var sz = size;
		if(!size)
			sz = Math.max(1, Math.floor(Math.random() * 2 - 0.5) + 1);
        this.size = sz;
        this.hitBox = collisionModule.boxCollider(new vec2(16, 10).multiply(this.size));
        this.health = 5 + (this.size - 1) * 10;
		
        this.points = 100 * (this.size - 1) + 50;

        this.xMove = 0;
        this.playerSeekCountdown = 0.5;
    }
    
    findPlayer(){
        if(!this.canSeePlayer()){
            this.xMove = 2 * Math.floor(Math.random() * 2) - 1;
            return;
        }
        if(state.player.hitBox.getBoundingBox().bottom > this.hitBox.getBoundingBox().bottom)
            this.fallThroughPlatforms = true;
        else this.fallThroughPlatforms = false;
        if(this.pos.x < state.player.pos.x)
            this.xMove = 1;
        else 
            this.xMove = -1;
    }
    seekPlayer(){
        if(!this.onGround) return;
		
        this.playerSeekCountdown -= dt;
        if(this.playerSeekCountdown > 0)
            return;
        
        this.findPlayer();
        this.hop();
    }
    hop(){
        var pow = 150 + Math.random() * 100;
        if(Math.random() > 0.85)
            pow *= 2;
        
        this.vel = new vec2(this.xMove * 225, -pow);

        this.playerSeekCountdown = (pow * 2 * this.size) / 1000;
    }

    objectCollide(obj, colbox){
        if(obj instanceof player)
            this.hitPlayer(obj, colbox);
    }
    hitPlayer(plr, colbox){
        super.hitPlayer(plr, colbox);
        plr.damage(7);

        var force = Math.sign(plr.pos.x - this.pos.x) * 300;
        plr.vel.x = force;
        plr.vel.y = -150;

        this.vel.x = -force;
        this.vel.y = -150;

        this.findPlayer();
    }

	destroy(){
        playSound(sfx.corpseBurst);
		super.destroy();
		if(this.size > 1){
			this.spawnBabies();
			var advel = this.vel.clone();
			if(this.onGround)
				advel.y -= 100
			giblet.spawnGibs(giblet_slime, this.pos, 10, advel, 200);
			return;
		}
        var advel = this.vel.clone();
        if(this.onGround)
            advel.y -= 100
		giblet.spawnGibs(giblet_slime, this.pos, 25, advel, 350);
		this.remove();
	}
	spawnBabies(){
		var bbsize = this.size - 1;
		for(let i = 2; i > 0; i--){
			var bbang = i * (Math.PI * 2 / this.size);
			var bbpos = this.pos.plus(vec2.fromAng(bbang, this.hitBox.getBoundingBox().height / 2));
			var bbvel = this.vel.plus(vec2.fromAng(bbang, 250));
			bbvel.y -= 200;
			var bb = new enemy_slime(bbsize);
			bb.vel = bbvel;
			bb.pos = bbpos;
			bb.updateHitBox();
			bb.tilSpawn = -1;
			bb.isSpawning = false;
			bb.isActivated = true;
			bb.add();
		}
	}
	spawnCorpse(){
        var c = new corpse_slime();
        c.pos = this.pos;
        c.updateHitBox();
        c.vel = this.vel.clone().plus(new vec2(0, -100));
        c.isFlipped = this.isFlipped;

        state.physObjects.push(c);
	}
	
    update(){
        if(!super.update()) return false;
        this.seekPlayer();
		//if(!this.onGround)
		//	this.vel.x = this.xMove * 225;
        return true;
    }
    draw(){
		this.updateLVPos();
        if(this.isSpawning){
            this.drawSpawning()
            return false;
        }
        var frame = 4;
        var frameSize = new vec2(20);
        if(this.onGround){
            frameSize = new vec2(20, 14);
            frame = Math.floor(state.timeElapsed / 125) % 5;
            frame = Math.max(frame - 1, 0);
            if(frame > 2) frame = 1;
        }

        var sprBox = new spriteBox(
            new vec2(20 * frame, 0),
            frameSize
        );
        if(frame == 4)
            sprBox = new spriteBox(
                new vec2(0, 14),
                frameSize
            );

        var sprite = new spriteContainer(
            gfx.enemy3,
            sprBox
        );

        sprite.bounds.size = sprite.bounds.size.multiply(this.size);
        sprite.bounds.setCenter(this.pos.plus(new vec2(0, -2)));
        sprite.isFlippedX = this.xMove < 0;

        sprite.draw();
    }
}