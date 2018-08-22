function Agent(){
  this.id = 0;
  this.dead = false;
  this.human = false;
  this.pos = createVector(canvas_width / 2, canvas_height / 2);
  this.vel = createVector(0, 0);
  this.rotation = 0;
  this.s = ship_size;  //ship size
  this.angle = 0;
  this.accelation = 0;
  this.bullets = 0;
  this.space_pressed = false;
  this.poly = [];
  this.net = null;
  this.render = function(){
    if(this.dead) return;
    //translate(this.pos.x, this.pos.y);
    //rotate(this.angle + PI / 2);
    triangle(this.poly[0].x, this.poly[0].y, this.poly[1].x, this.poly[1].y, this.poly[2].x, this.poly[2].y);
  }
  this.turn = function(){
    this.angle += this.rotation;
  }
  this.shoot = function(){
    if(this.bullets <= 0) return;
    this.bullets--;
    var vel = p5.Vector.fromAngle(this.angle);
    vel.mult(bullet_speed);
    var bullet = new Bullet(this.id, this.pos, vel);
    bullets.add(bullet);
    //console.log(bullets.size);
  }
  this.kill = function(){
    this.dead = true;
    console.log("Agent " + this.id + " has been killed");
  }
  this.calculatePoly = function(){

    this.poly[0] = createVector(-this.s, 1.5 * this.s);
    this.poly[1] = createVector(this.s, 1.5 * this.s);
    this.poly[2] = createVector(0, -1.5 * this.s);
    for(var i = 0; i < this.poly.length; i++){
      this.poly[i].rotate(this.angle + PI / 2);
      this.poly[i].add(this.pos);
    }
  }
  this.update = function(state){
    if(this.dead) return;
    if(!this.human){
      this.getAction(state);
    }
    this.turn();
    this.vel.mult(0.99);
    var force = p5.Vector.fromAngle(this.angle);
    force.mult(this.accelation);
    this.vel.add(force);
    this.pos.add(this.vel);
    this.calculatePoly();
    if(this.pos.x > canvas_width){
      this.pos.x = 0;
    }
    if(this.pos.x < 0){
      this.pos.x = canvas_width;
    }
    if(this.pos.y > canvas_width){
      this.pos.y = 0;
    }
    if(this.pos.y < 0){
      this.pos.y = canvas_height;
    }
    if(frameCount % 20 == 0 && this.bullets < max_bullets){
      this.bullets++;
    }
    if(this.space_pressed){
      this.shoot();
    }
  }
  this.getAction = function(state){
    state = new convnetjs.Vol(state);
    var output = this.net.forward(state).w;
    //console.log(output);
    if(output[0] < -0.5) this.rotation = -turn_speed; //left
    if(abs(output[0]) <= 0.5) this.rotation = 0; //dont turn
    if(output[0] > 0.5) this.rotation = turn_speed; //right
    if(output[1] > 0) this.accelation = accelation; //right
    else this.accelation = 0;
    if(output[2] > 0) this.space_pressed = true; //right
    else this.space_pressed = false;
  }
}

function Bullet(creator, pos, vel){
  this.creator = creator;
  this.pos = createVector(pos.x, pos.y); 
  this.vel = createVector(vel.x, vel.y);
  this.inBounds = function(){
    return this.pos.x >= 0 && this.pos.x <= canvas_width && this.pos.y >= 0 && this.pos.y <= canvas_height;
  }
  this.update = function(){
    this.pos.add(this.vel);
  }
  this.render = function(){
    ellipse(this.pos.x, this.pos.y, bullet_radius, bullet_radius);
  }
}