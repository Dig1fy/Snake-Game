let domElements = {
    startGameArea: document.querySelector("body > div.infoDashboard > div"),
    textLineFirst: document.querySelector('.line-first'),
    textLineSecond: document.querySelector('.line-second'),
    textLineThird: document.querySelector('.line-third'),
    infoWrapperRef: document.querySelector('.infoDashboard'),
    canvasRef: document.querySelector('#canvas'),
    scoreRef: document.querySelector('.score'),
    chooseSpeedOptionsRef: document.querySelector('body > div.additionalOptions > div.dropdown'),
    currentSpeedRef: document.querySelector('body > div.additionalOptions > div.current-speed > a'),
    goThroughWallCheckBoxsRef: document.querySelector("#walls")
}

domElements.chooseSpeedOptionsRef.addEventListener('click', checkSpeedChoice);


const foodImage = new Image();
foodImage.src = "images/modifiedApple.png";
const eatAnAplleSound = new Audio();
eatAnAplleSound.src = "sounds/eatAnApple.mp3";
const gameOverSound = new Audio();
gameOverSound.src = "sounds/gameOver.mp3"

let Directions = {
    up: 1,
    down: 2,
    left: 3,
    right: 4
}

let GameState =
{
    Start: 1,
    Playing: 2,
    GameOver: 3
}
let SpeedOptions = {
    baseSpeedIndex: 120,
    speedType: {
        normal: "normal",
        fast: "fast",
        increasing: "increasing"
    }
}

let Game = {
    score: 0,
    speed: SpeedOptions.speedType.normal,
    context: undefined,
    state: GameState.Playing,
    blockSize: {
        width: 25,
        height: 25
    },
    food: undefined
}

let Snake = {
    headPosition: {
        x: 0,
        y: 0
    },
    direction: Directions.right,
    newDirection: undefined,
    body: []
}

window.onload = initializeGame;


function initializeGame(e) {
    Game.context = domElements.canvasRef.getContext('2d');
    Game.state = GameState.Start;


    //After click we will always be in state "Playing"
    domElements.startGameArea.addEventListener('click', function () {

        if (Game.state !== GameState.Playing) {
            Game.state = GameState.Playing
            updateGameState();
            startGame();
        }
    });
}

function updateGameState(e) {
    switch (Game.state) {
        case (GameState.Start):
            //This will be shown on initially 
            domElements.infoWrapperRef.style.display = 'block';
            domElements.textLineFirst.textContent = 'START NEW GAME';
            domElements.textLineSecond.textContent = '';
            domElements.textLineThird.textContent = '';
            break;

        //No info should be shown on the display
        case (GameState.Playing):
            domElements.infoWrapperRef.style.display = 'none';
            // startGame();
            break;

        //Unhide the div wrapper and show the final result/score
        case (GameState.GameOver):
            domElements.infoWrapperRef.style.display = 'block';
            domElements.textLineFirst.textContent = 'GAME OVER';
            domElements.textLineSecond.textContent = 'Your score: ' + Game.score;
            domElements.textLineThird.textContent = 'Click here to start new game';
            gameOverSound.play();
            break;
    }
}

//Reset all the data and set the initial snake position
function startGame() {
    Game.score = 0;
    Game.food = undefined;
    Snake.headPosition = { x: 2, y: 1 }
    Snake.direction = Directions.right;
    Snake.body = [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }]

    let interval = window.setInterval(() => {
        makeMove();

        if (Game.state !== GameState.Playing) {
            window.clearInterval(interval);
            updateGameState();
        }
    }, setGameSpeed())
}

//After user's choice, we set the interval time accordingly
function setGameSpeed() {
    switch (Game.speed) {
        case SpeedOptions.speedType.normal: return SpeedOptions.baseSpeedIndex;
        case SpeedOptions.speedType.fast: return SpeedOptions.baseSpeedIndex * 0.70;
        case SpeedOptions.speedType.increasing: return SpeedOptions.baseSpeedIndex *= 0.98;
    }
}

//Check which of the 3 options has been selected and adjust the game speed values
function checkSpeedChoice(e) {
    let choice = e.target.textContent;

    switch (choice.toLowerCase()) {
        case SpeedOptions.speedType.normal:
            Game.speed = SpeedOptions.speedType.normal;
            domElements.currentSpeedRef.textContent = Game.speed;
            break;
        case SpeedOptions.speedType.fast:
            Game.speed = SpeedOptions.speedType.fast;
            domElements.currentSpeedRef.textContent = Game.speed;
            break;
        case SpeedOptions.speedType.increasing:
            Game.speed = SpeedOptions.speedType.increasing;
            domElements.currentSpeedRef.textContent = Game.speed;
            break;
    }
}
//TODO : add the following functionality
// - options : go through walls 
function makeMove() {
    checkSnakeDirection();
    changeSnakePosition();
    checkIfSnakeDies();
    updateScore();
    clearCanvas();
    drawSnake();
    placeFood();
    drawFood();
    chechIfFoodWasEaten();
}

function checkSnakeDirection() {
    document.addEventListener('keydown', (e) => {

        if (Game.state === GameState.Playing) {
            //We make an additional check (for x / y) to make sure that the snake won't be able to change it's direction to 180°
            // debugger;
            if (e.code === "ArrowLeft" && Snake.direction !== Directions.right) {
                Snake.newDirection = Directions.left;
            } else if (e.code === "ArrowDown" && Snake.direction !== Directions.up) {
                Snake.newDirection = Directions.down;
            } else if (e.code === "ArrowRight" && Snake.direction !== Directions.left) {
                Snake.newDirection = Directions.right;
            } else if (e.code === "ArrowUp" && Snake.direction !== Directions.down) {
                Snake.newDirection = Directions.up;
            }
        }
    })
}

function changeSnakePosition() {
    if (Snake.newDirection) {
        Snake.direction = Snake.newDirection;

        //Once we've updated the next direction, we set it to undefined, waiting for new direction from the listener
        Snake.newDirection = undefined;
    }

    let sX = Snake.headPosition.x;
    let sY = Snake.headPosition.y;

    switch (Snake.direction) {
        case Directions.up: sY -= 1; break;
        case Directions.down: sY += 1; break;
        case Directions.left: sX -= 1; break;
        case Directions.right: sX += 1; break;
    }

    Snake.headPosition = {
        x: sX, y: sY
    }

    //We add new head block and remove one block from the tail
    Snake.body.push(Snake.headPosition);
    Snake.body.shift();
}

//We check both scenarios - hitting itself or going outside the game area.
function checkIfSnakeDies() {
    let x = Snake.headPosition.x;
    let y = Snake.headPosition.y;

    //if snake hits left wall / right wall / bottom / top
    if (x < 0 || x >= Game.blockSize.width - 2 || y < 0 || y >= Game.blockSize.height - 2) {
        Game.state = GameState.GameOver;
        return;
    }

    //if the snake hits itself
    for (var i = 0; i < Snake.body.length - 1; i++) {

        let currentBlock = Snake.body[i];

        if (Snake.headPosition.x === currentBlock.x
            && Snake.headPosition.y === currentBlock.y) {

            Game.state = GameState.GameOver;
            return;
        }
    }
}

function updateScore() {
    domElements.scoreRef.textContent = 'Score: ' + Game.score;
}

function clearCanvas() {
    Game.context.clearRect(0, 0, 625, 625);
}

function drawSnake() {
    Game.context.fillStyle = 'black';

    let width = Game.blockSize.width + 1;
    let height = Game.blockSize.height + 1;

    for (let i = Snake.body.length - 1; i >= 0; i--) {

        let x = Snake.body[i].x * (width + 1);
        let y = Snake.body[i].y * (height + 1);

        Game.context.fillStyle = (i == Snake.body.length - 1) ? "darkgreen" : "white";
        Game.context.fillRect(x, y, width, height);

        //Like a border style for each of the snake blocks(body). Looks better :) 
        Game.context.strokeStyle = "darkblue";
        Game.context.strokeRect(x, y, width, height);
    }
}

function placeFood() {
    //We keep the loop until we find a free block on the game area where we can place the food.
    while (!Game.food) {

        let foodX = Math.floor(Math.random() * (Game.blockSize.width - 2));
        let foodY = Math.floor(Math.random() * (Game.blockSize.height - 2));

        let isFoodOnSnake = Snake.body.some(z => z.x === foodX && z.y === foodY)

        if (!isFoodOnSnake) {
            Game.food = {
                x: foodX,
                y: foodY
            }
        }
    }
}

function drawFood() {

    let width = Game.blockSize.width + 1;
    let height = Game.blockSize.height + 1;
    let x = Game.food.x * (width + 1);
    let y = Game.food.y * (height + 1);

    Game.context.drawImage(foodImage, x, y, width, height);
}

//If the snake hits an apple, we adjust the score and clear the food coordinates
function chechIfFoodWasEaten() {
    if (Snake.headPosition.x === Game.food.x
        && Snake.headPosition.y === Game.food.y) {

        Game.score += 1;
        Game.food = undefined;
        eatAnAplleSound.play();
        // duplicate block at tail of snake
        Snake.body.unshift(Snake.body[0]);
    }
}