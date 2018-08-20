function Agent(){
  this.id = 0;
  this.pos = createVector(canvas_width / 2, canvas_height / 2);
  this.vel = createVector(0, 0);
  this.rotation = 0;
  this.s = ship_size;  //ship size
  this.angle = 0;
  this.accelation = 0;
  this.bullets = 0;
  this.space_pressed = false;
  this.render = function(){
    translate(this.pos.x, this.pos.y);
    rotate(this.angle + PI / 2);
    triangle(-this.s, this.s, this.s, this.s, 0, -2 * this.s);
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
    console.log(bullets.size);
  }
  this.update = function(){
    this.turn();
    this.vel.mult(0.99);
    var force = p5.Vector.fromAngle(this.angle);
    force.mult(this.accelation);
    this.vel.add(force);
    this.pos.add(this.vel);
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
}

function Bullet(creator, pos, vel){
  this.creator = creator;
  this.pos = createVector(pos.x, pos.y); 
  this.vel = createVector(vel.x, vel.y);
  this.update = function(){
    this.pos.add(this.vel);
  }
  this.render = function(){
    //translate(this.pos.x, this.pos.y);
    ellipse(this.pos.x, this.pos.y, bullet_radius, bullet_radius);
  }
}