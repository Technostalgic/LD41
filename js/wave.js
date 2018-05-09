///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class wave{
    constructor(dif = 1){
        this.timeElapsed = 0;
        this.finalEnemyKilled = null;
		
        this.difficulty = dif;
        this.enemiesLeft = 6 + dif * 2;
		this.enemyThreshold = 2 + (dif) / 2;
        this.enemyGroupSize = 1 + Math.floor(dif / 2);
        this.enemyGroupThreshold = 1 + dif;
        this.enemySpawnInterval = Math.max(7.5 - (dif / 2), 3.5);
        this.enemyDifficulty = dif;
		this.spawnPool = wave.getSpawnPool(dif);

        this.cardSpawnInterval = 6.5;
        this.cardSpawnThreshold = 2 + (dif / 4);

        this._nextEnemySpawn = 0;
        this._nextGroupSpawn = 0;
        this._nextCardSpawn = 0;
    }
	
	static wavePoints(waveNum){
		return (waveNum) * 250;
	}
	static getSpawnPool(difficulty){
		switch(difficulty){
			case 1:
				return [
				[enemy_slime, 1],
				[enemy_slime, 1],
				];
			case 2:
				return [
				[enemy_slime, 1],
				[enemy_slime, 2],
				[enemy_zombie, 1],
				[enemy_zombie, 1]
				];
			case 3:
				return [
				[enemy_slime, 1],
				[enemy_slime, 2],
				[enemy_slime, 2],
				[enemy_zombie, 1],
				[enemy_zombie, 1],
				[enemy_zombie, 1]
				];
			case 4:
				return [
				[enemy_slime, 1],
				[enemy_slime, 2],
				[enemy_zombie, 1],
				[enemy_zombie, 1],
				[enemy_zombie, 2],
				];
			case 5:
				return [
				[enemy_slime, 2],
				[enemy_slime, 3],
				[enemy_zombie, 2],
				[enemy_zombie, 2],
				];
			case 6:
				return [
				[enemy_slime, 1],
				[enemy_slime, 2],
				[enemy_slime, 2],
				[enemy_zombie, 1],
				[enemy_zombie, 1],
				[enemy_zombie, 2],
				[enemy_eyeball, 1],
				[enemy_eyeball, 1]
				];
				
			// special level
			case 10:
				return [
				[enemy_slime, 3],
				[enemy_zombie, 2],
				[enemy_eyeball, 2]
				];
		}
		if(difficulty < 10)
			return [
				[enemy_slime, 1],
				[enemy_slime, 2],
				[enemy_slime, 3],
				[enemy_zombie, 1],
				[enemy_zombie, 1],
				[enemy_zombie, 2],
				[enemy_eyeball, 1],
				[enemy_eyeball, 1],
				[enemy_eyeball, 2]
			];
			
		return [
			[enemy_slime, 2],
			[enemy_slime, 3],
			[enemy_zombie, 1],
			[enemy_zombie, 2],
			[enemy_zombie, 2],
			[enemy_eyeball, 1],
			[enemy_eyeball, 2],
			[enemy_eyeball, null]
		];
	}
	
    spawnCard(){
        var c = new cardCollectable();
        c.spawn();

        this._nextCardSpawn = state.timeElapsed + 1000 * 
            (this.cardSpawnInterval + Math.random() * this.cardSpawnInterval * 0.25);
    }
    spawnEnemyGroup(){
        var count = this.enemyGroupSize + (Math.random() * 0.25 * this.enemyGroupSize);
        for(let i = count; i > 0; i--){
            var e = this.chooseRandomEnemy();
            e.spawn();
            this.enemiesLeft -= 1;
        }
        this._nextGroupSpawn = this.timeElapsed + 1 * (this.enemySpawnInterval * 2.5);
    }
    spawnEnemy(){
        var e = this.chooseRandomEnemy();
        e.spawn();
        this.enemiesLeft -= 1;
        this._nextEnemySpawn = this.timeElapsed + 1 *
            (this.enemySpawnInterval + Math.random() * 0.5 * this.enemySpawnInterval);
    }

	chooseRandomEnemy(){
		//return new enemy_zombie(1);
		
		var poolInd = Math.floor(Math.random() * this.spawnPool.length);
		return new this.spawnPool[poolInd][0](this.spawnPool[poolInd][1])
	}
	
    update(){
		this.timeElapsed += dt;
		
        this.handleSpawning();
        if(this.enemiesLeft <= 0 && state.enemies.length <= 0)
            if(!this.finalEnemyKilled){
                this.finalEnemyKilled = this.timeElapsed;
            }
            else if(this.timeElapsed >= 5.5 + this.finalEnemyKilled)
                this.nextWave();
    }
    handleSpawning(){
        this.handleCardSpawning();
        if(this.enemiesLeft > 0)
            this.handleEnemySpawning();
    }
    handleCardSpawning(){
        if(this.enemiesLeft <= 0 && state.enemies.length <= 0) return;
        if(state.cardItems.length < this.cardSpawnThreshold)
            if(state.timeElapsed >= this._nextCardSpawn)
                this.spawnCard();
    }
    handleEnemySpawning(){
		if(this.timeElapsed < 3.5) return;
		if(state.enemies.length < this.enemyThreshold)
			if(this.timeElapsed >= this._nextEnemySpawn)
				this.spawnEnemy();

        if(state.enemies.length <= this.enemyGroupThreshold && this.timeElapsed >= this._nextGroupSpawn){
            if(Math.random() >= 0.6)
                this.spawnEnemyGroup();
            else this._nextGroupSpawn = this.timeElapsed + 1000 *
                (this.enemySpawnInterval + Math.random() * 0.5 * this.enemySpawnInterval);
        }
    }
	
	drawStartingText(){
		var tpos = new vec2(200);
		drawText("Wave " + this.difficulty, tpos, 36);
    }	
    drawEndingText(){
        clearScreen(color.fromHex("#000"));

        var tpos = new vec2(200);
        var col = color.fromHex("#060");
        if(this.timeElapsed % 0.35 > 0.175) 
            col = color.fromHex("#0F0");
		drawText("Completed Wave " + this.difficulty, tpos, 36, col, color.fromHex("#020"));
		
		var pts = wave.wavePoints(this.difficulty);
		if(pts > 0)
		drawText("+" + pts + " pts", tpos.plus(new vec2(0, 20)), 24, color.fromHex("#FF0"), color.fromHex("#330"));
	}
	
    nextWave(){
		state.addScore(wave.wavePoints(this.difficulty));
        state.currentWave = new wave(this.difficulty + 1);
        state.goToNewTerrainLayout();
		clearGore();
    }
}