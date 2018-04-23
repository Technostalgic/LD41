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

class anvil extends prop{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(20, 9));
        this.ignoreTypes = [player, projectile, anvil];
    }

    objectCollide(obj){
        if(this.ignoresType(obj)) return;
        if(this.vel.y <= 100)
            return;
        if(obj.vel.y >= this.vel.y)
            return;
        
        obj.vel.y = this.vel.y;

        if(obj.damage)
            obj.damage(20);

        this.vel.y = 0;
    }

    draw(){
        var sprBox = new spriteBox(new vec2(60,6), new vec2(20, 9));
        var sprite = new spriteContainer(
            gfx.cardGraphics,
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
        this.health = 20;
    }

    handleObjectCollisions(){}

    damage(dmg){
        this.health -= dmg;
        if(this.health <= 0)
            this.burst();
    }
    burst(){
        this.spawnGibs();
        this.remove();
    }
    spawnGibs(){
        var count = 6;
        var angInc = 1 / count * Math.PI * 2;
        var addVel = this.vel;
        if(this.onGround)
            addVel.y = -100;
        for(let i = count; i >= 0; i--){
            let ang = angInc * i + Math.random() * angInc;
            let fvel = vec2.fromAng(ang, 50 + Math.random() * 150);
            let gib = new giblet();
            gib.pos = this.pos.clone();
            gib.updateHitBox();
            gib.vel = addVel.plus(fvel);
            gib.add();
        }
    }

    getSpriteBox(){
        if(this.onGround) return this.lyingSprite;
        if(this.vel.y < 0) return this.risingSprite;
        return this.fallingSprite;
    }

    draw(){
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
    }

    terrainCollide(terrain){
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