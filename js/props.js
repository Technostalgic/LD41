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
    constructor(){super();}
    objectCollide(obj, colbox){
        terrainObject.handlePlatformCollision(this.hitBox, obj, colbox);
    }
}
class anvil extends dynamicPlatform{
    constructor(){
        super();
        this.fallThroughPlatforms = false;
        this.hitBox = collisionModule.boxCollider(new vec2(14, 9));
        this.ignoreTypes = [projectile];
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
        this.ignoreTypes = [projectile];
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
        this.health = 15;
    }

    handleObjectCollisions(){}

    damage(dmg){
        this.health -= dmg;
        if(this.health <= 0)
            this.burst();
    }
    burst(){
        var advel = this.vel.clone();
        if(this.onGround)
            advel.y -= 100
        giblet.spawnGibs(this.pos, 6, advel);
        this.remove();
    }

    getSpriteBox(){
        if(this.onGround) return this.lyingSprite;
        if(this.vel.y < 0) return this.risingSprite;
        return this.fallingSprite;
    }

    draw(){
		this.updateLVPos();
        var sprite = new spriteContainer(this.spritesheet, this.getSpriteBox());
        sprite.bounds.setCenter(this.pos);
        sprite.bounds.pos.round();
        
        sprite.isFlippedX = this.isFlipped;
        sprite.draw();
    }
}
class giblet extends prop{
    constructor(){
        super();
        this.hitBox = collisionModule.circleCollider(1);
        this.gravity = 900;
        this.airFriction = 0.925;
        this.rotVel = (Math.random() - 0.5) * 10;
        this.rotation = Math.PI / 2 * (Math.floor(Math.random() * 4) - 2);
        this.isFlipped = Math.random() >= 0.5;
        this.spriteNum = Math.floor(Math.random() * 4);
        this.life = Math.random();
    }

    static spawnGibs(pos, count, vel = new vec2(), pow = 150){
        var count = count;
        var angInc = 1 / count * Math.PI * 2;
        var addVel = vel;
        
        for(let i = count; i >= 0; i--){
            let ang = angInc * i + Math.random() * angInc;
            let fvel = vec2.fromAng(ang, 50 + Math.random() * pow);
            let gib = new giblet();
            gib.pos = pos.clone();
            gib.updateHitBox();
            gib.vel = addVel.plus(fvel);
            gib.add();
        }
    }

    terrainCollide(terrain){
        if(terrain instanceof terrain_platform) return;
        this.rotVel = 0;
        this.life -= dt;
        if(this.life <= 0)
            this.remove();
    }
    handleObjectCollisions(){ }

    update(){
        super.update();
        this.rotation += this.rotVel * dt;
    }
    draw(){
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

        sprite.draw();
    }
}