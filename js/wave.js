///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class wave{
    constructor(dif = 0){
        this.difficluty = dif;
        this.enemiesLeft = 10 + dif * 4;
        this.enemyGroupSize = 2 + Math.floor(dif / 2);
        this.enemyGroupThreshold = 1 + dif;
        this.enemySpawnInterval = Math.max(15 - (dif * 0.5), 7.5);
        this.enemyDifficulty = dif;

        this.cardSpawnInterval = 7.5;
        this.cardSpawnThreshold = 2 + (dif / 4);

        this._nextEnemySpawn = 0;
        this._nextGroupSpawn = 0;
        this._nextCardSpawn = 0;
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
            var e = enemy.randomEnemy();
            e.spawn();
            this.enemiesLeft -= 1;
        }
        this._nextGroupSpawn = state.timeElapsed + 1000 * (this.enemySpawnInterval * 3);
    }
    spawnEnemy(){
        var e = enemy.randomEnemy();
        e.spawn();
        this.enemiesLeft -= 1;
        this._nextEnemySpawn = state.timeElapsed + 1000 *
            (this.enemySpawnInterval + Math.random() * 0.5 * this.enemySpawnInterval);
    }

    update(){
        this.handleSpawning();
        if(this.enemiesLeft <= 0 && state.enemies.length <= 0)
            this.nextWave();
    }
    handleSpawning(){
        this.handleCardSpawning();
        if(this.enemiesLeft > 0)
            this.handleEnemySpawning();
    }
    handleCardSpawning(){
        if(state.cardItems.length < this.cardSpawnThreshold)
            if(state.timeElapsed >= this._nextCardSpawn)
                this.spawnCard();
    }
    handleEnemySpawning(){

        if(state.timeElapsed >= this._nextEnemySpawn)
            this.spawnEnemy();

        if(state.enemies.length <= this.enemyGroupThreshold && state.timeElapsed >= this._nextGroupSpawn){
            if(Math.random() >= 0.6)
                this.spawnEnemyGroup();
            else this._nextGroupSpawn = state.timeElapsed + 1000 *
                (this.enemySpawnInterval + Math.random() * 0.5 * this.enemySpawnInterval);
        }
    }

    nextWave(){
        state.currentWave = new wave(this.difficluty + 1);
    }
}