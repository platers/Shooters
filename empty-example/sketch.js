//constants
const canvas_width = 800;
const canvas_height = 600;
const turn_speed = 0.1;
const accelation = 0.08;
const max_bullets = 5;
const ship_size = 20;
const bullet_speed = 7;
const bullet_radius = 10;

var player;
var bullets = new Set();

function setup() {
  createCanvas(canvas_width, canvas_height);
  player = new Agent();
}

function keyPressed(){
  if(keyCode == RIGHT_ARROW){
    player.rotation = turn_speed;
  }
  if(keyCode == LEFT_ARROW){
    player.rotation = -turn_speed;
  }
  if(keyCode == UP_ARROW){
    player.accelation = accelation;
  }
  if(key == " "){
    player.space_pressed = true;   
  }
}

function keyReleased(){
  if(keyCode == RIGHT_ARROW && player.rotation == turn_speed){
    player.rotation = 0;
  }
  if(keyCode == LEFT_ARROW && player.rotation == -turn_speed){
    player.rotation = 0;
  }
  if(keyCode == UP_ARROW){
    player.accelation = 0;
  }
  if(key == " "){
    player.space_pressed = false;
  }
}



function update() {
  player.update();
  bullets.forEach(function(bullet){
    bullet.update();
    bullet.render();
  })
}

function draw() {
  background(255);
  update();
  player.render();

}