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
		this.fallThroughPlatforms = false;
        this.updateHitBox();
        this.cardItem = card.randomCard();
    }

    findSpawnPos(){
        var terrainOverlap = false;
        do{
            terrainOverlap = false;
            this.pos = getRandomScreenPos();
            this.updateHitBox();

            for(let i = state.terrain.length - 1; i >= 0; i--){
                if(this.hitBox.getCollision(state.terrain[i].hitBox)){
                    terrainOverlap = true;
                    break;
                }
            }
        } while(terrainOverlap);
        return this.pos;
    }
    spawn(){
        this.pos = this.findSpawnPos();

        state.cardItems.push(this);
        state.physObjects.push(this);
    }

    pickUp(plyr){
        playSound(sfx.pickup);
        this.remove();
        state.addCard(this.cardItem);
        state.addScore(10);
    }
    remove(){
        var index = state.cardItems.indexOf(this); 
        if(index >= 0)
            state.cardItems.splice(index, 1);
        super.remove();
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
        //return new card_anvil();
        var m = [
            card_revolver,
            card_eyeball,
            card_anvil,
            card_shotgun,
            card_medkit,
            card_lazer
        ];
        return new m[Math.floor(m.length * Math.random())]();
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
        this.name = "Revolver";
        this.graphic = 0;
        this.type = "ATK - Ranged";
        this.text = ["Damage: 3"];
        
        this.uses = 6;
        this.coolDown = 200;
    }

    use(plr){
        if(!super.use(plr)) return;
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));

        playSound(sfx.shoot);
        projectile.fire(projectile, off, 250, ang, [player]);
    }
    drawOnPlayer(plr){
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));
        var hOff = vec2.fromAng(ang + Math.PI / 4 * (plr.isFlipped ? -1 : 1), 3).plus(vec2.fromAng(ang, -3));

        var sprite = new spriteContainer(
            gfx.weapons,
            new spriteBox(new vec2(),new vec2(8, 6))
        );
        sprite.bounds.setCenter(off);
        sprite.rotation = ang;
        sprite.isFlippedY = plr.isFlipped;

        sprite.draw();
        plr.drawHand(off.plus(hOff));
    }
}
class card_shotgun extends card{
    constructor(){
        super();
        this.name = "Shotgun";
        this.graphic = 1;
        this.type = "ATK - Ranged";
        this.text = ["Damage: 15", "5x Pellets"];
        
        this.uses = 2;
        this.coolDown = 1000;
    }

    use(plr){
        if(!super.use(plr)) return;
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));

        playSound(sfx.shotgun)
        for(let i = 5; i > 0; i--){
            let spread = ((Math.random() - 0.5) * (Math.random() - 0.5)) * 1.5;
            let spdVar = Math.random() * 25;
            projectile.fire(proj_shotgun, off, 350 + spdVar, ang + spread, [player]);
        }
    }
    drawOnPlayer(plr){
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));
        var hOff = vec2.fromAng(ang + Math.PI / 4 * (plr.isFlipped ? -1 : 1), 3).plus(vec2.fromAng(ang, -4));

        var sprite = new spriteContainer(
            gfx.weapons,
            new spriteBox(new vec2(9, 0), new vec2(11, 6))
        );
        sprite.bounds.setCenter(off);
        sprite.rotation = ang;
        sprite.isFlippedY = plr.isFlipped;

        sprite.draw();
        plr.drawHand(off.plus(hOff));
    }
}
class card_lazer extends card{
    constructor(){
        super();
        this.name = "Lazer";
        this.graphic = 2;
        this.type = "ATK - LAZER";
        this.text = ["Damage: 25", "IMA FIRIN' MAH", "LAAAAZERR!!"];
        
        this.uses = 1;
        this.coolDown = 1000;
    }

    use(plyr){
        if(!super.use(plyr)) return;
        
        playSound(sfx.lazer);
        var off = new vec2();
        var proj = new proj_lazer();
        proj.pos = plyr.pos.plus(off);
        proj.vel = vec2.fromAng(plyr.getAim(), 250);
        proj.setRay();
        state.physObjects.push(proj);
    }

    drawOnPlayer(plr){
        var sprite = new spriteContainer(
            gfx.lazerFace,
            new spriteBox(new vec2(), new vec2(16, 16))
        );
        sprite.bounds.setCenter(plr.pos.plus(new vec2(0, -7)));
        sprite.rotation = plr.getAim();
        sprite.isFlippedY = plr.isFlipped;

        sprite.draw();
    }
}
class card_medkit extends card{
    constructor(){
        super();
        this.name = "Med-Kit";
        this.graphic = 6;
        this.type = "RST - Health";
        this.text = ["Health + 50"];
        
        this.uses = 1;
        this.coolDown = 1000;
    }
    
    use(plr){
        if(!super.use(plr)) return;
        playSound(sfx.heal);
        plr.health += 50;
        if(plr.health > 100) plr.health = 100;
    }
}
class card_anvil extends card{
    constructor(){
        super();
        this.name = "Anvil";
        this.graphic = 3;
        this.type = "Misc.";
        this.text = ["DO NOT DROP"];

        this.uses = 1;
        this.coolDown = 1000;
    }

    use(plr){
        if(!super.use(plr)) return;
        var off = new vec2(15 * (plr.isFlipped ? -1 : 1), 0);
        var tpos = plr.pos.plus(off);

        console.log(off);

        var anv = new anvil();
        anv.pos = tpos;
        anv.vel = plr.vel.clone();
        anv.updateHitBox();
        state.physObjects.push(anv);
    }
}
class card_eyeball extends card{
    constructor(){
        super();
        this.name = "Eyeball";
        this.graphic = 5;
        this.type = "Misc.";
        this.text = ["Reveals cards"];
        this.uses = 1;
        this.lastUsed = 0;
        this.coolDown = 250;
    }

    use(plr){
        if(!super.use(plr)) return;

        state.cardSlots.forEach(function(card){
            if(!card) return;
            card.isFlipped = true;
        });
    }
}