//constants
const canvas_width = 1100;
const canvas_height = 800;
const turn_speed = 0.1;
const accelation = 0.1;
const max_bullets = 4;
const ship_size = 20;
const bullet_speed = 7;
const bullet_radius = 10;
const batch_size = 6;

var player;
var humanPlaying = false;
var bullets = new Set();
var agents = [];

var Pop = null;

function setup() {
  createCanvas(canvas_width, canvas_height);
  player = new Agent();
  Pop = new Population();
  Pop.randomPopulation();
}
var currentBest = [];
const numgenerations = 1;
var current_generation = 0;

function train(){
  for(var i = 0; i < numgenerations; i++){
    current_generation++;
    console.log("Training generation " + current_generation);
    var relFitness = testPopulation(Pop);
    var chromosomes = [];
    currentBest = [];
    for(var j = 0; j < relFitness.length; j++){
      chromosomes.push(Pop.Chromosomes[relFitness[j]]);
      currentBest.push(agentFromChromosome(Pop.Chromosomes[relFitness[j]], j));
    }
    Pop.newGeneration(chromosomes);
  }
}

function agentFromChromosome(chromosome, index){
  var agent = new Agent();
  var angle = index * 2 * PI / batch_size;
  var radius = min(canvas_height, canvas_height) / 2 - 40;
  agent.id = index;
  agent.angle = angle + PI;
  agent.net = chromosome.copy().geneToNet();
  agent.pos = createVector(cos(angle) * radius, sin(angle) * radius);
  agent.pos.add(createVector(canvas_width / 2, canvas_height / 2));
  return agent;
}
const steps = 600;
var frame = 0;
function testPopulation(population){
  var relFitness = []
  for(var i = 0; i < population.Chromosomes.length; i++){
    var chromosome = population.Chromosomes[i];
    var fitness = simulate(agentFromChromosome(chromosome, 0), population, steps);
    relFitness.push(fitness);
  }
  var best = fittest(relFitness);
  console.log(relFitness[best[0]]);
  return best;
}

function fittest(relFitness){
  var arr = [];
  for(var i = 0; i < relFitness.length; i++){
    arr.push([relFitness[i], i]);
  }
  function cmp(a, b){
    if(a[0] < b[0]) return 1;
    else return -1;
  }
  arr.sort(cmp);
  //console.log(arr);
  var best = [];
  for(var i = 0; i < relFitness.length * 0.2; i++){
    best.push(arr[i][1]);
  }
  return best;
}

function simulate(agent, population, steps){
  var fitness = 0;
  for(var i = 0; i < 2; i++){
    var batch = [];
    batch.push(agent);
    for(var j = 1; j <= batch_size - 1; j++){
      var chromosome = population.Chromosomes[Math.floor(Math.random() * population.Chromosomes.length)];
      batch.push(agentFromChromosome(chromosome, j));
    }
    resetEnvorionment();
    agents = batch;
    frame = 0;
    for(var i = 0; i < steps; i++){
      //drawBackground();
      update();
      if(agents[0].dead){
        break;
      }
    }
    fitness += agents[0].score;
  }
  return fitness / 2;
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
        //agents[i].score++;
        //agents[j].score++;
        agents[i].kill();
        agents[j].kill();
      }
    }
    for(var bullet of bullets){
      if(!bullet.inBounds()){
        bullets.delete(bullet);
        continue;
      }
      if(bullet.creator != agents[i].id && collideCirclePoly(bullet.pos.x, bullet.pos.y, bullet_radius * 2, agent_poly)){
        agents[i].kill();
        agents[i].score--;
        agents[bullet.creator].score++;
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

function getState(agent){ //array length 16
  //num bullets, agent pos + vel, closest agent pos + vel, closest bullet pos + vel
  var state = [];
  state.push(agent.bullets);
  state.push(agent.angle);
  state.push(agent.accelation);
  state.push(agent.rotation);
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
    if(bullet.creator != agent.id && (minDist == -1 || distance(agent, bullet) < minDist)){
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

function drawBackground(){
  background(255);
  rect(0, 0, canvas_width - 1, canvas_height - 1);
}

function update() {
  var numAlive = 0;
  if(humanPlaying) agents.push(player);  
  agents.forEach(function(agent){
    var state = getState(agent);
    agent.update(state);
    if(!agent.dead) numAlive++;
    //agent.render();
  })
  bullets.forEach(function(bullet){
    bullet.update();
    //bullet.render();
  })
  checkCollisions();
  if(humanPlaying) agents.pop();
  frame++;
 //console.log(numAlive);
  if(numAlive < 2) return false;
  else return true;
}

function initGame(){
  resetEnvorionment();
  frame = 0;
  agents = [];
  for(var i = 0; i < min(currentBest.length, batch_size); i++){
    agents.push(currentBest[i].copy());
  }
}

function render(){
  drawBackground();
  if(humanPlaying) agents.push(player);  
  agents.forEach(function(agent){
    agent.render();
  })
  bullets.forEach(function(bullet){
    bullet.render();
  })
  if(humanPlaying) agents.pop();
}
var gameRunning = false;

function draw() {
  if(!gameRunning || frame > steps){
    train();
    initGame();
    gameRunning = true;
  }
  gameRunning = update();
  //console.log(gameRunning);
  render();
  if(humanPlaying) player.render();
  
}