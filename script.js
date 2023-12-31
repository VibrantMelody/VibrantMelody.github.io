const ghostFaces = ['ghostBlue', 'ghostYellow', 'ghostRed', 'ghostGreen']
const swoop = new Audio('assets/swoop.mp3');

const score = document.getElementById('score');
let currentScore = Number(score.innerText);

const mainContainer = document.getElementById('main-container')
const sideContainer = document.getElementById('side-container')
let horizontalBoxes, verticalBoxes;

function randomNumGenerator (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const pacman = document.createElement('div');
const ghost = document.createElement('div');

function createGhost () {
    ghost.setAttribute('class', 'ghost');
    ghost.style.backgroundImage = `url(assets/${ghostFaces[randomNumGenerator(0,3)]}.svg)`
    const ghostBox = document.querySelector(`#main-container > :nth-child(${randomNumGenerator(1, horizontalBoxes * verticalBoxes)})`)
    ghostBox.appendChild(ghost);
}
function displayGrid () {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
    document.getElementById('side-container').style.display = 'flex';

    horizontalBoxes = Math.ceil(mainContainer.getBoundingClientRect().width / 76.4);
    verticalBoxes = Math.ceil(mainContainer.getBoundingClientRect().height / 76.4);

    for (let i = 1; i <= horizontalBoxes * verticalBoxes; i++) {
        const childElement = document.createElement('div');
        childElement.className = `boxes box${i}`;
        childElement.setAttribute('style', `width: ${100 / horizontalBoxes}%; height: ${100 / verticalBoxes}%;`)
        mainContainer.appendChild(childElement);
    }

    let i = 1, boxOpacityIntervalDuration = (756 / (horizontalBoxes * verticalBoxes));
    const boxOpacityInterval = setInterval (() => {
        if (i <= horizontalBoxes * verticalBoxes) {
            document.querySelector(`#main-container > :nth-child(${i})`).style.opacity = 1;
        } else {
            clearInterval(boxOpacityInterval)
        } 
        i = i + 1;
    }, boxOpacityIntervalDuration);

    pacman.setAttribute('id', 'pacman')
    const middleBox = document.querySelector(`#main-container > :nth-child(${ Math.round((horizontalBoxes * verticalBoxes) / 2 - (horizontalBoxes / 2)) })`)
    middleBox.appendChild(pacman);
    createGhost();
} 

const mover = (dir) => {
    interval = setInterval(move, intervalDuration, dir)
}

const pausePage = document.getElementById('pause-page');
function switchDirection (direction) {
    switch (direction) {
        case 'ArrowUp':
            clearInterval(interval);
            pausePage.style.display = 'none'
            move('up')
            mover('up')
            pacman.style.backgroundImage = 'url(assets/pacmanUp.png)';
            snakeDirection = 'up'
            isPaused = false;
            break;
        case 'ArrowDown':
            clearInterval(interval);
            pausePage.style.display = 'none'
            move('down');
            mover('down')
            pacman.style.backgroundImage = 'url(assets/pacmanDown.png)';
            snakeDirection = 'down'
            isPaused = false;
            break;
        case 'ArrowLeft':
            clearInterval(interval);
            pausePage.style.display = 'none'
            move('left');
            mover('left')
            pacman.style.backgroundImage = 'url(assets/pacmanLeft.png)';
            snakeDirection = 'left'
            isPaused = false;
            break;
        case 'ArrowRight':
            clearInterval(interval);
            move('right');
            pausePage.style.display = 'none'
            mover('right')
            pacman.style.backgroundImage = 'url(assets/pacmanRight.png)';
            snakeDirection = 'right'
            isPaused = false;
            break;
        case 'Space': 
            if (isPaused) {
                if (snakeDirection !== 'none' ){
                    mover(snakeDirection);
                    isPaused = false;
                }
                pausePage.style.display = 'none'
            } else {
                clearInterval(interval);
                isPaused = true;
                pausePage.style.display = 'flex'
            }
            break;
    }
}

let interval, intervalDuration = 300;
function move(direction){
    let parentBox, currentParentClass, difference, siblingElement;
    switch (direction) {
        case 'right': 
            siblingElement = pacman.parentElement.nextElementSibling;
            parentBox =  siblingElement != null ? siblingElement : mainContainer.firstElementChild;
            break;
        case 'left':
            siblingElement = pacman.parentElement.previousElementSibling;
            parentBox =  siblingElement != null ? siblingElement : mainContainer.lastElementChild;
            break;
        case 'up': 
            currentParentClass = pacman.parentElement.classList[1].match(/\d+/g);
            parentBox = document.querySelector(`.${`box${parseInt(currentParentClass[0]) - horizontalBoxes}`}`);
            difference = currentParentClass[0] - horizontalBoxes;
            difference <= 0 && (parentBox = document.querySelector(`.${`box${difference + (horizontalBoxes * verticalBoxes)}`}`));
            break;
        case 'down': 
            currentParentClass = pacman.parentElement.classList[1].match(/\d+/g);
            parentBox = document.querySelector(`.${`box${parseInt(currentParentClass[0]) + horizontalBoxes}`}`);
            difference = parseInt(currentParentClass[0]) + horizontalBoxes;
            difference > (horizontalBoxes * verticalBoxes) && (parentBox = document.querySelector(`.${`box${difference - (horizontalBoxes * verticalBoxes)}`}`))
            break;
    }

    pacman.remove();
    parentBox.appendChild(pacman);
    if (parentBox == ghost.parentElement) {
        ghost.remove();
        createGhost();
        intervalDuration >= 200 && (intervalDuration -= 20);
        swoop.play();
        currentScore += 10;
        score.innerText = currentScore;
    }
}

let isTouchDevice = false;
// calculating touchinput to figure out direction
let xDirectionStart, yDirectionStart, startTime, tap = -1,  direction;
window.addEventListener('touchstart', (e) => {
    isTouchDevice = true;
    xDirectionStart = (e.touches[0].clientX)
    yDirectionStart = (e.touches[0].clientY)})
window.addEventListener('touchend', (e) => {
    const xDirectionEnd = (e.changedTouches[0].clientX)
    const yDirectionEnd = (e.changedTouches[0].clientY)

    const xDirectionShift =  xDirectionStart - xDirectionEnd
    const yDirectionShift =  yDirectionStart - yDirectionEnd

    if (Math.abs(xDirectionShift) > Math.abs(yDirectionShift)) {

        xDirectionShift > 0 ?  direction = 'ArrowLeft' : direction = 'ArrowRight';
    }
    else {
        yDirectionShift > 0 ?  direction = 'ArrowUp' : direction = 'ArrowDown';
    }


    switchDirection(direction);
})

let lastKeyPressed, snakeDirection = 'none', isPaused = true, keyCounter;
const alertBox = document.getElementById('alertBox');

// keyboard input from user
window.addEventListener('keyup', (events) => {

    lastKeyPressed === events.code ? keyCounter ++ : keyCounter = 0;
    if (keyCounter >= 3) {
        if (events.code !== 'Space') {
            alertBox.children[0].innerHTML = "Slow down, You're gonna get us killed"
            alertBox.style.display = 'flex';

            setTimeout(() => {
                alertBox.style.display = 'none';
                alertBox.children[0].innerHTML = "";
            }, 2000)
        }
    }

    if (lastKeyPressed === events.code){
        if (events.code !== 'Space'){
            return;
        }
    }

    switchDirection(events.code);
    lastKeyPressed = events.code;
})
