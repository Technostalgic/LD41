///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

// enumerates between the 4 sides of a rectangle
var side = {
	none: 0,
	left: 1,
	right: 2,
	up: 3,
	down: 4
}
function invertedSide(dir){
	// gets the oppisite of the specified side
	switch(dir){
		case side.left: return side.right;
		case side.right: return side.left;
		case side.up: return side.down;
		case side.down: return side.up;
	}
	return side.none;
}

class vec2{
	constructor(x = 0, y = x){
		this.x = x;
		this.y = y;
	}
	
	normalized(magnitude = 1){
		//returns a vector 2 with the same direction as this but
		//with a specified magnitude
		return this.multiply(magnitude / this.distance());
	}
	inverted(){
		//returns the opposite of this vector
		return this.multiply(-1);
	}
	multiply(factor){
		//returns this multiplied by a specified factor		
		return new vec2(this.x * factor, this.y * factor);
	}
	plus(vec){
		//returns the result of this added to another specified vector2
		return new vec2(this.x + vec.x, this.y + vec.y);
	}
	minus(vec){
		//returns the result of this subtracted to another specified vector2
		return this.plus(vec.inverted());
	}
	rotate(rot){
		//rotates the vector by the specified angle
		var ang = this.direction();
		var mag = this.distance();
		ang += rot;
		return vec2.fromAng(ang, mag)
	}
	equals(vec, leniency = 0.0001){
		//returns true if the difference between rectangular distance of the two vectors is less than the specified leniency
		return (
			Math.abs(this.x - vec.x) <= leniency) && (
			Math.abs(this.y - vec.y) <= leniency);
	}
	round(){
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
	}
	
	direction(){
		//returns the angle this vector is pointing in radians
		return Math.atan2(this.y, this.x);
	}
	distance(vec = null){
		//returns the distance between this and a specified vector2
		if(vec === null)
			vec = new vec2();
		var d = Math.sqrt(
			Math.pow(this.x - vec.x, 2) + 
			Math.pow(this.y - vec.y, 2));
		return d;
	}
	getSprite(xColumn = 0, yRow = 0, altwidth = null){
		// returns a spritebox using this as the sprite's frame size
		
		return spriteBox.charSprite(this.clone(), xColumn, yRow, altwidth);
	}
	
	clone(){
		return new vec2(this.x, this.y);
	}
	static fromAng(angle, magnitude = 1){
		//returns a vector which points in the specified angle
		//and has the specified magnitude
		return new vec2(
			Math.cos(angle) * magnitude, 
			Math.sin(angle) * magnitude);
	}
	static fromSide(dir){
		switch(dir){
			case side.none: return new vec2(0, 0);
			case side.left: return new vec2(-1, 0);
			case side.right: return new vec2(1, 0);
			case side.up: return new vec2(0, -1); 
			case side.down: return new vec2(0, 1);
		}
		return new vec2();
	}
	static getBounds(vec2arrray){
		// returns a collisionBox that surrounds all the vectors in vec2arrray
		var minX, minY,
		    maxX, maxY;
		
		vec2arrray.forEach(function(vec, i){
			if(i == 0){
				minX = vec.x;
				minY = vec.y;
				maxX = vec.x;
				maxY = vec.y;
				return; // acts as "continue" keyword in anon callback in a forEach loop
			}
			
			if(vec.x < minX) minX = vec.x;
			if(vec.y < minY) minY = vec.y;
			if(vec.x > maxX) maxX = vec.x;
			if(vec.y > maxY) maxY = vec.y;
		});
		
		return collisionBox.fromSides(minX, minY, maxX, maxY);
	}
	
	toString(){
		return "vector<" + this.x + ", " + this.y + ">";
	}
}

class spriteBox{
	constructor(pos = new vec2(), size = new vec2()){
		this.pos = pos;
		this.size = size;
	}
	
	static charSprite(charSize, xColumn = 0, yRow = 0, altwidth = null){
		altwidth = !!altwidth ? altwidth : charSize.x;
		return new spriteBox(new vec2(charSize.x * xColumn, charSize.y * yRow), new vec2(altwidth, charSize.y));
	}
	
	get left(){ return Math.round(this.pos.x); }
	get right() { return Math.round(this.pos.x + this.size.x); }
	get top(){ return Math.round(this.pos.y); }
	get bottom() { return Math.round(this.pos.y + this.size.y); }
	get width() { return Math.round(this.size.x); }
	get height() { return Math.round(this.size.y); }
	
	clone(){
		return new spriteBox(this.pos.clone(), this.size.clone());
	}
}

class color{
	constructor(){
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.a = 0;
	}
	
	static fromRGBA(r = 0, g = 0, b = 0, a = 1){
		var col = new color();
		
		col.r = r;
		col.g = g;
		col.b = b;
		col.a = a;
		
		return col;
	}
	static fromHex(hex = "#000", alpha = 1){
		var sslength = hex.length == 4 ? 1 : 2;
		var r = parseInt(hex.substr(1 + 0 * sslength, sslength), 16);
		var g = parseInt(hex.substr(1 + 1 * sslength, sslength), 16);
		var b = parseInt(hex.substr(1 + 2 * sslength, sslength), 16);
		
		if(sslength == 1){
			r = r * 17;
			g = g * 17;
			b = b * 17;
		}
		
		return color.fromRGBA(r, g, b, alpha);
	}
	
	static White(){
		return color.fromHex("#FFF");
	}
	static LightGrey(){
		return color.fromHex("#CCC");
	}
	static Grey(){
		return color.fromHex("#888");
	}
	static DarkGrey(){
		return color.fromHex("#333");
	}
	static Black(){
		return color.fromHex("#000");
	}
	static Blue(){
		return color.fromHex("#00F");
	}
	static Transparent(){
		return color.fromHex("#000", 0);
	}
	
	toRGB(){
		return (
			"rgb(" + 
			Math.floor(this.r).toString() + "," + 
			Math.floor(this.g).toString() + "," + 
			Math.floor(this.b).toString() + ")" );
	}
	toRGBA(){
		return (
			"rgb(" + 
			Math.floor(this.r).toString() + "," + 
			Math.floor(this.g).toString() + "," + 
			Math.floor(this.b).toString() + "," +
			this.a.toString() + ")" );
	}
	toHex(){
		var r = Math.floor(this.r).toString(16);
		var g = Math.floor(this.g).toString(16);
		var b = Math.floor(this.b).toString(16);
		
		return "#" + r + g + b;
	}
	
	setFill(ctx = renderContext){
		ctx.fillStyle = this.toRGBA();
	}
	setStroke(ctx = renderContext){
		ctx.strokeStyle = this.toRGBA();
	}
}

class collisionBox{
	constructor(pos = new vec2(), size = new vec2()){
		this.pos = pos;
		this.size = size;
	}
	static fromSides(left, top, right, bottom){
		return new collisionBox(new vec2(left, top), new vec2(right - left, bottom - top));
	}
	
	get left(){ return (this.pos.x); }
	get right() { return (this.pos.x + this.size.x); }
	get top(){ return (this.pos.y); }
	get bottom() { return (this.pos.y + this.size.y); }
	get width() { return (this.size.x); }
	get height() { return (this.size.y); }
	
	get center() { return this.pos.plus(this.size.multiply(0.5)); }
	get topLeft() { return this.pos.clone(); }
	get topRight() { return this.pos.plus(new vec2(this.size.x, 0)); }
	get bottomLeft() { return this.pos.plus(new vec2(0, this.size.y)); }
	get bottomRight() { return this.pos.plus(this.size); }
	
	setCenter(newCenter){
		this.pos = new vec2(newCenter.x - this.size.x / 2, newCenter.y - this.size.y / 2);
		return this;
	}
	inflated(factor){
		var r = this.clone();

		r.size = r.size.multiply(factor);
		r.setCenter(this.center);
		
		return r;
	}
	
	getIntersect(otherbox){
        var maxLeft = Math.max(this.left, otherbox.left);
        var minRight = Math.min(this.right, otherbox.right);
        var maxTop = Math.max(this.top, otherbox.top);
        var minBottom = Math.min(this.bottom, otherbox.bottom);
        if(maxLeft > minRight || maxTop > minBottom) return null;
        return collisionBox.fromSides(maxLeft, maxTop, minRight, minBottom); 
	}
	overlapsPoint(point){
		return ( 
			point.x >= this.left &&
			point.x <= this.right && 
			point.y >= this.top && 
			point.y <= this.bottom );
	}
	
	clone(){
		return new collisionBox(this.pos.clone(), this.size.clone());
	}
	
	drawFill(ctx, color = "#aaa"){
		ctx.fillStyle = color;
		ctx.fillRect(this.left, this.top, this.width, this.height);
	}
	drawOutline(ctx, color = "#000", lineWidth = 1){
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.strokeRect(this.left, this.top, this.width, this.height);
	}
}

class spriteContainer{
	constructor(spriteSheet, sprite = null, bounds = null){
		this.spriteSheet = spriteSheet;
		this.sprite = sprite;
		if(sprite == null)
			this.sprite = new spriteBox(new vec2(), new vec2(spriteSheet.width, spriteSheet.height));
		this.bounds = bounds;
		if(bounds == null)
			this.bounds = new collisionBox(new vec2(), this.sprite.size);
		
		this.rotation = null;
		this.isFlippedX = false;
		this.isFlippedY = false;
	}
	
	clone(){
		var r = new spriteContainer();
		
		r.spriteSheet = this.spriteSheet;
		r.sprite = this.sprite.clone();
		r.bounds = this.bounds.clone();
		
		return r;
	}
	
	draw(ctx = renderContext){
		if(this.sprite.size.x <= 0 || this.sprite.size.y <= 0) return;
		this.bounds.pos.round();
		if(this.rotation || this.isFlippedX || this.isFlippedY){
			this.drawTransformed(ctx);
			return;
		}
		ctx.drawImage(
			this.spriteSheet,
			this.sprite.left, this.sprite.top,
			this.sprite.width, this.sprite.height,
			this.bounds.left, this.bounds.top,
			this.bounds.width, this.bounds.height
			);
	}
	drawTransformed(ctx = renderContext){
		if(this.sprite.size.x <= 0 || this.sprite.size.y <= 0) return;
		var cCorrect = this.bounds.size.multiply(-0.5);
		var tTot = this.bounds.pos.minus(cCorrect);
		
		ctx.translate(tTot.x, tTot.y);
		if(this.rotation) ctx.rotate(this.rotation);
		ctx.scale(this.isFlippedX ? -1 : 1, this.isFlippedY ? -1 : 1)
		
		ctx.drawImage(
			this.spriteSheet,
			this.sprite.left, this.sprite.top,
			this.sprite.width, this.sprite.height,
			cCorrect.x, cCorrect.y,
			this.bounds.width, this.bounds.height
			);
		
		ctx.scale(this.isFlippedX ? -1 : 1, this.isFlippedY ? -1 : 1)
		if(this.rotation) ctx.rotate(-this.rotation);
		ctx.translate(-tTot.x, -tTot.y);
	}
}

class ray{
	constructor(pos = new vec2(), angle = 0, length = Infinity){
		this.length = length;
		this._origin = pos;
		this._m = 0;
		this._b = 0;
		this._isVertical = false;
		this._angle = 0;
		
		this.setAngle(angle);
		// would normally need to call this.recalculate but since it is
		// already called inside of this.setAngle, it would be redundant
	}
	
	getPosition(){
		return this._origin;
	}
	setPosition(pos){
		this._origin = pos;
		this.recalculate();
	}
	getEndPosition(){
		var mag = this.length;
		if(mag == Infinity)
			mag = 999999;
		return this._origin.plus(vec2.fromAng(this._angle).multiply(mag));
	}
	setEndPosition(pos){
		var mag = this._origin.distance(pos);
		var dir = pos.minus(this._origin).direction();
		this.length = mag;
		this._angle = dir;
		this.recalculate();
	}
	getAngle(){
		return this._angle;
	}
	setAngle(angle){
		//sets the angle that the ray points in
		//ensures that any given angle is wrapped between (-pi, pi]
		if(Math.abs(angle) > Math.PI)
			angle = angle % Math.PI * -1;
		if(angle == -Math.PI)
			angle = Math.PI;
		
		this._angle = angle;
		this.recalculate();
	}
	getSlope(){
		if(this._isVertical)
			return this._m * Infinity;
		return this._m;
	}
	getOffsetY(){
		if(this.isVertical)
		return this._m * -1 * Infinity;
		return this._b;
	}
	getY(x, limit = null){
		//returns the y value that lies on the ray, given x
		if(this._isVertical){
			return limit;
		}
		//the ray is stored as a simple formula in slope intercept form: 
		//y = m * x + b
		return this._m * x + this._b;
	}
	getX(y){
		//returns the x value on the ray, given y
		if(this._m === 0)
			return this._origin.y;
		//x = (y-b)/m
		return (y - this._b) / this._m;
	}
	recalculate(){
		//recalculate the ray's slope intercept formula variables
		if(Math.abs(Math.abs(this._angle) - Math.PI / 2) <= 0.0000001){	//if the angle is vertical,
			this._m = Math.sign(this._angle);	 //_m stores the direcction that
			this._b = 0; //the ray is pointing in, while
			this._isVertical = true; //_b is truncated
		}
		else{ //if the angle is not vertical
			this._m = Math.tan(this._angle); //convert the angle to a slope
			this._b = this._origin.y - (this._m * this._origin.x);	//and find 
			this._isVertical = false; //the line's vertical offset
		}
	}
	
	getQuadrantDirections(){
		var pos = this.getPosition();
		var epos = this.getEndPosition();
		var dpos = epos.minus(pos);
		var r = [];
		
		dpos = new vec2(Math.sign(dpos.x), Math.sign(dpos.y));
		if(dpos.x != 0){
			if(dpos.x > 0) r.push(side.right);
			else r.push(side.left);
		}
		if(dpos.y != 0){
			if(dpos.y > 0) r.push(side.down);
			else r.push(side.up);
		}
		
		return r;
	}
	getCircleCollisionPoint(origin, radius){
		var epos = this.getEndPosition();
		if(epos.distance(origin) <= radius) return epos;
		var mag = this.getPosition().distance(origin);
		if(mag <= radius) return this.getPosition();
		if(mag > this.length) return null;
		
		var projectedPos = this.getPosition().plus(vec2.fromAng(this.getAngle(), mag));
		if(this.getEndPosition().plus(this.getPosition()).multiply(0.5).distance(projectedPos) > this.length / 2) return null;
		if(projectedPos.distance(origin) > radius) return null;
		
		return projectedPos;
	}
	getBoxCollision(colBox){
		var siders = [];
		
		if(this._isVertical){
			var colside = this._origin.y < this.getEndPosition().y ? side.up : side.down;
			var vec = new vec2(this._origin.x, colside == side.up ? colBox.top : colBox.bottom);
			
			if(vec.x < colBox.left || vec.x > colBox.right)
				return null;
			if(this.getPosition().plus(this.getEndPosition()).multiply(0.5).distance(vec) > this.length / 2)
				return null;
			return {point: vec, colSide: colside};
		}

		var sy = Math.sin(this.getAngle());
		if(sy > 0) siders.push(side.up);
		else if(sy < 0) siders.push(side.down);

		var cx = Math.cos(this.getAngle());
		if(cx > 0) siders.push(side.left);
		else if(cx < 0) siders.push(side.right);

		var vec = null;
		var colside = null;
		for(let i = siders.length - 1; i >= 0; i--){
			var x = null;
			var y = null;
			
			if(siders[i] == side.left) x = colBox.left;
			else if(siders[i] == side.right) x = colBox.right;
			else if(siders[i] == side.up) { 
				y = colBox.top;
			}
			else if(siders[i] == side.down) {
				y = colBox.bottom;
			}
			
			if(x == null && y == null) continue;
			
			if(x == null) {
				x = this.getX(y);
				if(x >= colBox.left && x <= colBox.right){
					vec = new vec2(x, y);
					colside = siders[i];
					break;
				}
			}
			else if(y == null){
				y = this.getY(x);
				if(y >= colBox.top && y <= colBox.bottom){
					vec = new vec2(x, y);
					colside = siders[i];
					break;
				}
			}
		}
		if(!vec) return null;
		if(this.getPosition().plus(this.getEndPosition()).multiply(0.5).distance(vec) > this.length / 2)
			return null;
		return {point: vec, colSide: colside};
	}
	
	draw(ctx, color = "#f00", width = 1){
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(this.getPosition().x, this.getPosition().y);
		var end = this.getEndPosition();
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}
	
	static fromRayData(m, b, length = Infinity){
		var r	= new ray();
		r._angle = null;
		r._m = m;
		r._b = b;
		r.length = length;
		r._origin = new vec2();
		return r;
	}
	
	static fromPoints(start, end){
		var ang = end.minus(start).direction();
		var length = end.distance(start);
		var r = new ray(start, ang, length);
		return r;
	}
}