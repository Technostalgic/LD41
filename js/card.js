///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

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

class card{
    constructor(){
        this.name = "Unknown";
        this.graphic = 0;
        this.type = "Default";
        this.text = ["Damage: N/A", "Cost:N/A"];
        this.uses = 1;
        this.isFlipped = false;
        this.lastUsed = 0;
        this.coolDown = 250;
    }

    static randomCard(){
        return new card_revolver();
    }

    hold(plyr){ 
        if(this.uses <= 0)
            if(this.canUse())
                this.remove();
    }
    use(plyr){
        if(this.uses <= 0) return false;
        if(!this.canUse()) return false;
        this.lastUsed = state.timeElapsed;
        this.uses--;
        return true;
    }
    useHold(plyr){
    }
    canUse(){
        return (state.timeElapsed >= this.lastUsed + this.coolDown);
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
        if(this.isFlipped) this.drawFace(slotXPos);
    }
    drawFace(slotXPos){
        var frame = this.graphic;
        var sprBox = new spriteBox(
            new vec2(frame * 20, 0),
            new vec2(20, 15)
        );
        var sprite = new spriteContainer(
            gfx.cardGraphics,
            sprBox,
            new collisionBox(new vec2(slotXPos + 5, 22), sprBox.size.multiply(2))
        );
        sprite.draw();

        outlineText(this.name, new vec2(sprite.bounds.center.x, 20), 16, color.Black(), 2.5);
        fillText(this.name, new vec2(sprite.bounds.center.x, 20), 16, color.White());
        outlineText(this.type, new vec2(sprite.bounds.center.x, 58), 12, color.Black(), 2.5);
        fillText(this.type, new vec2(sprite.bounds.center.x, 58), 12, color.White());

        for(let i = 0; i < this.text.length; i++)
            fillText(this.text[i], new vec2(sprite.bounds.center.x, 65 + i * 5), 10, color.Black());

        outlineText("x" + this.uses.toString(), new vec2(sprite.bounds.right - 1, 82), 14, color.Black(), 2.5);
        fillText("x" + this.uses.toString(), new vec2(sprite.bounds.right - 1, 82), 14, color.White());
    }
}

class card_revolver extends card{
    constructor(){
        super();
        this.name = "Revolver"
        this.graphic = 0;
        this.type = "ATK - Ranged";
        this.text = ["Damage: 3"];
        
        this.uses = 6;
        this.coolDown = 200;
    }

    use(plyr){
        if(!super.use(plyr)) return;
        projectile.fire(projectile, plyr.pos, 250, plyr.getAim(), [player]);
    }
}