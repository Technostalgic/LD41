///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class projectile extends physicsObject{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(2));
        this.ignoreTypes = [];
        this.damage = 5;
        this.knockback = 100;
    }

    static fire(projType, pos, speed, angle, ignoreTypes = []){
        var proj = new projType();
        proj.pos = pos.clone();
        proj.updateHitBox();
        proj.vel = vec2.fromAng(angle, speed);

        state.physObjects.push(proj)
    }

    applyGravity(){}
    applyAirFriction(){}

    objectCollide(obj){
        if(obj.health)
            obj.health -= this.damage;

        var force = this.vel.normalized(this.knockback);
        obj.vel = obj.vel.plus(force);

        var coll = this.hitBox.getCollision(obj.hitBox);
        this.burst(coll);
    }
    terrainCollide(terrain){
        var coll = this.hitBox.getCollision(terrain.hitBox);
        this.burst(coll);
    }
    burst(collision){
        this.remove();
    }

    handleObjectCollisions(obj){
        for(let type of this.ignoreTypes)
            if(obj instanceof type) return;
    }

    draw(){
        var sprBox = new spriteBox(
            new vec2(),
            new vec2(gfx.projectile.width, gfx.projectile.height)
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