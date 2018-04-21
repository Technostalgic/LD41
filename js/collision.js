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
    getCollision(other){ return null; }

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
    }
    getCollision_hPlane(other){
        if(other.mode){
            if(this.colBox.bottom < other.range) return null;
            return new collisionBox(
                new vec2(this.colBox.pos.x, other.range),
                new vec2(this.colBox.size.x, this.colBox.bottom - other.range)
            );
        }
        else{
            if(this.colBox.top > other.range) return null;
            return new collisionBox(
                this.colBox.pos.clone(),
                new vec2(this.colBox.size.x, other.range - this.colBox.top)
            );
        }
    }
    getCollision_vPlane(other){
        if(other.mode){
            if(this.colBox.right < other.range) return null;
            return new collisionBox(
                new vec2(other.range, this.colBox.pos.y),
                new vec2(this.colBox.right - other.range, this.colBox.size.y)
            );
        }
        else{
            if(this.colBox.left > other.range) return null;
            return new collisionBox(
                this.colBox.pos.clone(),
                new vec2(other.range - this.colBox.left, this.colBox.size.y)
            );
        }
    }
    getCollision_box(other){
        var maxLeft = Math.max(this.colBox.left, other.colBox.left);
        var minRight = Math.min(this.colBox.right, other.colBox.right);
        var maxTop = Math.max(this.colBox.top, other.colBox.top);
        var minBottom = Math.min(this.colBox.bottom, other.colBox.bottom);
        if(maxLeft > minRight || maxTop > minBottom) return null;
        return collisionBox.fromSides(maxLeft, maxTop, minRight, minBottom); 
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
        if(other instanceof collisionModule_box) return other.getCollision_hPlane(this);
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
        if(other instanceof collisionModule_box) return other.getCollision_vPlane(this);
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