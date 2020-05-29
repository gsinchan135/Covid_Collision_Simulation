const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
const startBtn = document.getElementById("start");

const immuneBubbles = document.getElementById("immuneBtn");		//immune radio input
const canBeRecovered = document.getElementById("immuneToggle"); //immunity on/off text

const totalBubbles = document.getElementById("numBubbles");  	//Slider for number of bubbles on the screen
const amountOfBubbles = document.getElementById("numAmount");	//number box for number of bubbles

const theSeconds = document.getElementById("seconds");		 	//seconds in the timer
const theMinutes = document.getElementById("minutes");		 	//minutes in the timer
const theTimer = document.getElementById("time");				//the whole timer
const theSick = document.getElementById("sick");				//sick counter

const screen = document.getElementsByClassName("screenSize");	//radio buttons for screen size
const numInput = document.getElementsByClassName("numberBox");  //all number input boxes
const input = document.getElementsByTagName("input");			//all input tags

const frznBubbles = document.getElementById("staticBubbles") 	//Slider for number of static bubbles
const staticNum = document.getElementById("staticAmount");   	//number input for number of static bubbles

let simulating = false; 
let secs = 0;
let aTimer;
let theBubbles = []; 
let immunity = false;



canvas.height = lrgScrn.value; 	// in pixels
canvas.width = window.innerWidth * 0.9;

//Event Listeners

startBtn.addEventListener("click",Toggle);  //Toggles button between start and stop

immuneBubbles.addEventListener("click",Recovery)


frznBubbles.setAttribute("max",Number(numBubbles.value)); 	//without this if staticBubbles is changed before numBubbles then ChangeStaticMax is not run and the max value is defaulted to 100
totalBubbles.addEventListener("change",ChangeStaticMax)   	//When num bubbles slider is changed, max staticBubbles is dynamically changed along with it
amountOfBubbles.addEventListener("change",ChangeStaticMax);	//when num bubbles input box is change, ^^


for(let i = 0;i<numInput.length;i++){				
    numInput[i].addEventListener("keyup",StopMax); //stops values from being set above the maximum
}
totalBubbles.addEventListener("change",UniqueStopMax)	
amountOfBubbles.addEventListener("keyup",UniqueStopMax); 
staticNum.addEventListener("keyup",UniqueStopMax); //specifically stops the max number of static bubbles from being set above the value of total bubbles

for(let n = 0;n<screen.length;n++){
	screen[n].addEventListener("click",ChangeScreen); //changes screen size when new radio button is pressed
}

for(let k = 0;k<input.length;k++){
	input[k].addEventListener("click",Stop); //if any controls are clicked during the simulation, the simulation stops
}
/////////////////////////////////////////////////////////////////////////////////////
//controls functions

function ChangeStaticMax(){ //the max attribute of staticBubbles is the current value of numBubbles
	frznBubbles.setAttribute("max", numBubbles.value); 	//the number of static bubbles cannot pass the number of bubbles
}

function StopMax(){ //resets the value to the maximum if the number goes over the max
	for(let i = 0;i<numInput.length;i++){
		if(Number(numInput[i].value) > Number(numInput[i].max)) //no Number typecast returns value and max as strings
			numInput[i].value = Number(numInput[i].max);
	}
}	

function UniqueStopMax(){ //special function to stop the maximum value of staticBubbles from going over
	if(Number(staticNum.value) > Number(amountOfBubbles.value) || Number(staticNum.value) > Number(totalBubbles.value)){//numInput[2].max return numBubbles.value instead of a number and the if statement could not be processed correctly
		staticNum.value = Number(amountOfBubbles.value);
		frznBubbles.value = Number(amountOfBubbles.value);
	}
}

function Recovery(){
	if(!immunity){
		canBeRecovered.innerHTML = "On";
		immunity = true;
	}
	else{
		canBeRecovered.innerHTML = "Off";
		immuneBubbles.checked = false;
		immunity = false;
	}
	
}

function ChangeScreen(){
	stop();
	if(smlScrn.checked){
		canvas.height = smlScrn.value;
		canvas.width = window.innerWidth * 0.6;
	}
	
	if(mdmScrn.checked){
		canvas.height = mdmScrn.value;
		canvas.width = window.innerWidth * 0.8;
	}
	
	if(lrgScrn.checked){
		canvas.height = lrgScrn.value;
		canvas.width = window.innerWidth * 0.9;
	}
}
////////////////////////////////////////////////////////////
//simulation
function Simulate(){

	startBtn.innerHTML = "Stop";
	simulating = true;
	secs = 0;
	theSeconds.innerHTML="00";
	theMinutes.innerHTML="00";
	theTimer.style.color = "#26A7F7";
	theSick.style.color = "#26A7F7";

	let radius = bubbleSize.value;		// in pixels
	let noBubbles = numBubbles.value;	// number of bubbles
	let noStatic = Number(staticBubbles.value);	// number of static bubbles
	let sickRatio = sickRatioAmount.value;  // ratio of starting sick bubbles. 0 = 0%, 1 = 100%
	let speed = bubbleSpeed.value;		// speed constant (unitless)

	let sickCounter = 0;
	let allSick = 0; //counts if all bubbles have become sick
	let bubbles = [];


	for(let bubble of theBubbles){	//when the simulation is stopped, all references to the current bubbles are deleted before the next simulation can start
		delete bubble.radius;		//Deletes bubbles that would otherwise be running in the background when the simulation is restarted
		delete bubble.velocity;
		delete bubble.sick;
	}

	for (let i = 0; i < noBubbles; i++) {
		let isSick = false;

		if (i < noBubbles * sickRatio) {	// the first X bubbles will be sick
			isSick = true;
			sickCounter++;
		}

		if (i >= noBubbles - noStatic) {	// the last Y bubbles will be static //change > to >= because one bubble is always moving
			speed = 0;
		}

		const newBubble = new Bubble(Number(radius), speed, isSick);

		// Ensures that no bubbles spawn on top of each other initially. 
		for (let bubble of bubbles) {

			while (newBubble.isColliding(bubble)) {
				newBubble.positionRandomly();
			}
		}
		bubbles.push(newBubble); // add newBubble to the bubbles array
	}
	theBubbles = bubbles; //the array is passed to a new array that is wiped clean in Stop()

	function animate() {

		requestAnimationFrame(animate);
		context.clearRect(0, 0, canvas.width, canvas.height);
	
		for (let bubble of theBubbles) { 
			// To update itself, a bubble needs to know the state of all bubbles
			bubble.update(theBubbles);
			if(bubble.sick)
				allSick++; 
		}
		if(allSick >= noBubbles){
			clearInterval(aTimer);	//stops timer
			theTimer.style.color = "red";	//changes timer to red
			theSick.style.color = "red";	//changes sick counter to red
			allSick = 0;					
		}
		else{
			allSick = 0; //resets allSick so that it only counts the sick bubbles from one pass through the for loop
		}
	}
	animate();	
	aTimer = setInterval(Timer,1000); //checks time every second	

}

function Toggle(){
	simulating ? Stop() : Simulate(); //if the simulation is running, it stops and vice versa
}

function Stop(){
	startBtn.innerHTML = "Start";
	simulating = false;
	clearInterval(aTimer);
	allSick = 0;
	secs = 0;
}


function Timer(){
		secs++;
		theSeconds.innerHTML = AddZero(secs%60); 
		theMinutes.innerHTML = AddZero(parseInt(secs/60)); //parseInt always removes decimals // 2.2 (2 minutes 12 seconds) --> 2 (2 minutes) 
		if(secs%10 === 0){
			for (let bubble of theBubbles) { 
				if(bubble.sick){
					bubble.Recover();
					break;
				}
			}
		}
}

function AddZero(time){  //adds zeros to timer
	if(time <= 9)
		return "0" + time; //if number is less than or equal to 9 it has one digit and needs a zero in front
	else
		return time;  //else the number has two digits and has no need for a zero infront
}