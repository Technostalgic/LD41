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
		this.lastDrawPos = new vec2();
		
		this.animStartTime = state.timeElapsed;
		this.isAnimating = false;
    }

    static randomCard(){
        //return new card_grenade();
        var m = [
            card_revolver,
            card_eyeball,
            card_anvil,
            card_shotgun,
            card_medkit,
            card_crossbow,
            card_lazer,
            card_c4,
            card_sniper,
            card_crate,
            card_crowbar,
            card_grenade,
            card_plasmaGun,
            card_metalBox
        ];
        return new m[Math.floor(m.length * Math.random())]();
    }

	setLastDrawPos(slotNum){
		this.lastDrawPos = new vec2(335 - (slotNum * 60), 10);
		if(slotNum > 1) this.lastDrawPos.x -= 20;
		this.isAnimating = false;
		return this;
	}
	setLastDrawPosExact(vec){
		this.lastDrawPos = vec;
		this.isAnimating = false;
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
        return (this.getUseElapsedTime() >= this.coolDown);
    }
	getUseElapsedTime(){
		return (state.timeElapsed - this.lastUsed);
	}

    remove(){
        var index = state.cardSlots.indexOf(this);
        if(index >= 0) state.cardSlots[index] = null;
        state.bumpCards();
    }

	getAnimatedXPos(newPosX){
		var animElapsed = state.timeElapsed - this.animStartTime;
		animElapsed /= 200;
		var dPosX = newPosX - this.lastDrawPos.x;
		
		return this.lastDrawPos.x + dPosX * animElapsed;
	}
	
    drawOnPlayer(plyr){ }
    drawOnHUD(slotXPos){
		if(!this.isAnimating)
			if(this.lastDrawPos.x != slotXPos){
				this.isAnimating = true;
				this.animStartTime = state.timeElapsed;
			}
			
		var dposX = slotXPos;
		if(this.isAnimating){
			if(state.timeElapsed >= this.animStartTime + 200)
				this.setLastDrawPosExact(new vec2(slotXPos, 10));
			else dposX = this.getAnimatedXPos(slotXPos);
		}
		
        var frame = this.isFlipped ? 1 : 0;
        var sprBox = new spriteBox(
            new vec2(frame * 50, 0),
            new vec2(50, 75)
        );

        var sprite = new spriteContainer(
            gfx.cardHUD,
            sprBox,
            new collisionBox(new vec2(dposX, 10), sprBox.size.clone())
        );
        sprite.draw();
        if(this.isFlipped) this.drawFace(dposX);
    }
    drawFace(drawPosX){
        var frame = this.graphic;
        var sprBox = new spriteBox(
            new vec2(frame * 20, 0),
            new vec2(20, 15)
        );
        var sprite = new spriteContainer(
            gfx.cardGraphics,
            sprBox,
            new collisionBox(new vec2(drawPosX + 5, 22), sprBox.size.multiply(2))
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
        this.text = ["Damage: 6"];
        
        this.uses = 6;
        this.coolDown = 100;
    }

    use(plr){
        if(!super.use(plr)) return;
        var ang = plr.getAim();
        ang += (0.25 *(Math.random() - 0.5));
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));

        playSound(sfx.revolver);
        var proj = projectile.fire(projectile, off, 250, ang, [player, cardCollectable]);
        proj.dmg = 6;
		
		var recoil = vec2.fromAng(ang + Math.PI, 100);
		plr.vel = plr.vel.plus(recoil);
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
            projectile.fire(proj_shotgun, off, 350 + spdVar, ang + spread, [player, cardCollectable]);
        }
		
		var recoil = vec2.fromAng(ang + Math.PI, 300);
		plr.vel = plr.vel.plus(recoil);
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
class card_crossbow extends card{
    constructor(){
        super();
        this.name = "Crossbow";
        this.graphic = 4;
        this.type = "ATK - Ranged";
        this.text = ["Damage: 12"];
        
        this.uses = 3;
        this.coolDown = 1000;
    }

    use(plr){
        if(!super.use(plr)) return;
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));
		var popVel = -35;

        playSound(sfx.crossbow);
        var proj = projectile.fire(proj_arrow, off, 350, ang, [player, cardCollectable]);
		
		if(plr.yAim == 0)
			proj.vel.y += popVel;
		
        proj.ang = ang;
        proj.isFlipped = plr.isFlipped;
		
		var recoil = vec2.fromAng(ang + Math.PI, 150);
		plr.vel = plr.vel.plus(recoil);
    }
    drawOnPlayer(plr){
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));
        var hOff = vec2.fromAng(ang + Math.PI / 4 * (plr.isFlipped ? -1 : 1), 3).plus(vec2.fromAng(ang, -3));

        var sprite = new spriteContainer(
            gfx.weapons,
            new spriteBox(new vec2(21, 0),new vec2(11, 6))
        );
        sprite.bounds.setCenter(off);
        sprite.rotation = ang;
        sprite.isFlippedY = plr.isFlipped;

        sprite.draw();
        plr.drawHand(off.plus(hOff));
    }
}
class card_sniper extends card{
    constructor(){
        super();
        this.name = "Sniper";
        this.graphic = 8;
        this.type = "ATK - Ranged";
        this.text = ["Damage: 8", "Laser Sight"];
        
        this.uses = 4;
        this.coolDown = 750;
    }

    use(plr){
        if(!super.use(plr)) return;
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));

        playSound(sfx.revolver);
        var proj = projectile.fire(proj_sniper, off, 750, ang, [player, cardCollectable]);
        proj.ang = ang;
        proj.isFlipped = plr.isFlipped;
		
		var recoil = vec2.fromAng(ang + Math.PI, 200);
		plr.vel = plr.vel.plus(recoil);
    }
    drawOnPlayer(plr){
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));
        var hOff = vec2.fromAng(ang + Math.PI / 4 * (plr.isFlipped ? -1 : 1), 3).plus(vec2.fromAng(ang, -3));

        var laserRay = new ray(off, ang, 1000);
        var laserCols = [];
        var dummybullet = new proj_sniper();
        state.terrain.forEach(function(terrain){
            if(terrain instanceof terrain_platform)
                return;
            let tcol = terrain.hitBox.getRayCollision(laserRay);
            if(tcol)
                laserCols.push(tcol);
        });
        state.physObjects.forEach(function(obj){
            if(dummybullet.ignoresType(obj) || obj instanceof projectile)
                return;
            let tcol = obj.hitBox.getRayCollision(laserRay);
            if(tcol)
                laserCols.push(tcol);
        });
        var closestCol = {point: off.plus(vec2.fromAng(ang, 1000))};
        laserCols.forEach(function(col){
            if(col.point.distance(off) < closestCol.point.distance(off))
                closestCol = col;
        });
        drawLine(
            off.rounded().plus(new vec2(0.5, -0.5)), 
            closestCol.point.rounded().plus(new vec2(0.5, -0.5)), 
            color.fromHex("#F00")
        );

        var sprite = new spriteContainer(
            gfx.weapons,
            new spriteBox(new vec2(33, 0),new vec2(13, 6))
        );
        sprite.bounds.setCenter(off.rounded());
        sprite.rotation = ang;
        sprite.isFlippedY = plr.isFlipped;

        sprite.draw();
        plr.drawHand(off.plus(hOff));
    }
}
class card_plasmaGun extends card{
    constructor(){
        super();
        this.name = "Plasma Gun";
        this.graphic = 12;
        this.type = "ATK - Ranged";
        this.text = ["Damage: 6", "Automatic"];
        
        this.uses = 12;
        this.coolDown = 85;
    }

	useHold(plr){
		this.use(plr);
	}
    use(plr){
        if(!super.use(plr)) return;
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));

        playSound(sfx.crossbow);
        var proj = projectile.fire(proj_plasma, off, 275, ang, [player, cardCollectable]);
        proj.ang = ang;
        proj.isFlipped = plr.isFlipped;
		
		var recoil = vec2.fromAng(ang + Math.PI, 90);
		plr.vel = plr.vel.plus(recoil);
    }
    drawOnPlayer(plr){
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8));
        var hOff = vec2.fromAng(ang + Math.PI / 4 * (plr.isFlipped ? -1 : 1), 3).plus(vec2.fromAng(ang, -3));

        var sprite = new spriteContainer(
            gfx.weapons,
            new spriteBox(new vec2(33, 6),new vec2(13, 6))
        );
        sprite.bounds.setCenter(off.rounded());
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

class card_crowbar extends card{
    constructor(){
        super();
        this.name = "Crowbar";
        this.graphic = 10;
        this.type = "ATK - Melee";
        this.text = ["Damage: 10", "Anti-headcrab"];

        this.uses = 4;
        this.coolDown = 150;
		this.hitUsed = false;
    }
	    
	hold(plr){
		super.hold(plr);
		
		if(!this.canUse()){
			if(this.getUseElapsedTime() <= this.coolDown / 2)
				this.swing(plr);
			else this.hitUsed = false;
		}
		else this.hitUsed = false;
    }
	swing(plr){
		var ang = plr.getAim();
        var tpos = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 15));
		var hitArea = collisionModule.boxCollider(new vec2(6));
		hitArea.centerAtPoint(tpos);
		if(!this.hitUsed){
		var ths = this;
		state.physObjects.forEach(function(obj){
				let colbox = hitArea.getCollision(obj.hitBox);
				if(!colbox) return;
				ths.hit(obj, ang, plr, colbox);
			});
		}
	}
	hit(obj, dirAng, plr, colbox){
		if(obj instanceof player) return;
		
		var force = vec2.fromAng(dirAng, 350);
		obj.vel = obj.vel.plus(force);
        plr.vel = force.multiply(-0.5);
        
		if(obj.damage)
			obj.damage(10, colbox);
		
		this.hitUsed = true;
	}
	
	use(plr){
        if(!super.use(plr)) return;
		playSound(sfx.swoosh);
	}
	drawOnPlayer(plr){
		var usePerc = Math.min(1, this.getUseElapsedTime() / this.coolDown);
		var swPerc = 1 - Math.abs(usePerc * 2 - 1);
        var ang = plr.getAim();
        var off = plr.pos.plus(new vec2(0, -4)).plus(vec2.fromAng(ang, 8 + swPerc * 6));
        var hOff = vec2.fromAng(ang + Math.PI / 4 * (plr.isFlipped ? -1 : 1), 5).plus(vec2.fromAng(ang, -4));

        var sprite = new spriteContainer(
            gfx.weapons,
            new spriteBox(new vec2(46, 0), new vec2(8, 12))
        );
        sprite.isFlippedY = plr.isFlipped;
		
		var spriteAngOff = usePerc < 0.5 || usePerc == 1 ? 0 :
			(plr.isFlipped ? -1 : 1) * Math.PI / 2;
		var spriteSwingOff = usePerc < 0.5 || usePerc == 1 ? new vec2() :
			new vec2(4, (plr.isFlipped ? -1 : 1) * 4);
        spriteSwingOff = spriteSwingOff.rotate(ang);
			
        sprite.bounds.setCenter(off.plus(spriteSwingOff));
        sprite.rotation = ang + spriteAngOff;

        sprite.draw();
        plr.drawHand(off.plus(hOff));
    }
}

class card_c4 extends card{
    constructor(){
        super();
        this.name = "C-4";
        this.graphic = 7;
        this.type = "EXP - Bomb";
        this.text = ["Damage: 12", "Remote", "Detonation"];
        
        this.uses = 2;
        this.coolDown = 250;
        this.charge = null;
    }

    use(plr){
        if(!super.use(plr)) return;
        if(!this.charge){
			playSound(sfx.swoosh);
            this.charge = projectile.fire(proj_c4charge, plr.pos, 200, plr.getAim());
            this.charge.vel = this.charge.vel.plus(plr.vel.multiply(0.5));
            this.uses++;
            return;
        }
        this.charge.detonate();
        this.charge = null;
    }
}
class card_grenade extends card{
    constructor(){
        super();
        this.name = "Grenade";
        this.graphic = 11;
        this.type = "EXP - Bomb";
        this.text = ["Damage: 15", "Fragments"];
        
        this.uses = 3;
        this.coolDown = 250;
    }

    use(plr){
        if(!super.use(plr)) return;
		
		playSound(sfx.swoosh);
        var proj = projectile.fire(proj_grenade, plr.pos, 250, plr.getAim());
        proj.vel = proj.vel.plus(plr.vel.multiply(0.75));
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

        var anv = new anvil();
        anv.pos = tpos;
        anv.vel = plr.vel.clone();
        anv.updateHitBox();
        state.physObjects.push(anv);
    }
}
class card_crate extends card{
    constructor(){
        super();
        this.name = "Crate";
        this.graphic = 9;
        this.type = "Misc.";
        this.text = ["Good for stacking", "or for smashing"];

        this.uses = 1;
        this.coolDown = 200;
    }

    use(plr){
        if(!super.use(plr)) return;
        var off = new vec2(15 * (plr.isFlipped ? -1 : 1), -5);
        var tpos = plr.pos.plus(off);
        
        var crt = new crate();
        crt.pos = tpos;
        crt.vel = plr.vel.clone();
        crt.updateHitBox();
        state.physObjects.push(crt);
    }
}
class card_metalBox extends card{
    constructor(){
        super();
        this.name = "Metal Box";
        this.graphic = 9;
        this.type = "Misc.";
        this.text = ["Solid.", "Sturdy."];

        this.uses = 1;
        this.coolDown = 200;
    }

    use(plr){
        if(!super.use(plr)) return;
        var off = new vec2(18 * (plr.isFlipped ? -1 : 1), -8);
        var tpos = plr.pos.plus(off);
        
        var mtlbx = new metalBox();
        mtlbx.pos = tpos;
        mtlbx.vel = plr.vel.clone();
        mtlbx.updateHitBox();
        state.physObjects.push(mtlbx);
    }
}
class card_eyeball extends card{
    constructor(){
        super();
        this.name = "Eyeball";
        this.graphic = 5;
        this.type = "Misc.";
        this.text = ["+1 Card", "Reveals cards"];
        this.uses = 1;
        this.lastUsed = 0;
        this.coolDown = 250;
    }

    use(plr){
        if(!super.use(plr)) return;

        state.addCard(card.randomCard());
        state.cardSlots.forEach(function(card){
            if(!card) return;
            card.isFlipped = true;
        });
		state.checkCardsForStacking();
    }
}