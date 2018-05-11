///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class projectile extends physicsObject{
    constructor(){
        super();
        this.hitBox = collisionModule.circleCollider(2);
		this.airFriction = 1;
		this.gravity = 0;
        this.dmg = 5;
        this.knockback = 100;
        this.lifetime = 5;
        this.ignoreTypes = [dynamicPlatform];
    }

    static fire(projType, pos, speed, angle, ignoreTypes = []){
        var proj = new projType();
        proj._lastVPos = pos.clone();
        proj.pos = pos.clone();
        proj.updateHitBox();
        proj.vel = vec2.fromAng(angle, speed);
        proj.ignoreTypes = proj.ignoreTypes.concat(ignoreTypes); 

        state.physObjects.push(proj)
        return proj;
    }

    damage(){}

    checkObjectCollision(obj){
        for(let type of this.ignoreTypes)
            if(obj instanceof type) return;
        if((obj instanceof cardCollectable) || (obj instanceof projectile)) return;
        super.checkObjectCollision(obj);
    }
    objectCollide(obj, colbox){
        var force = this.vel.normalized(this.knockback);
        obj.vel = obj.vel.plus(force);

        if(obj.damage){
            obj.damage(this.dmg, colbox);
			if(obj instanceof enemy_zombie || obj instanceof enemy_eyeball || obj instanceof player || obj instanceof corpse){
				drawBloodSplotch(colbox.center, Math.random() * 2 + 1);
				for(let i = this.dmg / 3 + 2; i > 0; i--){
					let bld = new blood();
					bld.pos = colbox.center;
					bld.vel = this.vel.plus(vec2.fromAng(Math.random() * Math.PI * 2, Math.random() * 150 * (this.dmg / 2)));
					bld.add();
				}
				
				if(Math.random() * Math.random() * this.dmg > 4){
					let drp = new blood_drip();
					drp.pos = colbox.center;
					drp.vel = this.vel.multiply(0.45).plus(vec2.fromAng(Math.random() * Math.PI * 2, Math.random() * 350));
					drp.add();
				}
			}
			else if(obj instanceof enemy_slime){
				drawBloodSplotch(colbox.center, Math.random() * 2 + 1, slimeColor);
				for(let i = 3; i > 0; i--){
					let bld = new blood();
					bld.col = slimeColor;
					bld.pos = colbox.center;
					bld.vel = this.vel.plus(vec2.fromAng(obj.pos.minus(this.pos).direction() + (Math.random() - 0.5) * Math.PI, Math.random() * 200));
					bld.add();
				}
			}
		}

        this.burst(colbox);
    }
    terrainCollide(terrain, colbox){
        if(terrain instanceof terrain_platform) return;
        this.burst(colbox);
    }
    burst(collision){
        this.remove();
    }

    update(){
        super.update();
        this.lifetime -= dt;
        if(this.lifetime <= 0)
            this.remove();
    }
    draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(
            new vec2(),
            new vec2(4, 4)
        );
        var sprite = new spriteContainer(
            gfx.projectile,
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);

        sprite.draw();
    }
}
class proj_enemyBullet extends projectile{
	constructor(){
		super();
		this.ignoreTypes.push(enemy);
		this.dmg = 8;
		this.knockback = 200;
	}
	
	draw(){
		var frame = Math.floor(state.timeElapsed / 100) % 2;
		
        var sprBox = new spriteBox(
            new vec2(frame * 4, 0),
            new vec2(4, 4)
        );
        var sprite = new spriteContainer(
            gfx.projectile,
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);

        sprite.draw();
    }
}

class proj_arrow extends projectile{
    constructor(){
        super();
        this.dmg = 15;
        this.knockback = 250;
        this.ang = 0;
        this.isFlipped = false;
        this.gravity = 300;
    }
    draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(
            new vec2(0, 4),
            new vec2(8, 4)
        );
        var sprite = new spriteContainer(
            gfx.projectile,
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);
        sprite.rotation = this.ang;
        sprite.isFlippedY = this.isFlipped;

        sprite.draw();
    }
}
class proj_shotgun extends projectile{
    constructor(){
        super();
        this.dmg = 5;
        this.knockback = 225;
    }
}
class proj_sniper extends projectile{
    constructor(){
        super();
        this.dmg = 10;
        this.knockback = 275;
        this.ignoreTypes.push(cardCollectable);
        this.ignoreTypes.push(blood);
        this.ignoreTypes.push(giblet);
        
        this.colRay = null;
        this.rayCols = [];
    }

    calculateCollisionRay(){
        this.colRay = ray.fromPoints(this.getLastPos(), this.pos);
    }
    getCollisionRay(){
        if(!this.colRay) this.calculateCollisionRay();
        return this.colRay;
    }

    checkObjectCollision(obj){
        if(obj == this) return;
        if(this.ignoresType(obj)) return;
        var coll = obj.hitBox.getRayCollision(this.getCollisionRay());
        if(coll)
            this.rayCols.push({ob: obj, col:coll});
    }
    checkTerrainCollision(terrain){
        if(terrain instanceof terrain_platform) return;
        var coll = terrain.hitBox.getRayCollision(this.getCollisionRay());
        if(coll)
            this.rayCols.push({ob: terrain, col:coll});
    }
    handleTerrainCollisions(terrains){
        this.onGround = false;

        var ths = this;
        terrains.forEach(function(terrain){
            ths.checkTerrainCollision(terrain);
        });
    }
    collide(){
        var closestCol = this.rayCols[0];
        if(this.rayCols.length > 1)
            for(var i = 1; i < this.rayCols.length; i++){
                if(this.rayCols[i].col.point.distance(this.pos) < closestCol.col.point.distance(this.pos))
                    closestCol = this.rayCols[i];
            }
        this.pos = closestCol.col.point.clone();
        if(closestCol.ob instanceof physicsObject)
            this.objectCollide(closestCol.ob, collisionBox.fromPoint(closestCol.col.point));
        else this.terrainCollide(closestCol.ob, collisionBox.fromPoint(closestCol.col.point));
    }

    update(){
        if(this.rayCols.length > 0){
            this.collide();
            return;
        }
        super.update();
        this.colRay = null;
    }
}
class proj_plasma extends projectile{
    constructor(){
        super();
        this.dmg = 6;
        this.knockback = 150;
		this.ang = 0;
    }

	burst(colbox){
		effect.fx_explosionBlue(colbox.center.clone());
		this.remove();
	}
	
	draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(
            new vec2(16, 5),
            new vec2(5, 3)
        );
        var sprite = new spriteContainer(
            gfx.projectile,
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);
		sprite.rotation = this.ang;

        sprite.draw();
    }
}

class proj_c4charge extends projectile{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(6));
        this.gravity = 600;

        this.locked = false;
    }

    detonate(){
        effect.fx_explosion(this.pos, 2);
        playSound(sfx.explosion);
        explosion.explode(this.pos, 25, 12, 450);
        this.remove();
    }

    terrainCollide(terrain, colbox){
        if(terrain instanceof terrain_platform) return;
        this.locked = true;
    }
    handleObjectCollisions(){}
    handleTerrainCollisions(terrains){
        if(this.locked) return;
        super.handleTerrainCollisions(terrains);
    }

    update(){
        if(this.locked) return;
        super.update();
    }
    draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(
            new vec2(8, 0),
            new vec2(8, 8)
        );
        var sprite = new spriteContainer(
            gfx.projectile,
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);

        sprite.draw();
    }
}
class proj_grenade extends projectile{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(5));
        this.gravity = 600;
		this.fuse = 1.5;
    }

    detonate(){
        effect.fx_explosion(this.pos, 1);
        playSound(sfx.explosion);
        explosion.explode(this.pos, 16, 6, 250);
		
        this.hitBox = collisionModule.boxCollider(new vec2(10));
        this.updateHitBox();
        this.handleTerrainCollisions(state.terrain);

		//fragments
		var advel = new vec2(0, -100);
		var count = 12;
		var angInc = Math.PI * 2 / count;
		for(let i = count; i > 0; i--){
			let ang = i * angInc + Math.random() * angInc;
			let spd = 50 + Math.random() * 400;
			let vel = vec2.fromAng(ang, spd).plus(advel);
			let proj = new projectile();
            proj.pos = this.pos.clone();
            proj.hitBox = collisionModule.circleCollider(4);
			proj.updateHitBox();
			proj.vel = vel;
			proj.dmg = 6;
			proj.knockback = 250;
			proj.airFriction = 0.9;
			proj.gravity = 600;
			
			proj.add();
		}
		
        this.remove();
    }

	objectCollide(obj, colbox){ }
    terrainCollide(terrain, colbox){
		if(terrain instanceof terrain_platform)
			return;
		if(this.fuse > 0.25)
			this.fuse = 0.25;
	}

    update(){
		this.fuse -= dt;
		if(this.fuse <= 0)
			this.detonate();
        super.update();
    }
    draw(){
		this.updateLVPos();
        var sprBox = new spriteBox(
            new vec2(16, 0),
            new vec2(5)
        );
        var sprite = new spriteContainer(
            gfx.projectile,
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);

        sprite.draw();
    }
}

class proj_lazer extends projectile{
    constructor(){
        super();
        this.dmg = 150;
        this.knockback = 100;
        this.lifetime = 0.5;

        this.rayCol = null;
        this.cols = [];
        this.closestCol = null;
        this.firstDraw = true;
    }
    setRay(){
        this.rayCol = new ray(this.pos, this.vel.direction(), 500);
    }

    objectCollide(obj, colbox){
        if(obj.damage)
            obj.damage(this.dmg * dt, colbox);

        effect.fx_explosionBlue(colbox.center);
        obj.vel = this.vel.clone();
    }
    checkTerrainCollision(terrain){
        if(terrain instanceof terrain_platform)
            return;
            
        var coll = this.rayCol.getBoxCollision(terrain.hitBox.getBoundingBox());

        if(coll)
            this.cols.push({point: coll.point, ob: null});
    }
    checkObjectCollision(obj){
        for(let type of this.ignoreTypes)
            if(obj instanceof type) return;
        if((obj instanceof cardCollectable) || (obj instanceof projectile)) return;

        var coll = this.rayCol.getBoxCollision(obj.hitBox.getBoundingBox());
        
        if(coll)
            this.cols.push({point: coll.point, ob: obj});
    }
    handleTerrainCollisions(terrains){
        this.cols = [];
        var ths = this;
        terrains.forEach(function(terrain){
            ths.checkTerrainCollision(terrain);
        });
    }

    update(){
        this.lifetime -= dt;
        if(this.lifetime <= 0)
            this.remove()

        var ths = this;
        this.cols.sort(function(a, b){
            return a.point.distance(ths.pos) - b.point.distance(ths.pos);
        });

        if(this.cols.length > 0){
            this.closestCol = this.cols[0];
            var ths = this;
            this.cols.forEach(function(col){
                if(col.point.distance(ths.pos) < ths.closestCol.point.distance(ths.pos))
                    ths.closestCol = col;
            });
        }
        if(this.closestCol)
            if(this.closestCol.ob)
                this.objectCollide(this.closestCol.ob, new collisionBox(this.closestCol.point));

        state.player.pos = this.pos;
        state.player.vel = new vec2();
        state.player.hide = true;
    }
    draw(){
        var sprite = new spriteContainer(
            gfx.lazerFace,
            new spriteBox(new vec2(16, 0), new vec2(16,16))
        );
        sprite.bounds.setCenter(this.pos);
        
        var ang = this.vel.direction();
        sprite.rotation = ang;
        sprite.isFlippedY = this.vel.x <= 0;
        
        sprite.draw();
        if(this.firstDraw) {
            this.firstDraw = false;
            return;
        }

        var endpos = this.pos.plus(vec2.fromAng(ang, 500));
        if(this.closestCol) endpos = this.closestCol.point;
        
        renderContext.strokeStyle = "#8CF";
        renderContext.lineWidth = 6; 
        renderContext.beginPath();
        renderContext.moveTo(this.pos.x, this.pos.y);
        renderContext.lineTo(endpos.x, endpos.y);
        renderContext.stroke();

    }
}

class AOE extends projectile{
    constructor(){ super(); }
}
class explosion extends AOE{
    constructor(){
        super();
        this.isUpdated = false;
        this.ignoreTypes = [];
    }

    static explode(pos, radius, dmg, force){
        var r = new explosion();

        r.hitBox = collisionModule.circleCollider(radius);
        r.pos = pos.clone();
        r.updateHitBox();
        r.dmg = dmg;
        r.force = force;

        r.handleObjectCollisions(state.physObjects);
    }

    objectCollide(obj, hitBox){
        var fdir = obj.pos.minus(this.pos).direction();
        var force = vec2.fromAng(fdir, this.force);
        if(obj.damage)
            obj.damage(this.dmg, hitBox);
        obj.vel = force;
    }
    handleObjectCollisions(physObjs){
        super.handleObjectCollisions(physObjs);
        this.isUpdated = true;
    }

    update(){
        if(this.isUpdated)
            this.remove();
        super.update();
    }
}