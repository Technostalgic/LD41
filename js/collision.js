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

    draw(col = color.DarkGrey){}
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

     draw(col = color.DarkGrey()){
        col.setFill();
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
        renderContext.fill();
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

    draw(col = color.DarkGrey()){
        this.colBox.drawFill(renderContext, col.toRGBA());
    }
}