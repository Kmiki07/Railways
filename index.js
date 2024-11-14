import { AppState } from "./state.js";
import { render, renderLeaderboard } from "./render.js";

//Data
//Elements
//Rendering

//Data
let difficulty = "easy";
const state = new AppState();

let timerInterval;

//Elements
const divMenu = document.querySelector("div#menu");
const divGame = document.querySelector("div#game");
const divDescription = document.querySelector("div#description")
const divGameRegion = document.querySelector("div#game-region");
const buttonDescription = document.querySelector("#desc");
const buttonStart = document.querySelector("#start");
const buttonBackFromDescription = document.querySelector("#back-from-description");
const buttonBackFromGame = document.querySelector("#back-from-game");
const buttonEasy = document.querySelector("#easy");
const buttonHard = document.querySelector("#hard");
const timer = document.querySelector("#timer");
const nameInput = document.querySelector("#name");
const usernameField = document.querySelector("#username");
const victoryMessage = document.querySelector("#victory-message");
const leaderboard = document.querySelector("#leaderboard");
const victoryPopup = document.querySelector("#victory-popup");
const newGameButton = document.querySelector("#new-game");
const backToMenuButton = document.querySelector("#back-from-gameover");
const divGameData = document.querySelector("#game-data");

buttonStart.addEventListener("click", onStartClick);
buttonDescription.addEventListener("click", onDescriptionClick);
buttonBackFromDescription.addEventListener("click", onBackFromDescriptionClick);
buttonBackFromGame.addEventListener("click", onBackFromGameClick);
buttonEasy.addEventListener("click", onEasyClick);
buttonHard.addEventListener("click", onHardClick);
divGameRegion.addEventListener("mousedown", onFieldClick);
divGameRegion.addEventListener("contextmenu", onContextMenu);
newGameButton.addEventListener("click", onStartClick);
backToMenuButton.addEventListener("click", onBackFromGameClick);

function onContextMenu(event) {
    event.preventDefault();
}

function onFieldClick(event) {
    event.preventDefault();
    if(!event.target.matches("img") || divGameRegion.classList.contains("finished")) {
        return;
    }

    const td = event.target.parentNode;
    const tr = td.parentNode;
    const y = td.cellIndex;
    const x = tr.rowIndex;

    const gameOver = state.click(x, y, event.target, event.button);
    console.log(gameOver);
    if(gameOver) {
        GameOver();
    }
}

function GameOver() {
    stopTimer();
    victoryMessage.classList.remove("hidden");
    victoryPopup.classList.remove("hidden");
    divGameRegion.classList.add("finished");

    const time = timer.textContent;
    const name = nameInput.value;
    state.addToLeaderboard(difficulty, name, time);
    const sortedLeaderboard = state.leaderboard[difficulty]
        .sort((a, b) => new Date(`1970-01-01T${a.time}Z`) - new Date(`1970-01-01T${b.time}Z`))
        .slice(0, 3);
    leaderboard.innerHTML = renderLeaderboard(sortedLeaderboard);

    //megjeleníti a toplistát
}

function startTimer() {
    timer.textContent = "00:00";
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        timer.textContent = new Date(seconds * 1000).toISOString().substr(14, 5);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function onDescriptionClick() {
    divDescription.classList.remove("hidden");
    divMenu.classList.add("hidden");
    divGame.classList.add("hidden");
}
function onStartClick() {
    usernameField.textContent = nameInput.value;
    divMenu.classList.add("hidden");
    divDescription.classList.add("hidden");
    divGame.classList.remove("hidden");
    victoryMessage.classList.add("hidden");
    leaderboard.innerHTML = ``;
    state.init(difficulty);
    divGameRegion.innerHTML = render(state);
    divGameRegion.classList.remove("finished");
    victoryPopup.classList.add("hidden");
    startTimer();

    // Set the class based on difficulty
    if (difficulty === "easy") {
        divGameRegion.classList.add("easy");
        divGameRegion.classList.remove("hard");
        divGameData.classList.add("easy");
        divGameData.classList.remove("hard");
    } else {
        divGameRegion.classList.add("hard");
        divGameRegion.classList.remove("easy");
        divGameData.classList.add("hard");
        divGameData.classList.remove("easy");
    }
}
function onBackFromDescriptionClick() {
    divDescription.classList.add("hidden");
    divGame.classList.add("hidden");
    divMenu.classList.remove("hidden");
}
function onBackFromGameClick() {
    divGame.classList.add("hidden");
    divDescription.classList.add("hidden");
    divMenu.classList.remove("hidden");
    victoryPopup.classList.add("hidden");
    stopTimer();
}
function onEasyClick() {
    difficulty = "easy";
    buttonEasy.classList.add("selected");
    buttonHard.classList.remove("selected");
}
function onHardClick() {
    difficulty = "hard";
    buttonEasy.classList.remove("selected");
    buttonHard.classList.add("selected");
}

//Rendering