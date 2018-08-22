//constants
const canvas_width = 1100;
const canvas_height = 800;
const turn_speed = 0.1;
const accelation = 0.08;
const max_bullets = 5;
const ship_size = 20;
const bullet_speed = 7;
const bullet_radius = 10;

var player;
var humanPlaying = false;
var bullets = new Set();
var agents = [];

function setup() {
  createCanvas(canvas_width, canvas_height);
  player = new Agent();
  var Chrome = new Chromosome();
  //console.log(Chrome.gene);
  var Pop = new Population();
  Pop.randomPopulation();
  testPopulation(Pop);
  //console.log(getState(agents[0]));
  //nn();
}

function testPopulation(population){
  resetEnvorionment();
  var radius = min(canvas_height, canvas_height) / 2 - 40;
  for(var i = 0; i < population.Chromosomes.length; i++){
    var chromosome = population.Chromosomes[i];
    var agent = new Agent();
    var angle = 2 * PI * i / population.Chromosomes.length;
    agent.id = i + 1;
    agent.angle = angle + PI;
    agent.net = chromosome.geneToNet();
    agent.pos = createVector(cos(angle) * radius, sin(angle) * radius);
    agent.pos.add(createVector(canvas_width / 2, canvas_height / 2));
    //console.log(agent);
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
      if(bullet.creator != agents[i].id && collideCirclePoly(bullet.pos.x, bullet.pos.y, bullet_radius * 2, agent_poly)){
        agents[i].kill();
        bullets.delete(bullet);
        break;
      }
    }
  }
}

function resetEnvorionment(){
  agents = [];
  bullets = new Set();

}

function distance(object1, object2){ //returns square of distance
  var dist = 0;
  dist += (object1.pos.x - object2.pos.x) * (object1.pos.x - object2.pos.x);
  dist += (object1.pos.y - object2.pos.y) * (object1.pos.y - object2.pos.y);
  return dist;
}

function getPosVel(object){ //helper
  var state = [];
  state.push(object.pos.x);
  state.push(object.pos.y);
  state.push(object.vel.x);
  state.push(object.vel.y);
  return state;
}

function getState(agent){ //array length 13
  //num bullets, agent pos + vel, closest agent pos + vel, closest bullet pos + vel
  var state = [];
  state.push(agent.bullets);
  state.push.apply(state, getPosVel(agent));
  var minDist = -1;
  var closest = null;
  for(var i = 0; i < agents.length; i++){
    if(agents[i] == agent) continue;
    if(minDist == -1 || distance(agent, agents[i]) < minDist){
      minDist = distance(agent, agents[i]);
      closest = agents[i];
    }
  }
  if(closest){
    state.push.apply(state, getPosVel(closest));
  } else{ //shouldnt happen, game is over
    state.push.apply(state, [0, 0, 0, 0]);
  }
  minDist = -1;
  closest = null;
  bullets.forEach(function(bullet){
    if(minDist == -1 || distance(agent, bullet) < minDist){
      minDist = distance(agent, bullet);
      closest = bullet;
    }
  })
  if(closest){
    state.push.apply(state, getPosVel(closest));
  } else{
    state.push.apply(state, [0, 0, 0, 0]);
  }
  return state;
}

function update() {
  if(humanPlaying) agents.push(player);  
  agents.forEach(function(agent){
    var state = getState(agent);
    agent.update();
    agent.render();
  })
  bullets.forEach(function(bullet){
    bullet.update();
    bullet.render();
  })
  checkCollisions();
  if(humanPlaying) agents.pop();
}

function draw() {
  background(255);
  rect(0, 0, canvas_width - 1, canvas_height - 1);
  update();
  if(humanPlaying) player.render();

}