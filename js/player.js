///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class player extends physicsObject{
    constructor(){
        super();
        this.hitBox = collisionModule.boxCollider(new vec2(8, 12));
        this.maxSpeed = 150;
        this.acceleration = 1500;
        this.health = 100;
        this.fallThroughPlatforms = false;

        this.hide = false;
        this.xMove = 0;
        this.yAim = 0;
        this.isFlipped = false;
        this.primaryEquipped = true;
        this.dead = false;
    }

    preInput(){
        this.yAim = 0;
        this.xMove = 0;
    }

    action_aim(dir = 0){
        this.yAim = Math.sign(dir);
    }
    action_move(dir = 0){
        this.xMove += Math.sign(dir);
    }
    action_jump(){
        var jumpPower = 350;

        if(!this.onGround) return;

        playSound(sfx.jump);
        this.vel.y -= jumpPower;
    }
    action_jumpSustain(){
        var jumpLinger = 15;

        if(this.vel.y < 0)
            this.vel.y -= jumpLinger;
    }
    action_usePrimary(){
        var cardOb = this.getPrimary();
        if(cardOb) {
            this.primaryEquipped = true;
            cardOb.use(this);
        }
    }
    action_useSecondary(){
        var cardOb = this.getSecondary();
        if(cardOb) {
            this.primaryEquipped = false;
            cardOb.use(this);
        }
        else {
            state.cardSlots[0] = state.cardSlots[1];
            state.cardSlots[1] = null;
            state.bumpCards();
        }
    }
    action_useHoldPrimary(){
        var cardOb = this.getPrimary();
        if(cardOb) {
            cardOb.useHold(this);
        }
    }
    action_useHoldSecondary(){
        var cardOb = this.getSecondary();
        if(cardOb) {
            cardOb.useHold(this);
        }
    }

    getAim(){
        var aimvector = new vec2(this.xMove, this.yAim);
        if(this.xMove == 0 && this.yAim == 0)
            aimvector.x = this.isFlipped ? -1 : 1;
        
        return aimvector.direction();
    }

    getPrimary(){
        return state.cardSlots[1];
    }
    getSecondary(){
        return state.cardSlots[0];
    }

    damage(dmg){
        this.health -= dmg;
        if(this.health <= 0)
            this.kill();
    }

    handleMovement(){
        this.applyMovement(this.xMove);

        if(this.xMove != 0)
            this.isFlipped = this.xMove < 0;
        else if(this.onGround)
            this.applyGroundFriction();
    }
    applyMovement(dir){
        dir = Math.sign(dir);
        var maxSpeed = this.maxSpeed;
        if(this.yAim != 0 && this.onGround) maxSpeed *= 0.35;
        var velDir = Math.sign(this.vel.x);
        var accel = this.acceleration * dt;
        accel *= dir;

        // calculate the final velocity if all the acceleration is applied
        var fvel = this.vel.x + accel;

        // if the players speed is below their max speed, only allow the player to accelerate to their max speed
        if(Math.abs(this.vel.x) <= maxSpeed){
            if(Math.abs(fvel) <= maxSpeed)
                this.vel.x = fvel;
            else if(Math.abs(fvel) > maxSpeed)
                this.vel.x = maxSpeed * velDir;
            return;
        }
        // if the player's speed is above their max speed, apply friction to slow them down to their max speed
        else{
            if(this.onGround)
                this.applyGroundFriction();
            if(Math.abs(this.vel.x) < maxSpeed)
                this.vel.x = maxSpeed * velDir;
        }
    }

    checkCollision(obj){
        super.checkCollision(obj);
    }
    objectCollide(obj){
        if(obj instanceof cardCollectable)
            obj.pickUp(this);
    }

    handleTerrainCollisions(terrains){
        this.onGround = false;

        var ths = this;
        terrains.forEach(function(terrain){
            terrain.checkCollision(ths);
        });

        this.updateHitBox();
    }
    updateHitBox(){
        this.hitBox.centerAtPoint(this.pos);
    }

    handleEquippedItems(){
        if(this.getPrimary()) {
            this.getPrimary().hold();
            if(!this.getPrimary())
                this.primaryEquipped = false;
        }
        if(this.getSecondary()) {
            this.getSecondary().hold();
            if(!this.getSecondary())
                this.primaryEquipped = true;
        }
        else this.primaryEquipped = true;
    }

    kill(){
        this.dead = true;
        this.remove();
		
		// lose the game 2.5 seconds after the player dies
		setTimeout(function(){
			loseGame()
		}, 2500);
    }

    getSprite(){
        var xframe = 0;
        var yframe = this.isFlipped ? 1 : 0;
        var spriteSize = new vec2(15, 20);

        if(this.onGround){
            if(this.xMove != 0){
                xframe = Math.floor(state.timeElapsed / 33) % 5;
            }
        }
        else{
            if(this.vel.y < 0)
                xframe = 5;
            else xframe = 6;
        }
        
        var sprBox = new spriteBox(
            new vec2(xframe * spriteSize.x, yframe * spriteSize.y), 
            spriteSize);

        var sprite = new spriteContainer(
            gfx.player, 
            sprBox,
            new collisionBox(new vec2(), sprBox.size.clone()) );
            
        sprite.bounds.setCenter(this.pos.plus(new vec2(0, -3)));
        return sprite;
    }

    update(){
        this.handleMovement();
        this.applyGravity();
        this.applyAirFriction();

        if(!this.onGround && this.yAim > 0)
                this.fallThroughPlatforms = true;
        else this.fallThroughPlatforms = false; 

        this.pos = this.pos.plus(this.vel.multiply(dt));
        this.updateHitBox();

        this.handleEquippedItems();
    }
    draw(){
		this.updateLVPos();
        if(this.hide){
            this.hide = false;
            return;
        }
        this.getSprite().draw();
        this.drawEquippedItem();
        //this.hitBox.draw();
    }

    drawHand(pos){
        var sprite = new spriteContainer(
            gfx.playerHand,
            new spriteBox(new vec2(), new vec2(5, 5))
        );
        sprite.bounds.setCenter(pos);
        sprite.isFlippedX = this.isFlipped;
        sprite.draw();
    }
    drawEquippedItem(){
        if(this.primaryEquipped){
            if(this.getPrimary()) this.getPrimary().drawOnPlayer(this);
            else this.primaryEquipped = false;
        }
        else if(this.getSecondary())
            this.getSecondary().drawOnPlayer(this);
        else this.primaryEquipped = true;
    }
}