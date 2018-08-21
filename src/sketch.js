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
var agents = [];

function setup() {
  createCanvas(canvas_width, canvas_height);
  player = new Agent();
  for(var i = 0; i < 1; i++){
    var agent = new Agent();
    agent.id = i + 1;
    agent.pos = createVector(canvas_width / 4, canvas_height / 4);
    agents.push(agent);
  }
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

function checkCollisions(){
  for(var i = 0; i < agents.length; i++){
    if(agents[i].dead) continue;
    var agent_poly = agents[i].poly;
    for(var j = 0; j < agents.length; j++){
      if(i == j || agents[j].dead) continue;
      if(collidePolyPoly(agent_poly, agents[j].poly)){
        agents[i].kill();
        agents[j].kill();
      }
    }
    for(var bullet of bullets){
      //console.log(bullet);
      if(bullet.creator != agents[i].id && collideCirclePoly(bullet.pos.x, bullet.pos.y, bullet_radius * 2,agent_poly)){
        agents[i].kill();
        bullets.delete(bullet);
        break;
      }
    }
  }
}

function update() {
  agents.push(player);
  agents.forEach(function(agent){
    agent.update();
    agent.render();
  })
  bullets.forEach(function(bullet){
    bullet.update();
    bullet.render();
  })
  checkCollisions();
  agents.pop();
}

function draw() {
  background(255);
  update();
  player.render();

}