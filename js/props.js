///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class prop extends physicsObject{
    constructor(){
        super();
    }
}

class dynamicPlatform extends prop{
    constructor(){
        super();
        this.ignoresTypes = [blood, giblet];
    }
    objectCollide(obj, colbox){
        terrainObject.handlePlatformCollision(this.hitBox, obj, colbox);
    }
}
class anvil extends dynamicPlatform{
    constructor(){
        super();
        this.fallThroughPlatforms = false;
        this.hitBox = collisionModule.boxCollider(new vec2(14, 9));
        this.ignoreTypes.push(projectile);
        this.health = 30;
    }

    damage(dmg, colbox){
        this.health -= dmg;
        if(this.health <= 0)
            this.remove();
    }
    objectCollide(obj, colbox){
        if(this.ignoresType(obj)) return;
        if(this.onGround){
            super.objectCollide(obj, colbox);
            return;
        }
        if(this.vel.y <= 100)
            return;
        if(obj.vel.y >= this.vel.y)
            return;
        if(obj instanceof player)
            return;
        
        if(obj instanceof dynamicPlatform)
            return;

        playSound(sfx.objectHit);
        obj.vel.y = this.vel.y;

        if(obj.damage)
            obj.damage(20, colbox);

        this.vel.y = 0;
    }

    draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(new vec2(60,6), new vec2(20, 9));
        var sprite = new spriteContainer(
            gfx.cardGraphics,
            sprBox
        );
        sprite.bounds.setCenter(this.pos)

        sprite.draw();
    }
}
class crate extends dynamicPlatform{
    constructor(){
        super();
        this.fallThroughPlatforms = false;
        this.hitBox = collisionModule.boxCollider(new vec2(20));
        this.ignoreTypes.push(projectile);
        this.health = 10;
    }

    objectCollide(obj, colbox){
        if(this.onGround){
            super.objectCollide(obj, colbox);
            return;
        }
    }

    damage(dmg, colbox){
        this.health -= dmg;
        if(this.health <= 0)
            this.destroy();
    }
    destroy(){
        var crd = new cardCollectable();
        crd.pos = this.pos;
        crd.updateHitBox();
        crd.add();

        var advel = this.vel.clone();
        if(this.onGround)
            advel.y -= 100
        giblet.spawnGibs(giblet_wood, this.pos, 6, advel);

        this.remove();
    }

    draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(new vec2(), new vec2(20));
        var sprite = new spriteContainer(
            gfx.prop,
            sprBox
        );
        sprite.bounds.setCenter(this.pos)

        sprite.draw();
    }
}

class dynamicSolid extends prop{
    constructor(){super();}
    objectCollide(obj, colbox){
        terrainObject.handleSolidCollision(this.hitBox, obj, colbox);
    }
}
class metalBox extends dynamicSolid{
    constructor(){
		super();
		this.fallThroughPlatforms = false;
        this.hitBox = collisionModule.boxCollider(new vec2(25));
        this.health = 45;
	}
	
	objectCollide(obj, colbox){
		if(obj instanceof projectile) {
			super.objectCollide(obj, colbox);
			return;
		}
		if(obj.onGround){
			if(this.onGround){
				if(Math.abs(obj.vel.x) >= 100)
					this.vel.x = Math.sign(obj.vel.x) * 100;
                terrainObject.handleSolidCollision(this.hitBox, obj, colbox);
			}
			else{
				terrainObject.handleSolidCollision(obj.hitBox, this, colbox);
				this.onGround = false;
			}
		}
		else super.objectCollide(obj, colbox);
	}
	draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(new vec2(20, 0), new vec2(25));
        var sprite = new spriteContainer(
            gfx.prop,
            sprBox
        );
        sprite.bounds.setCenter(this.pos)

        sprite.draw();
    }
}

class corpse extends prop{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(10, 4));
        this.spritesheet = null;
        this.fallingSprite = null;
        this.risingSprite = null;
        this.lyingSprite = new spriteBox();
        this.isFlipped = false;
		this.size = 1;
        this.health = 15;
		
		this.isBleeding = true;
    }

	terrainCollide(terrain, colbox){
		this.isBleeding = false;
		super.terrainCollide(terrain, colbox);
		if(this.vel.distance >= 200){
			drawBloodSplotch(colbox.center, (this.vel.distance - 200) / 50 + 5);
			for(var i = (this.vel.distance - 200) / 25 + 3; i > 0; i--){
				var bd = new blood();
				if(Math.random() >= 0.75)
					bd = new blood_drip;
				
				bd.pos = this.pos.plus(new vec2(this.hitBox.getBoundingBox().width / 2 * Math.random(), this.hitBox.getBoundingBox().height / 2 * Math.random()));
				bd.vel = vec2.fromAng(Math.PI * 2 * Math.random()), (Math.random() + 0.5) * this.vel.distance();
				bd.add();
			}
		}
	}
    handleObjectCollisions(){}

	inflate(factor){
		this.size *= factor;
		this.hitBox.expand(factor);
        this.health *= factor;
	}
	
    damage(dmg){
        this.health -= dmg;
        if(this.health <= 0)
            this.burst();
    }
    burst(){
        var advel = this.vel.clone();
        if(this.onGround)
            advel.y = -200;
        giblet.spawnGibs(giblet_gore, this.pos, 6 + ((this.size - 1) * 10), advel, 250 + ((this.size - 1) * 125));
		drawBloodSplotch(this.pos, Math.random() * 5 + 6);
        this.remove();
    }

    getSpriteBox(){
        if(this.onGround) return this.lyingSprite;
        if(this.vel.y < 0) return this.risingSprite;
        return this.fallingSprite;
    }

	update(){
		super.update();
		if(!this.onGround){
			if(this.isBleeding){
				if(this.vel.distance() / 100 * dt > Math.random()){
					var bd = new blood();
					if(Math.random() >= 0.75)
						bd = new blood_drip;
					
					bd.pos = this.pos.plus(new vec2(this.hitBox.getBoundingBox().width / 2 * Math.random(), this.hitBox.getBoundingBox().height / 2 * Math.random()));
					bd.vel = this.vel.plus(vec2.fromAng(Math.PI * 2 * Math.random()), Math.random() * 150);
					bd.add();
				}
			}
		}
	}
    draw(){
		this.updateLVPos();
        var sprite = new spriteContainer(this.spritesheet, this.getSpriteBox());
		sprite.bounds.size = sprite.bounds.size.multiply(this.size);
        sprite.bounds.setCenter(this.pos);
        sprite.bounds.pos.round();
        
        sprite.isFlippedX = this.isFlipped;
        sprite.draw();
    }
}
class corpse_slime extends corpse{
	constructor(){
		super();
		this.spritesheet = gfx.enemy3;
	}
	
	terrainCollide(terrain, colbox){
		this.burst();
	}
	
	getSpriteBox(){
		return new spriteBox(
			new vec2(20, 14),
			new vec2(20, 20)
		);
	}
	
	burst(){
        var advel = this.vel.clone();
        if(this.onGround)
            advel.y -= 100
		giblet.spawnGibs(giblet_slime, this.pos, 16, advel, 200);
		this.remove();
	}

    draw(){
		this.updateLVPos();
        
		if(this.vel.x != 0)
			this.isFlipped = this.vel.x < 0;
        
		var sprite = new spriteContainer(this.spritesheet, this.getSpriteBox());
        sprite.bounds.setCenter(this.pos);
        sprite.bounds.pos.round();
        
        sprite.isFlippedX = this.isFlipped;
		sprite.isFlippedY = this.vel.y > 0;
		
        sprite.draw();
    }
}

class giblet extends prop{
    constructor(){
        super();
        this.hitBox = collisionModule.circleCollider(1);
        this.gravity = 900;
        this.airFriction = 0.925;
        this.rotation = Math.PI / 2 * (Math.floor(Math.random() * 4) - 2);
        this.isFlipped = Math.random() >= 0.5;
        this.spriteNum = Math.floor(Math.random() * 4);
        this.life = Math.random() * 2 + 2;
    }

    static spawnGibs(gibletType, pos, count, vel = new vec2(), pow = 150){
        var count = count;
        var angInc = 1 / count * Math.PI * 2;
        var addVel = vel;
        
        for(let i = count; i >= 0; i--){
            let ang = angInc * i + Math.random() * angInc;
            let fvel = vec2.fromAng(ang, 50 + Math.random() * pow);
            let gib = new gibletType();
            gib.pos = pos.clone();
            gib.updateHitBox();
            gib.vel = addVel.plus(fvel);
            gib.add();
        }
    }
	
    terrainCollide(terrain, colbox){
        if(terrain instanceof terrain_platform) return;
        this.life -= dt;
        if(this.life <= 0)
            this.destroy();
    }
    handleObjectCollisions(){}
	
	destroy(){
		this.remove();
	}
	
    update(){
        super.update();
    }
    draw(ctx = renderContext){
		this.updateLVPos();
        
		var sprBox = new spriteBox(
            new vec2(8 * this.spriteNum, 0),
            new vec2(8)
        );
        var sprite = new spriteContainer(
            gfx.giblets,
            sprBox
        );
        sprite.bounds.setCenter(this.pos);
        sprite.rotation = this.rotation;
        sprite.isFlippedX = this.isFlippedX;

        sprite.draw(ctx);
    }
}
class giblet_gore extends giblet{
	constructor(){
		super();
		this.isFrozen = false;
		this.bloodTrail = Math.random() * 1.25 + 1.25;
		this.btDeteriorate = 10 - (Math.random() * Math.random() * 8);
	}
	
	terrainCollide(terrain, colbox){
		if(terrain instanceof terrain_platform) return;
		drawBloodSplotch(this.pos, Math.min(this.vel.distance() / 75, 5) + Math.random());
		if(!this.onGround){
			this.isFrozen = true;
			if(Math.random() >= 0.5){
				var drp = new blood_drip();
				drp.pos = colbox.center;
				drp.vel = vec2.fromAng(Math.random() * Math.PI * 2, Math.random() * 150);
				drp.add();
			}
		}
		super.terrainCollide(terrain);
	}
	handleTerrainCollisions(terrains){
		if(this.isFrozen) return;
		super.handleTerrainCollisions(terrains);
	}
	
	destroy(){
		if(this.onGround || Math.random() > 0.5){
			this.draw(goreContext);
			this.remove();
			return;
		}
		this.vel = new vec2();
		this.isFrozen = false;
		this.life += Math.random() + 1;
	}
	
	update(){
		if(this.bloodTrail > 0) this.bloodTrail -= dt * this.btDeteriorate;
		if(this.bloodTrail < 0) this.bloodTrail = 0;
		if(this.isFrozen){
			this.life -= dt;
			if(this.life <= 0)
				this.destroy();
			return;
		}
		super.update();
	}
	draw(ctx = renderContext){
		var lpos = this.getLastPos();
		if(this.bloodTrail > 0)
			drawBloodTrail(lpos, this.pos, this.bloodTrail);
		super.draw(ctx);
	}
}
class giblet_wood extends giblet{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(10, 7));
        this.gravity = 900;
        this.airFriction = 0.925;
        this.rotVel = 0;
        this.rotation = Math.PI / 2 * (Math.floor(Math.random() * 4) - 2);
        this.isFlipped = Math.random() >= 0.5;
        this.spriteNum = Math.floor(Math.random() * 3);
        this.life = Math.random() * 2 + 2;
    }
    draw(){
        var frm = new spriteBox(
            new vec2(0, 9),
            new vec2(12, 7)
        ); ;

        switch(this.spriteNum){
            case 0: frm = new spriteBox(
                new vec2(0, 9),
                new vec2(12, 7)
            ); break;
            case 1: frm = new spriteBox(
                new vec2(13, 9),
                new vec2(12, 7)
            ); break;
            case 2: frm = new spriteBox(
                new vec2(26, 9),
                new vec2(5, 7)
            ); break;
        }

        var sprite = new spriteContainer(
            gfx.giblets,
            frm
        );
        sprite.bounds.setCenter(this.pos);
        sprite.rotation = this.rotation;
        sprite.isFlippedX = this.isFlippedX;

        sprite.draw();
    }
}
class giblet_slime extends giblet{
	constructor(){
		super();
        this.gravity = 900;
        this.airFriction = 0.925;
        this.spriteNum = Math.floor(Math.random() * 4);
        this.life = Math.random();
		this.bloodTrail = Math.random() * 2 + 0.5;
		this.btDeteriorate = 25 - (Math.random() * Math.random() * 15);
		this.isFrozen = false;
	}
	
	terrainCollide(terrain){
        if(terrain instanceof terrain_platform) return;
		this.isFrozen = true;
    }
	objectCollide(obj, colbox){
		if(obj instanceof destructableObject)
			obj.damage(3, colbox);
		
		var force = vec2.fromAng(this.vel.direction(), 100);
		obj.vel = obj.vel.plus(force);
		
		this.remove();
	}
	handleObjectCollisions(phyObjs){
		if(this.isFrozen) return;
        var ths = this;
        phyObjs.forEach(function(obj){
			if(!obj.isActivated) return;
            ths.checkObjectCollision(obj);
        });
        this.updateHitBox();
    }
	handleTerrainCollisions(terrains){
		if(this.isFrozen) return;
		super.handleTerrainCollisions(terrains);
	}
		
	destroy(){
		this.draw(goreContext);
		this.remove();
	}
	
	update(){
		if(this.bloodTrail > 0) this.bloodTrail -= dt * this.btDeteriorate;
		if(this.bloodTrail < 0) this.bloodTrail = 0;
		if(this.isFrozen){
			this.life -= dt;
			if(this.life <= 0)
				this.destroy();
			return;
		}
		super.update();
	}    
	draw(ctx = renderContext){
		if(this.bloodTrail > 0)
			drawBloodTrail(this.getLastPos(), this.pos, this.bloodTrail, slimeColor);
		this.updateLVPos();
        var sprBox = new spriteBox(
            new vec2(8 * this.spriteNum, 16),
            new vec2(8)
        );
        var sprite = new spriteContainer(
            gfx.giblets,
            sprBox
        );
        sprite.bounds.setCenter(this.pos);
        sprite.rotation = this.rotation;
        sprite.isFlippedX = this.isFlippedX;

        sprite.draw(ctx);
    }
}

class blood extends giblet{
	constructor(){
		super();
		this.bloodTrail = Math.random() * 0.5 + 0.5;
		this.btDeteriorate = 15 - (Math.random() * Math.random() * 10);
		this.airFriction = 0.8;
		this.gravity = 1250;
		this.col = goreColor;
	}
	
	handleTerrainCollisions(){}
	handleObjectCollisions(){}
	
	update(){
		this.bloodTrail -= dt * this.btDeteriorate;
		super.update();
	}
	
	draw(){
		var lpos = this.getLastPos();
		if(this.bloodTrail > 0)
			drawBloodTrail(lpos, this.pos, this.bloodTrail, this.col);
		else this.destroy();
		this.updateLVPos();
	}
}
class blood_drip extends blood{
	constructor(){
		super();
		this.bloodTrail = Math.random() * 2 + 0.5;
		this.btDeteriorate = Math.random() + 1;
		this.airFriction = Math.random() * 0.2 + 0.4;
		this.gravity = 600 + Math.random() * 700;
	}
	
	draw(){
		var lpos = this.getLastPos();
		if(this.bloodTrail > 0)
			drawBloodTrail(lpos, this.pos, 0.95);
		else this.destroy();
		this.updateLVPos();
	}
}