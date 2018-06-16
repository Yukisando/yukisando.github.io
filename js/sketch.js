

var carrier, modulator;
var modFreq = 20;
var carFreq = 440;
var env;

window.ondevicemotion = function(event) {  
    var accelerationX = event.accelerationIncluding.x;  
    var accelerationY = event.accelerationIncluding.y;  
    var accelerationZ = event.accelerationIncluding.z;  
    console.log(accelerationX);
} 

 

function setup() {

  cursor(CROSS);
  
var button = createButton("waveform");
   button.position(0, 0);
   button.mousePressed(function(){console.log("hi")});

   var button = createButton("Record");
   button.position(100, 0);
   button.mousePressed(function(){console.log("hi")});

   var button = createButton("draw");
   button.position(200, 0);
   button.mousePressed(function(){console.log("hi")});



  createCanvas(innerWidth,innerHeight);

  background(0);
  frameRate(60);
   env = new p5.Env(0.05, 1.0, // attack time & level
                   0.2, 0.7,  //decay time & level
                   0.0, 0.7, //sustain time  & level
                   1); //release time


  carrier = new p5.Oscillator('square');
  carrier.amp(env); 
  carrier.freq(carFreq);
  carrier.start();

  modulator = new p5.Oscillator('square');
  modulator.disconnect();
  modulator.amp(50); 
  modulator.freq(modFreq); 
  modulator.start();

  carrier.freq(modulator);
  }


function draw() {

  background(0);
  geroParams();

//for (var i=0; i<5000 ;i++){
  //i = sin(i);

ellipse(touchX,touchY,20,20);
ellipse(mouseX,mouseY,20,20);}



function touchStarted(){

  adjustParams();
 
  env.triggerAttack();


}

function touchMoved(){

  adjustParams();
  env.triggerAttack();  
return false;
}

function touchEnded(){

  env.triggerRelease();
}

function geroParams(){
   //modFreq = map(accelerationX  , 0, width,0.5,100);
   //carFreq = map(accelerationY, 0, height, 50,2000);
  //background(accelerationX*100,accelerationY*100,accelerationZ*100)
  carrier.freq(carFreq);
  modulator.freq(modFreq);
}

function adjustParams(){

  modFreq = map(touchX  , 0, width,0.5,100);
  carFreq = map(touchY, 0, height, 50,2000);
  carrier.freq(carFreq);
  modulator.freq(modFreq);
 //print(carrier.freq);

}

