// MUST INCLUDE CONSTANTS.JS BEFORE THIS IN THE HTML
// ALL THE VARIABLES THAT CAN BE ADJUSTED SHOULD BE ADJUSTED IN CONSTANTS.JS
var WIDTH = 300;
var HEIGHT = 700;
var GUNDA_GRID_NUMBER = 3;
var MY_CANVAS_COLOR = "#333";

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

function Car(x, y) {
  this.height = 100;
  this.width = 100;
  this.position = new Vector(x, y);
  this.color = "#000";
  this.hasCrashed = false;
  this.score = 0;

  this.moveRight = () => {
    if (this.position.x !== 200) {
      this.position.x += 100;
    }
  };
  this.moveLeft = () => {
    if (this.position.x !== 0) {
      this.position.x -= 100;
    }
  };
  this.handleCollision = (gunda) => {
    if (
      this.position.x < gunda.position.x + gunda.width &&
      this.position.x + this.width > gunda.position.x &&
      this.position.y < gunda.position.y + gunda.height &&
      this.position.y + this.height > gunda.position.y
    ) {
      this.hasCrashed = true;
    }
  };

  this.handleScore = (gunda) => {
    if (
      gunda.position.y >= this.position.y + this.height &&
      !gunda.hasCrossedPlayer
    ) {
      gunda.hasCrossedPlayer = true;
      this.score += 1;
    }
  };
}

function Gunda() {
  this.color = "red";
  this.position = generateRandomVectorForGundaInit();
  this.velocity = new Vector(0, 2);
  this.width = 100;
  this.height = 100;
  this.hasCrossedPlayer = false;

  this.update = () => {
    this.position = addVectors(this.position, this.velocity);
  };
}

function GundaGrid() {
  this.width = 300;
  this.height = 260;
  this.gap = 160;
  generateGundas = function () {
    var gundas = [new Gunda(), new Gunda()];

    if (
      gundas[0].position.x < gundas[1].position.x + gundas[1].width &&
      gundas[0].position.x + gundas[0].width > gundas[1].position.x &&
      gundas[0].position.y < gundas[1].position.y + gundas[1].height &&
      gundas[0].position.y + gundas[0].height > gundas[1].position.y
    ) {
      gundas = generateGundas();
    }
    return gundas;
  };
  this.gundas = generateGundas();

  this.isGundaGridGone = () => {
    if (
      this.gundas[0].position.y >=
        (this.height + this.gap) * GUNDA_GRID_NUMBER &&
      this.gundas[1].position.y >= (this.height + this.gap) * GUNDA_GRID_NUMBER
    ) {
      this.repositionGundaGrid();
    }
  };

  this.repositionGundaGrid = () => {
    this.gundas = generateGundas();
  };

  this.update = () => {
    this.isGundaGridGone();
  };
}

function Canvas() {
  this.updateCalled = 0;
  this.canvas = document.createElement("canvas");
  this.ctx = this.canvas.getContext("2d");
  document.body.appendChild(this.canvas);

  this.canvas.width = WIDTH;
  this.canvas.height = HEIGHT;
  this.canvas.style.background = MY_CANVAS_COLOR;
  this.paceIncrement = new Vector(0, 0.01);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      this.myCar.moveRight();
    }
    if (event.key === "ArrowLeft") {
      this.myCar.moveLeft();
    }
  });

  this.setup = () => {
    this.myCar = new Car(100, 450);
    this.myGundaGridList = [];
    this.myGundas = [];

    // adding gunda grids to a array for later use
    for (var i = 0; i < GUNDA_GRID_NUMBER; i++) {
      this.myGundaGridList.push(new GundaGrid());
    }

    // generating gunda grid at appropriate positions
    for (let i = 0; i < this.myGundaGridList.length - 1; i++) {
      var gundaGrid = this.myGundaGridList[i + 1];
      for (let j = 0; j < gundaGrid.gundas.length; j++) {
        var gunda = gundaGrid.gundas[j];
        gunda.position.y -= 420 * (i + 1);
      }
    }

    // adding gunda to gundas list to check for collision later
    for (let i = 0; i < this.myGundaGridList.length; i++) {
      var gundaGrid = this.myGundaGridList[i];
      for (let j = 0; j < gundaGrid.gundas.length; j++) {
        var gunda = gundaGrid.gundas[j];
        this.myGundas.push(gunda);
      }
    }
  };

  this.update = () => {
    this.updateCalled += 1;

    // clear screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // fill player car

    this.ctx.fillStyle = this.myCar.color;
    this.ctx.fillRect(this.myCar.position.x, this.myCar.position.y, 100, 100);

    // player/gunda interaction
    for (var i = 0; i < this.myGundas.length; i++) {
      this.myCar.handleCollision(this.myGundas[i]);
      this.myCar.handleScore(this.myGundas[i]);
    }

    // repaint gundas
    this.myGundas = [];
    for (var i = 0; i < this.myGundaGridList.length; i++) {
      var myGundaGrid = this.myGundaGridList[i].gundas;
      for (var j = 0; j < myGundaGrid.length; j++) {
        var gunda = this.myGundaGridList[i].gundas[j];
        this.ctx.fillStyle = gunda.color;
        this.ctx.fillRect(gunda.position.x, gunda.position.y, 100, 100);
        gunda.update();
        this.myGundas.push(gunda);
      }
      this.myGundaGridList[i].update();
    }
    if (this.updateCalled % 1000 === 0) {
      console.log('call bhayo hai');
      for (const gundaGrid of this.myGundaGridList) {
        for (const gunda of gundaGrid.gundas) {
          gunda.velocity = addVectors(gunda.velocity, this.paceIncrement);
          this.paceIncrement.y += 0.01;
        }
      }
    }

    this.ctx.fillStyle = "#FCE75B";
    this.ctx.font = "18pt san-serif";
    this.ctx.fillText("Score: " + this.myCar.score, 10, 50);

    if (!this.myCar.hasCrashed) {
      requestAnimationFrame(() => this.update());
    } else {
      // handling game over
      window.addEventListener(
        "keydown",
        function (event) {
          if (event.key === " ") {
            window.location.reload(false);
          }
        }.bind(this)
      );

      // game over screen
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

      this.ctx.font = "18pt san-serif";
      this.ctx.fillStyle = "yellow";
      this.ctx.fillText("SCORE: " + this.myCar.score, 100, 300);
      this.ctx.fillStyle = "red";
      this.ctx.fillText("GAME OVER!", 75, 350);
      this.ctx.fillText("SPACE TO RESTART", 40, 375);
    }
  };

  this.start = () => {
    this.setup();
    requestAnimationFrame(() => this.update());
  };

  this.startScreen = () => {
    window.addEventListener("keydown", (event) => {
      if (event.key === " ") {
        this.start();
      }
    });
    // game over screen
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = "red";
    this.ctx.font = "18pt san-serif";
    this.ctx.fillText("CAR GAME", 80, 325);
    this.ctx.fillText("CROSS CARS THEN MOVE", 4, 350);
    this.ctx.fillText("SPACE TO START", 50, 375);
    this.ctx.fillText("ARROW KEY", 75, 425);
    this.ctx.fillText("FOR CONTROL", 65, 450);
  };

  this.startScreen();
}

// lord random number here
function generateRandomFrom(min, max) {
  return min + Math.random() * (max - min);
}

// vector operations below

function generateRandomVector(minX, maxX, minY, maxY) {
  return new Vector(
    generateRandomFrom(minX, maxX),
    generateRandomFrom(minY, maxY)
  );
}

function addVectors(vector1, vector2) {
  return new Vector(vector1.x + vector2.x, vector1.y + vector2.y);
}

function multiplyVectorWithScalar(vector, scalar) {
  return new Vector(vector.x * scalar, vector.y * scalar);
}

function subtractVectors(vector1, vector2) {
  return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
}

function divideVectorWithScalar(vector, scalar) {
  return new Vector(vector.x / scalar, vector.y / scalar);
}

// gunda specific operations
function generateRandomVectorForGundaInit() {
  return new Vector(
    Math.floor(generateRandomFrom(0, 3)) * 100,
    generateRandomFrom(-260, -100)
  );
}

new Canvas();
