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

var lastRecordedTimeStamp = 0,
	dt = 0;

var state = new gameState();

function init(){
	getCanvas();
	state = new gameState();
	controlState.init();

	requestAnimationFrame(step);
}
function load(){

}

function getCanvas(){
	// creat the canvas and context that will be used to scale up / down the render canvas
	scaleCanvas = document.getElementById("gameCanvas");
	scaleContext = scaleCanvas.getContext("2d");

	//create the canvas and context for rendering all the graphics on to
	renderCanvas = document.createElement("canvas");
	renderCanvas.width = 600;
	renderCanvas.height = 700;
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
}
function draw(){
	clearScreen();

	printScreen();
}
function printScreen(){
	// prints the render canvas onto the scaling canvas
	scaleContext.drawImage(renderCanvas, 0, 0, scaleCanvas.width, scaleCanvas.height);
}

window.addEventListener("load", init);