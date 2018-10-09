const WIDTH = 1200
const HEIGHT = 800
const TURN_SPEED = 360
const SHIP_SIZE = 30
const SHIP_THRUST = 5; //acceleration of ship
const SHIP_DEATH_TIME = .5; //how long the ship explodes
const SHIP_INVULNERABLE = 3; //how long invulnerabliity lasts
const SHIP_BLINK = .2; //how quickly the ship blinks
const FRICTION = .2;
const SHOW_BOUNDS = false; //shows hit boxes on true

var SFX = {
  laser:             new Audio("Laser_Shoot.wav"),
  playerExplosion:   new Audio("playerExplosion.wav"),
  asteroidExplosion: new Audio("AsteroidExplosion.wav")
};

//player object
var ship = new Ship();

//asteroid object
var asteroids = [];
var ax, ay;

var bullets = [];

var gameOver = false;
var lives = 3;
var level = 1;

var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = HEIGHT;
screen.width = WIDTH;
document.body.appendChild(screen);

var backBuffer = document.createElement('canvas');
var backBufferCtx = screen.getContext('2d');
backBuffer.height = HEIGHT;
backBuffer.width = WIDTH;

var start = null;
var lives = 3;
var score = 0;
var currentInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false,
  j: false
}
var priorInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false,
  j: false
}

function createAsteroids(level) {
  if(level === 1){
    //4 one split astroids, 1 two split asteroids
    for(var i = 0; i < 4; i++){
      do {
        ax = Math.floor(Math.random() * WIDTH);
        ay = Math.floor(Math.random() * HEIGHT);
      } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
      asteroids.push(new Asteroid(ax, ay, 1));
    }
    do {
      ax = Math.floor(Math.random() * WIDTH);
      ay = Math.floor(Math.random() * HEIGHT);
    } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
    asteroids.push(new Asteroid(ax, ay, 2));
  }
  else if(level === 2){
    //5 one split asteroids, 3 two split asteroids
    for(var i = 0; i < 5; i++){
      do {
        ax = Math.floor(Math.random() * WIDTH);
        ay = Math.floor(Math.random() * HEIGHT);
      } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
      asteroids.push(new Asteroid(ax, ay, 1));
    }
    for(var j = 0; j < 3; j++){
      do {
        ax = Math.floor(Math.random() * WIDTH);
        ay = Math.floor(Math.random() * HEIGHT);
      } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
      asteroids.push(new Asteroid(ax, ay, 2));
    }
  }
  else if(level === 3){
    //2 one split asteroids, 3 two split asteroids, 2 three split asteroids, 1 five split asteroid
    for(var i = 0; i < 2; i++){
      do {
        ax = Math.floor(Math.random() * WIDTH);
        ay = Math.floor(Math.random() * HEIGHT);
      } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
      asteroids.push(new Asteroid(ax, ay, 1));
    }
    for(var j = 0; j < 3; j++){
      do {
        ax = Math.floor(Math.random() * WIDTH);
        ay = Math.floor(Math.random() * HEIGHT);
      } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
      asteroids.push(new Asteroid(ax, ay, 2));
    }
    for(var k = 0; k < 2; k++){
      do {
        ax = Math.floor(Math.random() * WIDTH);
        ay = Math.floor(Math.random() * HEIGHT);
      } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
      asteroids.push(new Asteroid(ax, ay, 3));
    }
    do {
      ax = Math.floor(Math.random() * WIDTH);
      ay = Math.floor(Math.random() * HEIGHT);
    } while(distOfPoints(ship.x, ship.y, ax, ay) < 150 + ship.r);
    asteroids.push(new Asteroid(ax, ay, 5));
  }
}

function distOfPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function handleKeydown(event) {
  switch(event.key) {
    case ' ':
      currentInput.space = true;
      event.preventDefault();
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.up = true;
      event.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
      currentInput.down = true;
      event.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = true;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = true;
      break;
    case 'j':
      currentInput.j = true;
      event.preventDefault();
      break;
  }
}
window.addEventListener('keydown', handleKeydown);

function handleKeyup(event) {
  switch(event.key) {
    case ' ':
      currentInput.space = false;
      event.preventDefault();
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.up = false;
      event.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
      currentInput.down = false;
      event.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = false;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = false;
      break;
    case 'j':
      currentInput.j = false;
      event.preventDefault();
      break;
  }
}
window.addEventListener('keyup', handleKeyup);

function copyInput() {
  priorInput = JSON.parse(JSON.stringify(currentInput));
}

function gameLoop(timestamp){
  if(!start) start = timestamp;
  var elapsedTime = timestamp - start;
  start = timestamp;
  update(elapsedTime);
  render(backBufferCtx);
  copyInput();
  screenCtx.drawImage(backBuffer, 0, 0);
  if(gameOver) {
    endGame();
    return;
  }
  window.requestAnimationFrame(gameLoop);
}

function endGame() {
  level++
  if(lives < 0){
    alert("Game Over! You Died! Press the button to play again.");
  }
  else if(level > 3){
    alert("Congratulation you beat the game! Press the button to play again.")
  }
  else if(asteroids.length === 0){
    alert("Level Complete Moving to Level " + level)
    startup(level);
  }
  return;
}

function update(elapsedTime){
  ship.exploding = ship.explodeTime > 0;

  if(!ship.exploding){
    if(currentInput.space && !priorInput.space) { //fire bullet from nose
      SFX.laser.play();

      bullets.push(new Bullet(ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                              ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                              6 * Math.cos(ship.a),
                              6 * Math.sin(ship.a)));

    }
    //increase thrust
    if(currentInput.up) {
      ship.thrusting = true;
      ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) * .1;
      ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) * .1;
    }
    //stop thrust
    else {
      ship.thrusting = false;
      ship.thrust.x -= FRICTION * ship.thrust.x * .1;
      ship.thrust.y -= FRICTION * ship.thrust.y * .1;
    }
    //move ship
    ship.x += ship.thrust.x / 5;
    ship.y += ship.thrust.y / 5;

    //turn left
    if(currentInput.left) {
      ship.rot = 1/500 * Math.PI * elapsedTime;
      ship.a += ship.rot;
    }
    //turn right
    if(currentInput.right) {
      ship.rot = -1/500 * Math.PI * elapsedTime;
      ship.a += ship.rot;
    }
    //teleoport
    if(currentInput.j && !priorInput.j) {
      ship.x = Math.floor(Math.random() * WIDTH);
      ship.y = Math.floor(Math.random() * HEIGHT);
    }

  }

  //move bullets
  bullets.forEach(function(bullet, index){
    bullet.x += bullet.xv;
    bullet.y -= bullet.yv;
    //check for collison with asteroids
    bullet.hit(asteroids, index);
    if(bullet.x > WIDTH || bullet.x < 0 || bullet.y > HEIGHT || bullet.y < 0){
      bullets.splice(index, 1);
      SFX.asteroidExplosion.play();
    }
  });

  //move asteroids
  asteroids.forEach(function(asteroid){
    asteroid.x += asteroid.xv;
    asteroid.y += asteroid.yv;
  });
  //check for asteroid collision with player
  if(!ship.exploding){
    if(ship.numBlink === 0){
      asteroids.forEach(function(asteroid, index){
        if (distOfPoints(ship.x, ship.y, asteroid.x, asteroid.y) < asteroid.r + ship.r) {
          explode();
          SFX.playerExplosion.play();
          if(asteroid.size > 0){
            asteroids.push(new Asteroid(asteroid.x - asteroid.r, asteroid.y - asteroid.r, asteroid.size-1));
            asteroids.push(new Asteroid(asteroid.x + asteroid.r, asteroid.y + asteroid.r, asteroid.size-1));
          }
          asteroids.splice(index, 1);
        }
      });
    }
  }

  //check for asteroids colliding with other asteroids
  for(var i = 0; i < asteroids.length; i++){
    for(var j = i+1; j < asteroids.length; j++){
      if(distOfPoints(asteroids[i].x, asteroids[i].y, asteroids[j].x, asteroids[j].y) < asteroids[i].r + asteroids[j].r){
        var m1 = asteroids[i].r;
        var vx1 = asteroids[i].xv;
        var vy1 = asteroids[i].yv;
        var m2 = asteroids[j].r;
        var vx2 = asteroids[j].xv;
        var vy2 = asteroids[j].yv;

        // calculate new velocities following a collision
        asteroids[i].xv = (m1 - m2) / (m1 + m2) * vx1 + 2 * m1 / (m1 + m2) * vx2
        asteroids[i].yv = (m1 - m2) / (m1 + m2) * vy1 + 2 * m1 / (m1 + m2) * vy2
        asteroids[j].xv = 2 * m1 / (m1 + m2) * vx1 + (m2 - m1) / (m1 + m2) * vx2
        asteroids[j].yv = 2 * m1 / (m1 + m2) * vy1 + (m2 - m1) / (m1 + m2) * vy2

        // magnitude of the new velocities
        var v1 = Math.sqrt(asteroids[i].xv * asteroids[i].xv + asteroids[i].yv * asteroids[i].yv);
        var v2 = Math.sqrt(asteroids[j].xv * asteroids[j].xv + asteroids[j].yv * asteroids[j].yv);

        // if random collision make it go super fast
        if(v1 > 10 || v2 > 10){
          asteroids[i].xv = Math.floor(Math.random() * 10 + 1);
          asteroids[i].yv = Math.floor(Math.random() * 10 + 1);
          asteroids[j].xv = Math.floor(Math.random() * 10 + 1);
          asteroids[j].yv = Math.floor(Math.random() * 10 + 1);
        }
      }
    }
  }
}

function render(ctx){
  ship.exploding = ship.explodeTime > 0;
  var blink = ship.numBlink % 2 === 0;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0, WIDTH, HEIGHT);

  //draw thrust
  if (ship.thrusting && !ship.exploding && blink) {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = SHIP_SIZE / 10;
    ctx.beginPath();
    ctx.moveTo( //center back
        ship.x - ship.r * (2/3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2/3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
    );
    ctx.lineTo( //back left
        ship.x - ship.r * 5/3 * Math.cos(ship.a),
        ship.y + ship.r * 5/3 * Math.sin(ship.a)
    );
    ctx.lineTo( //back right
      ship.x - ship.r * (2/3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * (2/3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
    )
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  //draw the ship
  if(!ship.exploding) {
    if(blink) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = SHIP_SIZE / 20;
      ctx.beginPath();
      ctx.moveTo( // nose of the ship
          ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
          ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
      );
      ctx.lineTo( // rear left
          ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
          ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
      );
      ctx.lineTo( // rear right
          ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
          ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.stroke();
      if (SHOW_BOUNDS){
        ctx.strokeStyle = 'green'
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
      }
    }

    if(ship.numBlink > 0) {
      ship.blinkTime--;
      if(ship.blinkTime === 0){
        ship.blinkTime = Math.ceil(SHIP_BLINK * 30);
        ship.numBlink--;
      }
    }
  }
  else{ //draw death explosion
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 2, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.6, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.2, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * .8, 0, Math.PI * 2, false);
    ctx.fill();

    ship.explodeTime--;

    if (ship.explodeTime == 0) {
      ship = new Ship();
    }
  }

  //Wrap ship at edge of screen
  if (ship.x < 0 - ship.r){
    ship.x = WIDTH + ship.r;
  }
  else if (ship.x > WIDTH + ship.r){
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r){
    ship.y = HEIGHT + ship.r;
  }
  else if (ship.y > HEIGHT + ship.r){
    ship.y = 0 - ship.r;
  }

  //center of the ship
  ctx.fillStyle = 'red';
  ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);

  //draw bullets
  bullets.forEach(function(bullet, index){
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2, false);
    ctx.fill();
  });

  document.getElementById('score').innerHTML = "Score: " + score;
  document.getElementById('lives').innerHTML = "Lives: " + lives;

  //draw asteroids
  asteroids.forEach(function(asteroid){
    var numSides = asteroid.size + 3;
    var ax = asteroid.x;
    var ay = asteroid.y;
    var ar = asteroid.r;
    var aa = asteroid.a;

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(ax + ar * Math.cos(aa),
               ay + ar * Math.sin(aa));
    for(var i = 0; i < numSides; i++){
      ctx.lineTo(ax + ar * Math.cos(aa + i + 2 * Math.PI / numSides),
                 ay + ar * Math.sin(aa + i + 2 * Math.PI / numSides));
    }
    ctx.closePath();
    ctx.stroke();

    //wrap asteroids
    if (ax < 0 - ar){
      asteroid.x = WIDTH + ar;
    }
    else if (ax > WIDTH + ar){
      asteroid.x = 0 - ar;
    }
    if (ay < 0 - ar){
      asteroid.y = HEIGHT + ar;
    }
    else if (ay > HEIGHT + ar){
      asteroid.y = 0 - ar;
    }

    if (SHOW_BOUNDS){
      ctx.strokeStyle = 'green'
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  });

}

function explode() {
  ship.explodeTime = Math.ceil(SHIP_DEATH_TIME * 20);
  lives--;
  if (lives < 0) {
    gameOver = true;
  }
}

function startup(temp){
  ship = new Ship()
  asteroids = [];
  bullets = [];
  createAsteroids(level);
  start = null;
  score = 0;
  lives = 3;
  gameOver = false;
  level = temp;

  window.requestAnimationFrame(gameLoop);
}

function Ship() {
  this.x = WIDTH / 2,
  this.y = HEIGHT / 2,
  this.r = SHIP_SIZE/2,
  this.a = 90/180 * Math.PI,
  this.rot = 0,
  this.blinkTime = Math.ceil(SHIP_BLINK * 30),
  this.numBlink = Math.ceil(SHIP_INVULNERABLE / SHIP_BLINK),
  this.explodeTime = 0,
  this.exploding = false,
  this.thrusting = false,
  this.thrust = {
    x: 0,
    y: 0
  }
}

function Asteroid(x, y, size) {
  this.x = x;
  this.y = y;
  this.r = (size + 1) * 50 / 2
  this.xv = Math.random() * 3 * (Math.random() < .5 ? 1 : -1);
  this.yv = Math.random() * 3 * (Math.random() < .5 ? 1 : -1);
  this.size = size; //number of times it can break
  this.a = Math.random() * Math.PI * 2;
}

function Bullet(x, y, xv, yv){
  this.x = x;
  this.y = y;
  this.r = 2;
  this.xv = xv;
  this.yv = yv;
}
Bullet.prototype.hit = function(asteroids, bIndex){
  for(var i = asteroids.length - 1; i >= 0; i--){
    if(distOfPoints(this.x, this.y, asteroids[i].x, asteroids[i].y) < asteroids[i].r){
      bullets.splice(bIndex, 1);

      //split the asteroid if size > 0
      if(asteroids[i].size > 0){
        asteroids.push(new Asteroid(asteroids[i].x - asteroids[i].r, asteroids[i].y - asteroids[i].r, asteroids[i].size-1));
        asteroids.push(new Asteroid(asteroids[i].x + asteroids[i].r, asteroids[i].y + asteroids[i].r, asteroids[i].size-1));
        asteroids.splice(i, 1);
      }
      else{
        asteroids.splice(i, 1);
      }

      score += 100;
      if(asteroids.length === 0){
        gameOver = true;
      }
      return;
    }
  }
}

var button = document.getElementById('btn');
button.addEventListener('click', function(event) {
  event.preventDefault();
  startup(1);
});
