///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

class collisionModule{
    constructor(){ 
    }

    static circleCollider(radius){
        var r = new collisionModule_circle(radius);
        
        return r;
    }
    static boxCollider(size = new vec2(10)){
        var r = new collisionModule_box(new collisionBox(new vec2(), size));

        return r;
    }

    centerAtPoint(point){ }
    getBoundingBox(){
        return new collisionBox();
    }
    getCollision(other){
        if(other instanceof collisionModule_horizontalPlane) return this.getCollision_hPlane(other);
        if(other instanceof collisionModule_verticalPlane) return this.getCollision_vPlane(other);
        return this.getBoundingBox().getIntersect(other.getBoundingBox());
    }

    getCollision_hPlane(other){
        var colbox = this.getBoundingBox();
        if(other.mode){
            if(colbox.bottom < other.range) return null;
            return new collisionBox(
                new vec2(colbox.pos.x, other.range),
                new vec2(colbox.size.x, colbox.bottom - other.range)
            );
        }
        else{
            if(colbox.top > other.range) return null;
            return new collisionBox(
                colbox.pos.clone(),
                new vec2(colbox.size.x, other.range - colbox.top)
            );
        }
    }
    getCollision_vPlane(other){
        var colbox = this.getBoundingBox();
        if(other.mode){
            if(colbox.right < other.range) return null;
            return new collisionBox(
                new vec2(other.range, colbox.pos.y),
                new vec2(colbox.right - other.range, colbox.size.y)
            );
        }
        else{
            if(colbox.left > other.range) return null;
            return new collisionBox(
                colbox.pos.clone(),
                new vec2(other.range - colbox.left, colbox.size.y)
            );
        }
    }

    draw(col = color.Blue){}
}

class collisionModule_circle extends collisionModule{
    constructor(radius = 10){ 
        super();
        this.radius = radius;
        this.origin = new vec2();
    }
    
    centerAtPoint(point){
        this.origin = point;
    }
    getBoundingBox(){
        var r = new collisionBox(new vec2(), new vec2(this.radius * 2))
        r.setCenter(this.origin);

        return r;
    }

    draw(col = color.Blue()){
        var verts = 16;
        var angIncrement = (Math.PI * 2) / verts;
        
        renderContext.beginPath();
        var tpos = vec2.fromAng(0, this.radius).plus(this.origin);
        renderContext.moveTo(tpos.x, tpos.y);
        for(let i = 1; i < verts; i++){
            tpos = vec2.fromAng(i * angIncrement, this.radius).plus(this.origin);
            renderContext.lineTo(tpos.x, tpos.y);
        }
       
        renderContext.closePath();
        renderContext.lineWidth = 1;
        col.setStroke();
        renderContext.stroke();
    }
}
class collisionModule_box extends collisionModule{
    constructor(colBox = new collisionBox(new vec2(), new vec2(10))){
        super();
        this.colBox = colBox;
    }

    centerAtPoint(point){
        this.colBox.setCenter(point);
    }
    getBoundingBox(){
        return this.colBox.clone();
    }

    getCollision(other){
        if(other instanceof collisionModule_box) return this.getCollision_box(other);
        if(other instanceof collisionModule_horizontalPlane) return this.getCollision_hPlane(other);
        if(other instanceof collisionModule_verticalPlane) return this.getCollision_vPlane(other);
        return super.getCollision(other);
    }
    getCollision_box(other){
        return this.colBox.getIntersect(other.colBox);
    }

    draw(col = color.Blue()){
        this.colBox.drawOutline(renderContext, col.toRGBA(), 1);
    }
}

class collisionModule_horizontalPlane{
    constructor(range, mode = 1){
        this.range = range;
        this.mode = mode;
    }

    centerAtPoint(point){
        this.range = point.y;
    }
    getBoundingBox(){
        var r = new collisionBox();

        r.size.x = renderCanvas.width;

        if(this.mode) {
            r.pos.y = this.range;
            r.size.y = renderCanvas.height - this.range;
        }
        else r.size.y = this.range;

        return r;
    }

    getCollision(other){
        return other.getCollision_hPlane(this);
    }
    
    draw(col = color.Blue()){
        var sy = this.range;
        var sx0 = 0;
        var sx1 = renderCanvas.width;

        renderContext.beginPath();
        renderContext.moveTo(sx0, sy);
        renderContext.lineTo(sx1, sy);

        col.setStroke();
        renderContext.lineWidth = 1;
        renderContext.stroke();
    }
}
class collisionModule_verticalPlane{
    constructor(range, mode = 1){
        this.range = range;
        this.mode = mode;
    }

    centerAtPoint(point){
        this.range = point.x;
    }
    getBoundingBox(){
        var r = new collisionBox();

        r.size.y = renderCanvas.height;

        if(this.mode){
            r.pos.x = this.range;
            r.size.x = renderCanvas.width - this.range;
        }
        else r.size.x = this.range;

        return r;
    }
    
    getCollision(other){
        return other.getCollision_vPlane(this);
    }
    
    draw(col = color.Blue()){
        var sx = this.range;
        var sy0 = 0;
        var sy1 = renderCanvas.height;

        renderContext.beginPath();
        renderContext.moveTo(sx, sy0);
        renderContext.lineTo(sx, sy1);

        col.setStroke();
        renderContext.lineWidth = 1;
        renderContext.stroke();
    }
}