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
	static drawInstructions(){
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
		
		if(state.timeElapsed / 1000 % 1 >= 0.50)
			textContext.globalAlpha = 0.5;
		
		var playerpos = new vec2(100, 200);
		drawText("You", playerpos.plus(new vec2(0, 25)), 16, color.fromHex("#8CA"));
		drawText("Use arrow keys for movement and aim, 'Z' to jump.", playerpos.plus(new vec2(0, 35)), 16);
		drawText("Fall through platforms by holding 'down' while falling.", playerpos.plus(new vec2(0, 45)), 16);
		drawText("Avoid Scary looking things.", playerpos.plus(new vec2(0, 55)), 16);
		
		var carditempos = new vec2(300, 200);
		drawText("Card", carditempos.plus(new vec2(0, 25)), 16, color.fromHex("#A8F"));
		drawText("Collect to put in your hand.", carditempos.plus(new vec2(0, 35)), 16);
		
		var pausepos = new vec2(200, 275);
		drawText("Press ESCAPE while playing to pause the game and access these instructions", pausepos.plus(new vec2(0, 0)), 16, color.fromHex("#AAF"));
		
		var healthpos = new vec2(75, 105);
		drawText("Health", healthpos.plus(new vec2(0, 0)), 24, color.fromHex("#F44"));
		drawText("When it runs out, you die.", healthpos.plus(new vec2(0, 10)), 16);
		
		var cardspos = new vec2(130, 35);
		drawText("Cards (Hand)", cardspos.plus(new vec2(0, 0)), 24);
		drawText("Cards received will stack from right to left.", cardspos.plus(new vec2(0, 10)), 16);
		drawText("When you use your primary card, the next card will take it's place.", cardspos.plus(new vec2(0, 20)), 16);
		drawText("Your secondary card slot will not fill up unless you equip a card to it.", cardspos.plus(new vec2(0, 30)), 16);
		
		var primarypos = new vec2(300, 40);
		drawText("Primary", primarypos.plus(new vec2(0, 0)), 16, color.fromHex("#AAF"));
		drawText("'C' to use card", primarypos.plus(new vec2(0, 10)), 14);
		
		var secondarypos = new vec2(360, 40);
		drawText("Secondary", secondarypos.plus(new vec2(0, 0)), 16, color.fromHex("#AAF"));
		drawText("'X' to swap", secondarypos.plus(new vec2(0, 10)), 14);
		drawText("with primary", secondarypos.plus(new vec2(0, 18)), 14);
	}
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
			gameState.drawInstructions();
			this.drawStartPrompt();
		}
		else{
			renderContext.fillStyle = "#000";
			renderContext.fillRect(0, 0, 800, 700);
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
		drawText("A҉ Tribute to M̶̦̱̕͢ͅa͈̫̤̘̗̙͘͝y̵҉̡̖̻̮͈ḩ̣̣͖̖͈̖͔̩̺͙̗̖̤͇͓͕́͞ͅè̳̗͖̟̝̰̼̪̲̕͟͠m̨̢̨̨̬̩͔͎͍͓̹̦̻̰͈̺͎̤̠̦", tpos, 56, color.fromHex("#FAA"), color.fromHex("#600"), 8);
	}
}
class gameState_gameoverScreen extends gameState{
	constructor(score){
        super();
        this.score = score;
	}
	
	controlTap(controlID){
		if(controlID == controlState.controlEnum.start)
			startGame();
	}
	
	draw(){
		renderContext.fillStyle = "#000";
		renderContext.fillRect(0, 0, 800, 700);
        this.drawTitle();
        drawText("Score: " + this.score, new vec2(200), 22);
        drawText("High: " + highScore, new vec2(200, 220), 16);
		this.drawRestartPrompt();
	}
	drawTitle(){
		var tpos = new vec2(200, 75);
		drawText("GA҉ME҉ O҉҉V҉E҉R", tpos, 56, color.fromHex("#FAA"), color.fromHex("#600"), 8);
	}
	drawRestartPrompt(){
		if(this.timeElapsed / 1000 % 1 >= 0.50)
			return;
		var tpos = new vec2(200, 300);
		drawText("Press Space to Restart", tpos, 20);
	}
}
class gameState_pauseScreen extends gameState{
	constructor(resumeState){
		super();
		this.resumeState = resumeState;
		this.showInstructions = false;
	}
	
	controlTap(controlID){
		if(controlID == controlState.controlEnum.pause)
			this.resumeGame();
		if(controlID == controlState.controlEnum.start)
			this.drawInstructions = true;
	}
	
	resumeGame(){
		state = this.resumeState;
	}
	
	draw(){
		if(!this.drawInstructions){
			renderContext.fillStyle = "#000";
			renderContext.fillRect(0, 0, 800, 700);
			this.drawTitle();
			this.drawInstructionsPrompt();
		}
		else
			gameState.drawInstructions();
		this.drawResumePrompt();
	}
	drawTitle(){
		var tpos = new vec2(200, 75);
		drawText("-Paused-", tpos, 36, color.fromHex("#FFF"), color.fromHex("#000"), 8);
	}
	drawResumePrompt(){
		if(this.timeElapsed / 1000 % 1 >= 0.50)
			return;
		var tpos = new vec2(200, 300);
		drawText("Press ESCAPE to Resume the Game", tpos, 20);
	}
	drawInstructionsPrompt(){
		if(this.timeElapsed / 1000 % 1 >= 0.50)
			return;
		var tpos = new vec2(200, 320);
		drawText("Press Space for Instructions", tpos, 16);
	}
}

class gameState_gamePlay extends gameState{
    constructor(){
        super();
		this._timeElapsed = 0;
        this.player = new player();
        this.player.pos = new vec2(renderCanvas.width / 2);

        this.currentWave = new wave(1);
        this.terrain = getRandomTerrainLayout();
        
        this.physObjects = [
            this.player
        ];
        this.enemies = [];
        this.cardItems = [];
        this.effects = [];

        this.score = 0;
        this.cardSlots = [null, null, null, null, null, null];
		this.addCard(new card_crowbar());
    }
    testSpawn(){
        for(let i = 6; i > 0; i--){
            let c = new cardCollectable();
            c.spawn();
            let z = enemy.randomEnemy();
            z.spawn();
        }
    }

	get timeElapsed(){
		return this._timeElapsed * 1000;
	}
	
    getTopCardSlot(){
        for(let i = 1; i < this.cardSlots.length; i ++)
            if(!this.cardSlots[i]) return i;
        return -1;
    }
    addCard(cardOb){
        var slot = this.getTopCardSlot();
        if(slot < 0) return;
        this.cardSlots[slot] = cardOb.setLastDrawPos(slot);
    }
    bumpCards(){
        var m = [];
        for(var i = 1; i < this.cardSlots.length; i++)
            if(this.cardSlots[i]) m.push(this.cardSlots[i]);
            
        for(var i = 1; i < this.cardSlots.length; i++)
            this.cardSlots[i] = m.length > 0 ? m.splice(0, 1)[0] : null;
    }

	pauseGame(){
		state = new gameState_pauseScreen(this);
	}
    addScore(points){
        this.score += points;
    }

    update(){
		this._timeElapsed += dt;
		
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
        this.physObjects.forEach(function(obj){
            if(obj instanceof player) return;
            if(obj instanceof enemy) return;
            obj.draw();
        });
        this.enemies.forEach(function(en){
            en.draw();
        })

        if(this.player.health > 0)
            this.player.draw();
        
        this.terrain.forEach(function(terrain){
            terrain.draw();
        });

        this.effects.slice().reverse().forEach(function(effect){
            effect.draw();
        });

        this.drawHUD();
		
		if(this.currentWave.timeElapsed <= 2.5)
			this.currentWave.drawStartingText();
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
        fillText(scoreString, scorepos, 20, color.fromHex("#DA0"));
        drawText("High: " + highScore, new vec2(200, 110), 16);

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
                this.player.action_swapSecondary();
                break;
            case controlState.controlEnum.pause: 
                this.pauseGame();
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