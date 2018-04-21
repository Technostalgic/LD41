///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class terrainObject{
    constructor(){
        this.hitBox = new collisionModule();
    }

    checkCollision(obj){
        var coll = this.hitBox.getCollision(obj.hitBox);
        if(coll) this.collideWith(obj, coll);
    }
    collideWith(obj, colbox){ }

    draw(){
        this.hitBox.draw();
    }
}

class terrain_bottomBoundary extends terrainObject{
    constructor(ypos){
        super();
        this.hitBox = new collisionModule_horizontalPlane(ypos, 1);
    }

    collideWith(obj, colbox){
        obj.onGround = true;
        obj.pos.y -= colbox.height;
        obj.vel.y = Math.min(0, obj.vel.y);
        obj.updateHitBox();
    }

    draw(){
        var col = color.Black();
        col.setFill();

        renderContext.fillRect(0, this.hitBox.range, renderCanvas.width, renderCanvas.height - this.hitBox.range);
    }
}
class terrain_topBoundary extends terrainObject{
    constructor(ypos){
        super();
        this.hitBox = new collisionModule_horizontalPlane(ypos, 0);
    }
    
    collideWith(obj, colbox){
        obj.pos.y += colbox.height;
        obj.vel.y = Math.max(0, obj.vel.y);
        obj.updateHitBox();
    }

    draw(){
        var col = color.Black();
        col.setFill();

        renderContext.fillRect(0, 0, renderCanvas.width, this.hitBox.range - renderCanvas.height);
    }
}
class terrain_rightBoundary extends terrainObject{
    constructor(xpos){
        super();
        this.hitBox = new collisionModule_verticalPlane(xpos, 1);
    }
    
    collideWith(obj, colbox){
        obj.pos.x -= colbox.width;
        obj.vel.x = Math.min(0, obj.vel.x);
        obj.updateHitBox();
    }

    draw(){
        var col = color.Black();
        col.setFill();

        renderContext.fillRect(this.hitBox.range, 0, renderCanvas.width - this.hitBox.range, renderCanvas.height);
    }
}
class terrain_leftBoundary extends terrainObject{
    constructor(xpos){
        super();
        this.hitBox = new collisionModule_verticalPlane(xpos, 0);
    }
    
    collideWith(obj, colbox){
        obj.pos.x += colbox.width;
        obj.vel.x = Math.max(0, obj.vel.x);
        obj.updateHitBox();
    }

    draw(){
        var col = color.Black();
        col.setFill();

        renderContext.fillRect(0, 0, this.hitBox.range, renderCanvas.height);
    }
}

function getTerrainScreenBounds(ceiling = false){
    var r = [];

    r.push(new terrain_bottomBoundary(renderCanvas.height));
    r.push(new terrain_rightBoundary(renderCanvas.width));
    r.push(new terrain_leftBoundary(0));

    if(ceiling)
        r.push(new terrain_topBoundary(0));

    return r;
}