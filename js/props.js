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

class corpse extends prop{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(10, 4));
        this.spritesheet = null;
        this.fallingSprite = null;
        this.risingSprite = null;
        this.lyingSprite = new spriteBox();
        this.isFlipped = false;
    }

    handleObjectCollisions(){}

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