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

    static handlePlatformCollision(hitbox, obj, colbox){
        if(obj.fallThroughPlatforms) return;

        var nCol = colbox.center.minus(obj.getVDisplacement());
        var nIntersect = hitbox.getRayCollision(ray.fromPoints(nCol, colbox.center));
        if(nIntersect){
            if(nIntersect.colSide != side.up)
                return;
            terrainObject.handleSolidCollision_topSide(obj, colbox);
            return;
        }
    }
    static handleSolidCollision(hitbox, obj, colbox){
        var nCol = colbox.center.minus(obj.getVDisplacement());
        var nIntersect = hitbox.getRayCollision(ray.fromPoints(nCol, colbox.center));
        if(nIntersect){
            terrainObject.handleSolidSideCollision(nIntersect.colSide, obj, colbox);
            return;
        }
        
        if((
            colbox.width == obj.hitBox.getBoundingBox().width ||
            colbox.height == obj.hitBox.getBoundingBox().height || 
            colbox.width > colbox.height
            )){
            if(colbox.center.y > hitbox.colBox.center.y)
                terrainObject.handleSolidCollision_bottomSide(obj, colbox);
            else terrainObject.handleSolidCollision_topSide(obj, colbox);
            return;
        }

        if(colbox.center.x > hitbox.colBox.center.x)
            terrainObject.handleSolidCollision_leftSide(obj, colbox);
        else terrainObject.handleSolidCollision_rightSide(obj, colbox);
    }
    
	static handleSolidSideCollision(colside, collidingObj, colbox){
        switch(colside){
            case side.left: terrainObject.handleSolidCollision_leftSide(collidingObj, colbox); break;
            case side.right: terrainObject.handleSolidCollision_rightSide(collidingObj, colbox); break;
            case side.up: terrainObject.handleSolidCollision_topSide(collidingObj, colbox); break;
            case side.down: terrainObject.handleSolidCollision_bottomSide(collidingObj, colbox); break;
        }
    }
    static handleSolidCollision_leftSide(obj, colbox){
        if(colbox.height < 1) return;
        obj.pos.x -= colbox.width;
        obj.vel.x = Math.min(0, obj.vel.x);
        obj.updateHitBox();
    }
    static handleSolidCollision_rightSide(obj, colbox){
        if(colbox.height < 1) return;
        obj.pos.x += colbox.width;
        obj.vel.x = Math.max(0, obj.vel.x);
        obj.updateHitBox();
    }
    static handleSolidCollision_topSide(obj, colbox){
        obj.onGround = true;
        obj.pos.y -= colbox.height;
        if(obj.vel.y >= 150)
            playSound(sfx.bump);
        obj.vel.y = Math.min(0, obj.vel.y);
        obj.updateHitBox();
    }
    static handleSolidCollision_bottomSide(obj, colbox){
        obj.pos.y += colbox.height;
        obj.vel.y = Math.max(0, obj.vel.y);
        obj.updateHitBox();
    }
    
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
        terrainObject.handleSolidCollision(this.hitBox, obj, colbox)
    }

    draw(){
        this.hitBox.getBoundingBox().drawFill(renderContext, color.Black().toRGBA());
    }
}
class terrain_platform extends terrainObject{
    constructor(colbox){
        super();
        this.hitBox = new collisionModule_box(colbox);
    }
	
    collideWith(obj, colbox){
        terrainObject.handlePlatformCollision(this.hitBox, obj, colbox)
    }
	
	draw(){
		var box = this.hitBox.getBoundingBox();
		box.size.y = 5;
		box.drawFill(renderContext, color.LightGrey().toRGBA());
		box.size.y = 4;
		box.drawFill(renderContext, color.Black().toRGBA());
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
        if(obj.vel.y >= 150)
            playSound(sfx.bump);
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

    if(ceiling)
        r.push(new terrain_topBoundary(125));

    return r;
}
function getRandomTerrainLayout(){
	//return getTerrainLayout4();
	var m = [
		getTerrainLayout1,
		getTerrainLayout2,
		getTerrainLayout3,
		getTerrainLayout4
	];
	
	return m[Math.floor(Math.random() * m.length)]();
}

function getTerrainLayout1(){
    var r = getTerrainScreenBounds();

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
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(),
        new vec2(100, 30)
    );
    b.setCenter(new vec2(50, 340));
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(),
        new vec2(50, 30)
    );
    b.setCenter(new vec2(125, 340));
    r.push(new terrain_platform(b));
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
        new vec2(50, 20)
    );
    b.setCenter(new vec2(380, 270));
    r.push(new terrain_platform(b));

    return r;
}
function getTerrainLayout2(){
	var r = getTerrainScreenBounds();
	
    var b = new collisionBox(
        new vec2(),
        new vec2(80, 20)
    );
    b.setCenter(new vec2(200, 340));
    r.push(new terrain_solid(b));
	
	b = new collisionBox(
        new vec2(0, 270),
        new vec2(80, 20)
    );
    r.push(new terrain_solid(b));
	b = new collisionBox(
        new vec2(320, 270),
        new vec2(80, 20)
    );
    r.push(new terrain_solid(b));
	b = new collisionBox(
        new vec2(80, 270),
        new vec2(240, 20)
    );
    r.push(new terrain_platform(b));
	
	b = new collisionBox(
        new vec2(),
        new vec2(20, 50)
    );
    b.setCenter(new vec2(200, 245));
    r.push(new terrain_solid(b));
	b = new collisionBox(
        new vec2(150, 220),
        new vec2(40, 20)
    );
    r.push(new terrain_platform(b));
	b = new collisionBox(
        new vec2(210, 220),
        new vec2(40, 20)
    );
    r.push(new terrain_platform(b));
	
	b = new collisionBox(
        new vec2(),
        new vec2(60, 20)
    );
    b.setCenter(new vec2(200, 180));
    r.push(new terrain_solid(b));
	
	return r;
}
function getTerrainLayout3(){
	var r = getTerrainScreenBounds();
	
    var b = new collisionBox(
        new vec2(140, 200),
        new vec2(10, 100)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(250, 200),
        new vec2(10, 100)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(150, 280),
        new vec2(100, 20)
    );
    r.push(new terrain_solid(b));

    b = new collisionBox(
        new vec2(150, 200),
        new vec2(100, 10)
    );
    r.push(new terrain_platform(b));
    
    b = new collisionBox(
        new vec2(120, 295),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(260, 295),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(120, 200),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(260, 200),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
	
    b = new collisionBox(
        new vec2(150, 240),
        new vec2(10, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(240, 240),
        new vec2(10, 10)
    );
    r.push(new terrain_platform(b));
	
	b = new collisionBox(
        new vec2(0, 210),
        new vec2(20, 15)
    );
    r.push(new terrain_platform(b));
	b = new collisionBox(
        new vec2(380, 210),
        new vec2(20, 15)
    );
    r.push(new terrain_platform(b));
	b = new collisionBox(
        new vec2(0, 175),
        new vec2(60, 15)
    );
    r.push(new terrain_platform(b));
	b = new collisionBox(
        new vec2(340, 175),
        new vec2(60, 15)
    );
    r.push(new terrain_platform(b));
	
	b = new collisionBox(
        new vec2(0, 250),
        new vec2(60, 15)
    );
    r.push(new terrain_solid(b));
	b = new collisionBox(
        new vec2(340, 250),
        new vec2(60, 15)
    );
    r.push(new terrain_solid(b));
	
	return r;
}
function getTerrainLayout4(){
    var r = getTerrainScreenBounds();
    
    var b = new collisionBox(
        new vec2(230, 335),
        new vec2(50, 30)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(200, 320),
        new vec2(50, 30)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(170, 305),
        new vec2(50, 45)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(140, 290),
        new vec2(50, 15)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(110, 275),
        new vec2(50, 15)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(80, 260),
        new vec2(50, 15)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(50, 245),
        new vec2(50, 15)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(20, 230),
        new vec2(50, 15)
    );
    r.push(new terrain_solid(b));

    b = new collisionBox(
        new vec2(0, 230),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(0, 260),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(0, 290),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(0, 320),
        new vec2(20, 10)
    );
    r.push(new terrain_platform(b));

    b = new collisionBox(
        new vec2(130, 230),
        new vec2(170, 10)
    );
    r.push(new terrain_platform(b));
    b = new collisionBox(
        new vec2(300, 230),
        new vec2(100, 20)
    );
    r.push(new terrain_solid(b));
    b = new collisionBox(
        new vec2(285, 120),
        new vec2(15, 70)
    );
    r.push(new terrain_solid(b));

    return r;
}
