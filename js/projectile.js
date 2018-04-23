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
    }

    static fire(projType, pos, speed, angle, ignoreTypes = []){
        var proj = new projType();
        proj.pos = pos.clone();
        proj.updateHitBox();
        proj.vel = vec2.fromAng(angle, speed);
        proj.ignoreTypes = ignoreTypes;

        state.physObjects.push(proj)
    }

    damage(){}

    checkObjectCollision(obj){
        for(let type of this.ignoreTypes)
            if(obj instanceof type) return;
        if((obj instanceof cardCollectable) || (obj instanceof projectile)) return;
        if(obj instanceof enemy) if(obj.isSpawning) return;
        super.checkObjectCollision(obj);
    }
    objectCollide(obj, colbox){
        var force = this.vel.normalized(this.knockback);
        obj.vel = obj.vel.plus(force);

        if(obj.damage)
            obj.damage(this.dmg);

        var coll = this.hitBox.getCollision(obj.hitBox);
        this.burst(coll);
    }
    terrainCollide(terrain, colbox){
        if(terrain instanceof terrain_platform) return;
        var coll = this.hitBox.getCollision(terrain.hitBox);
        this.burst(coll);
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
		this.ignoreTypes = [enemy];
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

class proj_shotgun extends projectile{
    constructor(){
        super();
        this.dmg = 5;
        this.knockback = 225;
    }
}
class proj_lazer extends projectile{
    constructor(){
        super();
        this.dmg = 65;
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
            obj.damage(this.dmg * dt);

        effect.fx_explosionBlue(colbox.center);
        obj.vel = this.vel.clone();
    }
    checkTerrainCollision(terrain){
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