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
	constructor(spriteSheet, sprite, bounds = null){
		this.spriteSheet = spriteSheet;
		this.sprite = sprite;
		this.bounds = bounds;
		if(bounds == null && !!sprite)
			this.bounds = new collisionBox(new vec2(), sprite.size);
		
		this.rotation = null;
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
		if(this.rotation){
			this.drawRotated(ctx);
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
	drawRotated(ctx = renderContext){
		if(this.sprite.size.x <= 0 || this.sprite.size.y <= 0) return;
		var cCorrect = this.bounds.size.multiply(-0.5);
		var tTot = this.bounds.pos.minus(cCorrect);
		
		ctx.translate(tTot.x, tTot.y);
		ctx.rotate(this.rotation);
		
		ctx.drawImage(
			this.spriteSheet,
			this.sprite.left, this.sprite.top,
			this.sprite.width, this.sprite.height,
			cCorrect.x, cCorrect.y,
			this.bounds.width, this.bounds.height
			);
			
		ctx.rotate(-this.rotation);
		ctx.translate(-tTot.x, -tTot.y);
	}
}