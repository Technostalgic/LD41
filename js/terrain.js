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
        if(coll) {
            if(coll.width <= 0 || coll.height<= 0) return;
            this.collideWith(obj, coll);
            obj.terrainCollide(this, coll);
        }
    }
    collideWith(obj, colbox){ }

    draw(){
        this.hitBox.draw();
    }
}

class terrain_solid extends terrainObject{
    constructor(colbox){
        super();
        this.hitBox = new collisionModule_box(colbox);
    }

    collideWith(obj, colbox){
        var nCol = colbox.center.minus(obj.vel.multiply(dt));
        var nIntersect = ray.fromPoints(nCol, colbox.center).getBoxCollision(this.hitBox.getBoundingBox());
        if(nIntersect){
            this.sideCollision(nIntersect.colSide, obj, colbox);
            return;
        }
        if(colbox.width == obj.hitBox.getBoundingBox().width){
            this.horizontalCollide(obj, colbox);
            return;
        }
        if(colbox.height == obj.hitBox.getBoundingBox().height){
            this.horizontalCollide(obj, colbox);
            return;   
        }

        if(colbox.width > colbox.height){
            this.horizontalCollide(obj, colbox);
            return;
        }
        this.verticalCollide(obj, colbox);
    }

    horizontalCollide(obj, colbox){
        if(colbox.center.y > this.hitBox.colBox.center.y)
            this.bottomCollision(obj, colbox);
        else this.topCollision(obj, colbox);
    }
    verticalCollide(obj, colbox){
        if(colbox.center.x > this.hitBox.colBox.center.x)
            this.leftCollision(obj, colbox);
        else this.rightCollision(obj, colbox);
    }
    sideCollision(sideNum, obj, colbox){
        switch(sideNum){
            case side.left: this.leftCollision(obj, colbox); break;
            case side.right: this.rightCollision(obj, colbox); break;
            case side.up: this.topCollision(obj, colbox); break;
            case side.down: this.bottomCollision(obj, colbox); break;
        }
    }
    leftCollision(obj, colbox){
        obj.pos.x -= colbox.width;
        obj.vel.x = Math.min(0, obj.vel.x);
        obj.updateHitBox();
    }
    rightCollision(obj, colbox){
        obj.pos.x += colbox.width;
        obj.vel.x = Math.max(0, obj.vel.x);
        obj.updateHitBox();
    }
    topCollision(obj, colbox){
        obj.onGround = true;
        obj.pos.y -= colbox.height;
        obj.vel.y = Math.min(0, obj.vel.y);
        obj.updateHitBox();
    }
    bottomCollision(obj, colbox){
        obj.pos.y += colbox.height;
        obj.vel.y = Math.max(0, obj.vel.y);
        obj.updateHitBox();
    }

    draw(){
        this.hitBox.getBoundingBox().drawFill(renderContext, color.Black().toRGBA());
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

        renderContext.fillRect(0, 0, renderCanvas.width, this.hitBox.range);
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

function getTerrainScreenBounds(ceiling = true){
    var r = [];

    r.push(new terrain_bottomBoundary(renderCanvas.height));
    r.push(new terrain_rightBoundary(renderCanvas.width));
    r.push(new terrain_leftBoundary(0));

    var b = new collisionBox(
        new vec2(),
        new vec2(70, 20)
    );
    b.setCenter(new vec2(210, 275));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(30, 40)
    );
    b.setCenter(new vec2(220, 200));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(50, 10)
    );
    b.setCenter(new vec2(180, 185));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(150, 30)
    );
    b.setCenter(new vec2(75, 340));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(100, 20)
    );
    b.setCenter(new vec2(50, 250));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(100, 30)
    );
    b.setCenter(new vec2(350, 340));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(100, 20)
    );
    b.setCenter(new vec2(320, 210));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(10, 20)
    );
    b.setCenter(new vec2(320, 200));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(10, 20)
    );
    b.setCenter(new vec2(275, 190));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(30, 20)
    );
    b.setCenter(new vec2(390, 250));
    r.push(new terrain_solid(b));

    if(ceiling)
        r.push(new terrain_topBoundary(125));

    return r;
}