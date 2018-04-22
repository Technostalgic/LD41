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
        this.hitBox = collisionModule.boxCollider(new vec2(10));
    }
}