///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class card{
    constructor(){
        this.name = "Unknown";
        this.graphic = 0;
        this.type = "Default";
        this.text = "";
        this.uses = 1;
    }

    static randomCard(){
        return new card();
    }

    hold(plyr){ }
    use(plyr){ }

    drawOnPlayer(plyr){ }
    drawOnHUD(){}
}
class cardCollectable extends physicsObject{
    constructor(){
        super();

        this.hitBox = collisionModule.boxCollider(new vec2(10, 14));
        this.updateHitBox();
        this.cardItem = card.randomCard();
    }

    pickUp(plyr){
        this.remove();
    }

    draw(){
        var sprBox = new spriteBox(new vec2(), new vec2(gfx.cardItem.width, gfx.cardItem.height));
        var sprite = new spriteContainer(
            gfx.cardItem, 
            sprBox, 
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos);

        sprite.draw();
    }
}