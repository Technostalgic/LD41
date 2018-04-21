///
///	code by Isaiah Smith
///
///	https://technostalgic.tech	
///	twitter @technostalgicGM
///

var renderCanvas,
	renderContext,
	scaleCanvas,
	scaleContext;

var gfx = [],
	sftx = [];

var lastRecordedTimeStamp = 0,
	dt = 0;

var state = new gameState();

function init(){
	getCanvas();
	state = new gameState_gamePlay();
	controlState.init();

	currentTerrain = getTerrainScreenBounds();

	load();
	requestAnimationFrame(step);
}
function load(){
	loadGraphic("player.png", "player");
	loadGraphic("cardItem.png", "cardItem");
}

function loadGraphic(fileName, assetName){
	var img = document.createElement("img");
	img.src = "./gfx/" + fileName;

	gfx[assetName] = img;
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
	// prints the render canvas onto the scaling canvas
	scaleContext.drawImage(renderCanvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
}

function getRandomScreenPos(){
	return new vec2(
		Math.random() * 400,
		Math.random() * 350
	);
}

window.addEventListener("load", init);