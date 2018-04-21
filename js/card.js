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
        this.isFlipped = false;
    }

    static randomCard(){
        return new card();
    }

    hold(plyr){ }
    use(plyr){
        this.uses--;
        console.log(this.uses);

        if(this.uses <= 0)
            this.remove();
    }

    remove(){
        var index = state.cardSlots.indexOf(this);
        if(index >= 0) state.cardSlots[index] = null;
        state.bumpCards();
    }

    drawOnPlayer(plyr){ }
    drawOnHUD(slotXPos){
        var frame = this.isFlipped ? 1 : 0;
        var sprBox = new spriteBox(
            new vec2(frame * 50, 0),
            new vec2(50, 75)
        );

        var sprite = new spriteContainer(
            gfx.cardHUD,
            sprBox,
            new collisionBox(new vec2(slotXPos, 10), sprBox.size.clone())
        );
        sprite.draw();
    }
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
        state.addCard(this.cardItem);
    }

    draw(){
        var yoff = 0;
        if(this.onGround)
            yoff = Math.sin(state.timeElapsed / 250 % (Math.PI * 2)) * 2 - 3;

        var sprBox = new spriteBox(new vec2(), new vec2(gfx.cardItem.width, gfx.cardItem.height));
        var sprite = new spriteContainer(
            gfx.cardItem, 
            sprBox, 
            new collisionBox(new vec2(), sprBox.size.clone())
        );
        sprite.bounds.setCenter(this.pos.plus(new vec2(0, yoff)));

        sprite.draw();
    }
}