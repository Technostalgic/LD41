///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

var renderCanvas,
	renderContext,
	textCanvas,
	textContext,
	scaleCanvas,
	scaleContext;

var gfx = {},
	sfx = {};

var lastRecordedTimeStamp = 0,
	dt = 0;

var state = new gameState();

var highScore = 0,
	savekey = "technostalgic_LD41_highScore";

function init(){
	getCanvas();
	load();
	preventKeyScrolling();
	state = new gameState_startScreen(); //new gameState_startScreen();
	controlState.init();

	requestAnimationFrame(step);
}
function load(){
	loadGraphic("player.png", "player");
	loadGraphic("playerHand.png", "playerHand");
	loadGraphic("hud_border.png", "hud_border");
	loadGraphic("hud_healthBar.png", "hud_healthBar");
	loadGraphic("cardHUD.png", "cardHUD");
	loadGraphic("cardItem.png", "cardItem");
	loadGraphic("cardGraphics.png", "cardGraphics");
	loadGraphic("projectile.png", "projectile");
	loadGraphic("prop.png", "prop");
	loadGraphic("giblets.png", "giblets");
	loadGraphic("weapons.png", "weapons");
	loadGraphic("lazerFace.png", "lazerFace");
	loadGraphic("enemy1.png", "enemy1");
	loadGraphic("enemy2.png", "enemy2");
	loadGraphic("enemy3.png", "enemy3");
	loadGraphic("hit.png", "effect_hit");
	loadGraphic("explosion.png", "effect_explosion");
	loadGraphic("explosionBlue.png", "effect_explosionBlue");
	loadGraphic("spawnWarning.png", "spawnWarning");

	loadSound("enemyHit.wav", "enemyHit");
	loadSound("playerHit.wav", "playerHit");
	loadSound("explosion.wav", "explosion");
	loadSound("gameover.wav", "gameover");
	loadSound("heal.wav", "heal");
	loadSound("jump.wav", "jump");
	loadSound("bump.wav", "bump");
	loadSound("lazer.wav", "lazer");
	loadSound("pickup.wav", "pickup");
	loadSound("enemyShoot.wav", "enemyShoot");
	loadSound("shotgun.wav", "shotgun");
	loadSound("crossbow.wav", "crossbow");
	loadSound("revolver.wav", "revolver");
	loadSound("swoosh.wav", "swoosh");
	
	loadHighScore();
}

function preventKeyScrolling(){
	// prevents arrow key / space scrolling on the web page
	window.addEventListener("keydown", function(e) {
		if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		}
	}, false);
	window.addEventListener("touchmove", function(e) {
		e.preventDefault();
	}, false);
}
function loadHighScore(){
	try{
		var hsdat = localStorage.getItem(savekey);
		if(!hsdat) return;
		highScore = parseInt(hsdat);
	} 
	catch(e){
		console.log("Local storage disabled, high score not loaded");
		highScore = 0;
	}
}
function saveHighScore(){
	try{
		localStorage.setItem(savekey, this.highScore.toString());
	}
	catch(e){
		console.log("Local storage disabled, high score saving aborted");
	}
}
function loseGame(score){
	if(score > highScore) {
		highScore = score;
		saveHighScore();
	}
	state = new gameState_gameoverScreen(score);
}

function drawLine(startPos, endPos, color = color.Black(), lineWidth = 1){
	renderContext.strokeStyle = color.toRGBA();
	renderContext.lineWidth = lineWidth;
	
	renderContext.beginPath();
	renderContext.moveTo(startPos.x, startPos.y);
	renderContext.lineTo(endPos.x, endPos.y);
	renderContext.stroke();
}
function drawText(txt, pos, size, fillCol = color.White(), outlineCol = color.Black(), outlineThickness = 4){
	outlineText(txt, pos, size, outlineCol, outlineThickness);
	fillText(txt, pos, size, fillCol);
}
function fillText(txt, pos, size = 10, col = color.Black(), iterations = 1){
	pos = pos.multiply(2);
	textContext.font = size.toString() + "px sans-serif";
	textContext.textAlign = "center";
	col.setFill(textContext);
	textContext.fillText(txt, pos.x, pos.y);
}
function outlineText(txt, pos, size = 10, col = color.Black(), thickness = 1){
	pos = pos.multiply(2);
	textContext.font = size.toString() + "px sans-serif";
	textContext.textAlign = "center";
	col.setStroke(textContext);
	textContext.lineWidth = thickness;
	textContext.strokeText(txt, pos.x, pos.y);
}
function loadGraphic(fileName, assetName){
	var img = document.createElement("img");
	img.src = "./gfx/" + fileName;

	gfx[assetName] = img;
}
function loadSound(fileName, assetName){
	var aud = new Audio("sfx/" + fileName);

	sfx[assetName] = aud;
}

function getCanvas(){
	// creat the canvas and context that will be used to scale up / down the render canvas
	scaleCanvas = document.getElementById("gameCanvas");
	scaleContext = scaleCanvas.getContext("2d");

	//create the canvas and context for rendering all the graphics on to
	renderCanvas = document.createElement("canvas");
	renderCanvas.width = scaleCanvas.width / 2;
	renderCanvas.height = scaleCanvas.height / 2;
	renderContext = renderCanvas.getContext("2d");
	
	// create high resolution canvas for rendering legible text
	textCanvas = document.createElement("canvas");
	textCanvas.width = scaleCanvas.width;
	textCanvas.height = scaleCanvas.height;
	textContext = textCanvas.getContext("2d");
	textContext.miterLimit = 3;

	// disables scale smoothing
	scaleContext.mozImageSmoothingEnabled    = false;
	scaleContext.oImageSmoothingEnabled      = false;
	scaleContext.webkitImageSmoothingEnabled = false;
	scaleContext.msImageSmoothingEnabled     = false;
	scaleContext.imageSmoothingEnabled       = false;

	// disables render smoothing
	renderContext.mozImageSmoothingEnabled     = false;
	renderContext.oImageSmoothingEnabled       = false;
	renderContext.webkitImageSmoothingEnabled  = false;
	renderContext.msImageSmoothingEnabled      = false;
	renderContext.imageSmoothingEnabled        = false;
}
function clearScreen(col = color.Grey()){
	// clears the screen to a solid color
	col.setFill();
	renderContext.fillRect(0,0,renderCanvas.width, renderCanvas.height);
	textContext.clearRect(0,0, textCanvas.width, textCanvas.height);
}

function playSound(sound, forceRepeat = true){
	if(forceRepeat) sound.currentTime = 0;
	sound.play();
}
function startGame(){
	state = new gameState_gamePlay();
}

function step(){
	update();
	draw();
	
	// sets callback for next step
	requestAnimationFrame(step);

	// sets dt to time elapsed since last step, in seconds
	dt = (performance.now() - lastRecordedTimeStamp) / 1000;
	lastRecordedTimeStamp = performance.now();
}
function update(){
	state.update();
}
function draw(){
	clearScreen();
	state.draw();
	printScreen();
}
function printScreen(){
	// prints the render canvas and text canvas onto the scaling canvas
	scaleContext.drawImage(renderCanvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
	scaleContext.drawImage(textCanvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
	textContext.globalAlpha = 1;
}

function getRandomScreenPos(){
	return new vec2(
		Math.random() * 400,
		Math.random() * 350
	);
}

window.addEventListener("load", init);