let domElements = {
    textLineFirst: document.querySelector('.line-first'),
    textLineSecond: document.querySelector('.line-second'),
    textLineThird: document.querySelector('.line-third'),
    infoWrapperRef: document.querySelector('.infoDashboard'),
    canvasRef: document.querySelector('#canvas'),
    scoreRef: document.querySelector('.score'),
}

let foodImage = new Image();
foodImage.src = "images/snakeFood-modified.png";
// foodImage.style.width = "20px";
// foodImage.style.height = "20px";

let Directions = {
    up: 1, down: 2, left: 3, right: 4
}

let GameState =
{
    Start: 1, Playing: 2, GameOver: 3
}

let Game = {
    score: 0,
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
    // updateGameState();

    //After click we will always be in state "Playing"
    document.addEventListener('click', (x) => {

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
            // console.log('GAMESTATE START WORKS');
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
            domElements.textLineSecond.textContent = 'click to start new game';
            domElements.textLineThird.textContent = 'score: ' + Game.score;
            break;
    }

}

function startGame() {
    //First, we need to reset all the data and set the initial snake position
    Game.score = 0;
    Game.food = undefined;
    Snake.headPosition = { x: 15, y: 1 }
    Snake.direction = Directions.right;
    Snake.body = [
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
        { x: 8, y: 1 }, { x: 9, y: 1 }, { x: 10, y: 1 }, { x: 11, y: 1 }, { x: 12, y: 1 }, { x: 13, y: 1 }, { x: 14, y: 1 }, { x: 15, y: 1 }
    ]

    let interval = window.setInterval(() => {
        makeMove();

        if (Game.state !== GameState.Playing) {
            window.clearInterval(interval);
            updateGameState();
        }
    }, 120)
}
//TODO : add the following functionality
// - apple -> draw/remove
// - modify the snake after it gets an apple
// - option buttons: speed up the game / go through walls / 
// - background music
// - update the score dashboard
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

            // console.log("1");
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
    console.log("2");
}

//We check both scenarios - hitting itself or going outside the game area.
function checkIfSnakeDies() {
    let x = Snake.headPosition.x;
    let y = Snake.headPosition.y;

    //if snake hits left wall / right wall / bottom / top
    if (x < 0 || x >= Game.blockSize.width - 2 || y < 0 || y >= Game.blockSize.height - 2) {
        Game.state = GameState.GameOver;
        console.log("3.1");
        return;
    }

    //if the snake hits its body
    for (var i = 0; i < Snake.body.length - 1; i++) {

        let currentBlock = Snake.body[i];

        if (Snake.headPosition.x === currentBlock.x
            && Snake.headPosition.y === currentBlock.y) {

            Game.state = GameState.GameOver;
            console.log("3.2");
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
    // debugger;

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
    console.log("4");
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

            console.log("food Place - 5");
        }


        // for (let i = 0; i < Snake.body.length; i++) {
        //     if (Snake.body[i].x !== foodX && Snake.body[i].y !== foodY) {
        //         Game.food = {
        //             x: foodX,
        //             y: foodY
        //         }
        //         console.log("food Place - 5");
        //     }
        // }
    }
}

function drawFood() {
    // Game.context.drawImage(foodImage, 26, 26, 50, 30);
    // console.log(Game.food.x);
    // console.log(Game.food.y);

    Game.context.fillStyle = 'red';
    let width = Game.blockSize.width + 1;
    let height = Game.blockSize.height + 1;
    let x = Game.food.x * (width + 1);
    let y = Game.food.y * (height + 1);

    Game.context.fillRect(x, y, width, height);
    console.log("draw food - 6");
}

function chechIfFoodWasEaten() {
    if (Snake.headPosition.x === Game.food.x
        && Snake.headPosition.y === Game.food.y) {
        Game.score += 1;
        Game.food = undefined;

        // duplicate block at tail of snake
        Snake.body.unshift(Snake.body[0]);
        console.log("7.2 - add food");

    }
}