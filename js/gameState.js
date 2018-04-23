///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class gameState{
    constructor(){
        this.startTime = lastRecordedTimeStamp;
    }

    get timeElapsed(){
        return lastRecordedTimeStamp - this.startTime;
    }

    preInput(){}
    controlTap(controlID){ }
    controlPress(controlID){ }

    update(){}
    draw(){}
}

class gameState_startScreen extends gameState{
	constructor(){
		super();
		
		this.drawInstructions = false;
	}
	
	controlTap(controlID){
		if(controlID == controlState.controlEnum.start)
			this.nextScreen();
	}
	nextScreen(){
		if(!this.drawInstructions)
			this.drawInstructions = true;
		else startGame();
	}
	
	draw(){
		if(this.drawInstructions){
			this.drawMockupHUD();
			this.drawMockupHUDLabels();
			this.drawStartPrompt();
		}
		else{
		this.drawTitle();
		this.drawStartPrompt();
		}
	}
	drawStartPrompt(){
		if(this.timeElapsed / 1000 % 1 >= 0.50)
			return;
		var tpos = new vec2(200, 300);
		drawText("Press Space to Start", tpos, 20);
	}
	drawTitle(){
		var tpos = new vec2(200, 75);
		drawText("A҉ Tribute to M̶̦̱̕͢ͅa͈̫̤̘̗̙͘͝y̵҉̡̖̻̮͈ḩ̣̣͖̖͈̖͔̩̺͙̗̖̤͇͓͕́͞ͅè̳̗͖̟̝̰̼̪̲̕͟͠m̨̢̨̨̬̩͔͎͍͓̹̦̻̰͈̺͎̤̠̦", tpos, 36, color.fromHex("#FAA"), color.fromHex("#600"), 8);
	}
	drawMockupHUD(){
        var col = color.Black();
        col.setFill();
        renderContext.fillRect(0, 0, renderCanvas.width, 125);

        renderContext.beginPath();
        var x = 261.5;
        renderContext.moveTo(x, 25);
        renderContext.lineTo(x, 75);
        color.White().setStroke();
        renderContext.lineWidth = 1;
        renderContext.stroke();

        for(var i = 0; i < 6; i++){
            var x = 335 - (i * 60);
            if(i > 1) x -= 20;
            var spot = new collisionBox(
                new vec2(x + 2.5, 12.5),
                new vec2(46, 71)
            );
            spot.drawOutline(renderContext, "#AAA", 1);
        }

        var scorepos = new vec2(200, 100);
        outlineText("Score", scorepos, 20, color.fromHex("#330"), 4);
        fillText("Score", scorepos, 20, color.fromHex("#DA0"));

        var borderSprite = new spriteContainer(
            gfx.hud_border
        );
        borderSprite.bounds.pos = new vec2(200, 116);
        borderSprite.draw();
		
        var healthSpritebox = new spriteBox(
            new vec2(),
            new vec2(Math.floor(236), 36)
        );
        var healthSprite = new spriteContainer(
            gfx.hud_healthBar,
            healthSpritebox
        );
        healthSprite.bounds.pos = new vec2(0, 106);
        healthSprite.draw();
		
		var playerSprite = new spriteContainer(
			gfx.player,
			new spriteBox(new vec2(), new vec2(15, 20))
		);
		playerSprite.bounds.setCenter(new vec2(100, 200));
		playerSprite.draw();
		
		var carditem = new cardCollectable();
		carditem.onGround = true;
		carditem.pos = new vec2(300, 208);
		carditem.draw();
	}
	drawMockupHUDLabels(){
		if(this.timeElapsed / 1000 % 1 >= 0.50)
			textContext.globalAlpha = 0.5;
		
		var playerpos = new vec2(100, 200);
		drawText("You", playerpos.plus(new vec2(0, 25)), 16, color.fromHex("#8CA"));
		drawText("Use arrow keys for movement, 'Z' to jump.", playerpos.plus(new vec2(0, 35)), 16);
		drawText("Avoid Scary looking things.", playerpos.plus(new vec2(0, 45)), 16);
		
		var carditempos = new vec2(300, 200);
		drawText("Card", carditempos.plus(new vec2(0, 25)), 16, color.fromHex("#A8F"));
		drawText("Collect to put in your hand.", carditempos.plus(new vec2(0, 35)), 16);
		
		var healthpos = new vec2(75, 105);
		drawText("Health", healthpos.plus(new vec2(0, 0)), 24, color.fromHex("#F44"));
		drawText("When it runs out, you die.", healthpos.plus(new vec2(0, 10)), 16);
		
		var cardspos = new vec2(150, 50);
		drawText("Cards (Hand)", cardspos.plus(new vec2(0, 0)), 24);
		drawText("Equip to secondary slot, or use in primary slot.", cardspos.plus(new vec2(0, 10)), 16);
		
		var primarypos = new vec2(300, 40);
		drawText("Primary", primarypos.plus(new vec2(0, 0)), 16, color.fromHex("#AAF"));
		drawText("'C' to use card.", primarypos.plus(new vec2(0, 10)), 14);
		
		var secondarypos = new vec2(360, 40);
		drawText("Secondary", secondarypos.plus(new vec2(0, 0)), 16, color.fromHex("#AAF"));
		drawText("'X' to use card.", secondarypos.plus(new vec2(0, 10)), 14);
	}
}
class gameState_gamePlay extends gameState{
    constructor(){
        super();

        this.player = new player();
        this.player.pos = new vec2(renderCanvas.width / 2);

        this.currentWave = new wave(0);
        this.terrain = getTerrainScreenBounds(true);
        
        this.physObjects = [
            this.player
        ];
        this.enemies = [];
        this.cardItems = [];
        this.effects = [];

        this.score = 0;
        this.cardSlots = [null, null, null, null, null, null];
    }
    testSpawn(){
        for(let i = 6; i > 0; i--){
            let c = new cardCollectable();
            c.spawn();
            let z = enemy.randomEnemy();
            z.spawn();
        }
    }

    getTopCardSlot(){
        for(let i = 1; i < this.cardSlots.length; i ++)
            if(!this.cardSlots[i]) return i;
        return -1;
    }
    addCard(cardOb){
        var slot = this.getTopCardSlot();
        if(slot < 0) return;
        this.cardSlots[slot] = cardOb;
    }
    bumpCards(){
        var m = [];
        for(var i = 1; i < this.cardSlots.length; i++)
            if(this.cardSlots[i]) m.push(this.cardSlots[i]);
            
        for(var i = 1; i < this.cardSlots.length; i++)
            this.cardSlots[i] = m.length > 0 ? m.splice(0, 1)[0] : null;
    }

    addScore(points){
        this.score += points;
    }

    update(){
        controlState.update();
        
        this.currentWave.update();

        this.physObjects.forEach(function(obj){
            obj.update();
        });

        var ths = this;
        this.physObjects.forEach(function(obj){
            obj.handleTerrainCollisions(ths.terrain);
        });
        this.physObjects.forEach(function(obj){
            obj.handleObjectCollisions(ths.physObjects);
        });
    }
    draw(){
        this.physObjects.slice().reverse().forEach(function(obj){
            obj.draw();
        });
        
        this.terrain.forEach(function(terrain){
            terrain.draw();
        });

        this.effects.slice().reverse().forEach(function(effect){
            effect.draw();
        });

        this.drawHUD();
    }

    drawHUD(){
        var col = color.Black();
        col.a = 0.35;
        col.setFill();
        renderContext.fillRect(0, 0, renderCanvas.width, 125);

        renderContext.beginPath();
        var x = 261.5;
        renderContext.moveTo(x, 25);
        renderContext.lineTo(x, 75);
        color.White().setStroke();
        renderContext.lineWidth = 1;
        renderContext.stroke();

        this.cardSlots.forEach(function(cardOb, i){
            var x = 335 - (i * 60);
            if(i > 1) x -= 20;
            var spot = new collisionBox(
                new vec2(x + 2.5, 12.5),
                new vec2(46, 71)
            );
            spot.drawOutline(renderContext, "#AAA", 1);

            if(cardOb) {
                if(i <= 2) cardOb.isFlipped = true;
                cardOb.drawOnHUD(x);
            }
        });

        var scorepos = new vec2(200, 100);
        var scoreString = "Score: " + this.score.toString();
        outlineText(scoreString, scorepos, 20, color.fromHex("#330"), 4);
        fillText(scoreString, scorepos, 20, color.fromHex("#DA0"));

        var borderSprite = new spriteContainer(
            gfx.hud_border
        );
        borderSprite.bounds.pos = new vec2(200, 116);
        borderSprite.draw();
        this.drawHealthBar();
    }
    drawHealthBar(){
        var healthPercent = Math.min(1, Math.max(this.player.health / 100, 0));
        
        var fullBox = new spriteBox(
            new vec2(),
            new vec2(Math.floor(236 * healthPercent), 36)
        );
        var emptyBox = new spriteBox(
            new vec2(0, 36),
            new vec2(236, 36)
        );
        var fullSprite = new spriteContainer(
            gfx.hud_healthBar,
            fullBox
        );
        var emptySprite = new spriteContainer(
            gfx.hud_healthBar,
            emptyBox
        );
        var tpos = new vec2(0, 106);
        fullSprite.bounds.pos = tpos
        emptySprite.bounds.pos = tpos;

        emptySprite.draw();
        fullSprite.draw();
    }

    preInput(){
        this.player.preInput();
    }
    controlTap(controlID){
        if(this.player.dead)
            return;
        switch(controlID){
            case controlState.controlEnum.jump:
                this.player.action_jump();
                break;
            case controlState.controlEnum.primary:
                this.player.action_usePrimary();
                break;
            case controlState.controlEnum.secondary: 
                this.player.action_useSecondary();
                break;
        }
    }
    controlPress(controlID){
        if(this.player.dead)
            return;
        switch(controlID){
            case controlState.controlEnum.left:
                this.player.action_move(-1);
                break;
            case controlState.controlEnum.right: 
                this.player.action_move(1);
                break;
            case controlState.controlEnum.up: 
                this.player.action_aim(-1);
                break;
            case controlState.controlEnum.down: 
                this.player.action_aim(1);
                break;
            case controlState.controlEnum.jump:
                this.player.action_jumpSustain();
                break;
            case controlState.controlEnum.pause: break;
        }
    }
}