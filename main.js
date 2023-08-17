//DOM elements
const gameSelectModal = document.getElementById("game-select-modal");
const lossScreenModal = document.getElementById("play-again-modal");
const singlePlayerBtn = document.getElementById("vs-comp");
const gameBoardEl = document.getElementById("game-board-container");
const playerBoardEl = document.getElementById("player-1-grid");
const player2BoardEl = document.getElementById("player-2-grid");
const shipyardEl = document.getElementById("shipyard-container");
const player1ShipsEl = document.getElementById("player-1-shipyard");
const player2ShipsEl = document.getElementById("player-2-shipyard");
const player1Ship = [...player1ShipsEl.querySelectorAll(".ship1")];
const player2Ship = [...player2ShipsEl.querySelectorAll(".ship")];
const finishPlacement = document.getElementById("player1-set");
const startGame = document.getElementById("player2-set");
const weGoAgane = document.getElementById("go-agane");

//variable for basic functionings
let player1ships;
let player2ships;
let player1Grid;
let player2Grid;
let turn = 1;
let vertical = false;
let winner;
let raidBossTiles = [];

//event listeners
singlePlayerBtn.addEventListener("click", init);
weGoAgane.addEventListener("click", clearGrid);
finishPlacement.addEventListener("click", renderPlayer2Grid);
startGame.addEventListener("click", hideTiles);

//drag functions
player1Ship.forEach((ship) => {
  ship.setAttribute("draggable", true);
  ship.addEventListener("dragstart", dragStart);
  ship.addEventListener("dblclick", rotateShip);
});

player2Ship.forEach((ship) => {
  ship.setAttribute("draggable", true);
  ship.addEventListener("dragstart", dragStart);
  ship.addEventListener("dblclick", rotateShip);
});

playerBoardEl.addEventListener("dragover", dragOver);
playerBoardEl.addEventListener("dragenter", dragEnter);
playerBoardEl.addEventListener("dragleave", dragLeave);
playerBoardEl.addEventListener("drop", dragDrop);

player2BoardEl.addEventListener("dragover", dragOver);
player2BoardEl.addEventListener("dragenter", dragEnter);
player2BoardEl.addEventListener("dragleave", dragLeave);
player2BoardEl.addEventListener("drop", dragDrop);

function rotateShip() {
  vertical = vertical === false ? true : false;
  player1ShipsEl.style.transform =
    player1ShipsEl.style.transform === "rotate(-90deg)"
      ? "rotate(0deg)"
      : "rotate(-90deg)";
  player2ShipsEl.style.transform =
    player2ShipsEl.style.transform === "rotate(-90deg)"
      ? "rotate(0deg)"
      : "rotate(-90deg)";
  console.log(player1ShipsEl.style.transform);
}

let currentShip;

function dragStart(e) {
  currentShip = e.target;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
}

function dragLeave(e) {
  e.target.classList;
}

function dragDrop(e) {
  let targetBoard = e.currentTarget === playerBoardEl ? "player1" : "player2";
  let grid = targetBoard === "player1" ? player1Grid : player2Grid;
  let parentEl = targetBoard === "player1" ? playerBoardEl : player2BoardEl;
  let cellId = e.target.id;
  let match = cellId.match(/r(\d+)c(\d+)/);
  let [_, row, col] = match;
  row = parseInt(row);
  col = parseInt(col);
  let shipLength = parseInt(currentShip.getAttribute("length"));
  if (vertical) {
    if (row + shipLength - 1 >= 10) {
      alert("Invalid position");
      return;
    }
    for (let i = 0; i < shipLength; i++) {
      if (grid[row + i][col] === 1) {
        alert("Invalid Placement");
        return;
      }
    }
    for (let i = 0; i < shipLength; i++) {
      let ammendTo;
      if (parentEl === player2BoardEl) {
        ammendTo = "player-2-";
      } else {
        ammendTo = "player-1-";
      }
      let cell = document.getElementById(`${ammendTo}r${row + i}c${col}`);
      cell.style.backgroundColor = "blue";
      appendToGrid(cell, targetBoard);
    }
  } else {
    if (col + shipLength - 1 >= 10) {
      alert("Invalid position");
      return;
    }
    for (let i = 0; i < shipLength; i++) {
      if (grid[row][col + i] === 1) {
        alert("Invalid Placement");
        return;
      }
    }
    for (let i = 0; i < shipLength; i++) {
      let ammendTo;
      if (parentEl === player2BoardEl) {
        ammendTo = "player-2-";
      } else {
        ammendTo = "player-1-";
      }
      let cell = document.getElementById(`${ammendTo}r${row}c${col + i}`);
      cell.style.backgroundColor = "blue";
      appendToGrid(cell, targetBoard);
    }
  }
  currentShip.style.visibility = "hidden";
}

//initalize function
function init() {
  finishPlacement.style.visibility = "visible";
  winner = false;
  hideModal();
  renderPlayer1Grid();
  generateGrid();
  return;
}

function renderPlayer1Grid() {
  singlePlayerBtn.style.visibility = "hidden";
  playerBoardEl.style.visibility = "visible";
  player1ShipsEl.style.visibility = "visible";
  player2BoardEl.style.visibility = "hidden";
}

function renderPlayer2Grid() {
  let allShipsPlaced = placements(player1Ship);
  if (!allShipsPlaced) {
    alert("Please Place All Ships!!!");
    return;
  } else {
    turn *= -1;
    playerBoardEl.style.visibility = "hidden";
    player1ShipsEl.style.visibility = "hidden";
    player2BoardEl.style.visibility = "visible";
    player2ShipsEl.style.visibility = "visible";
    player2Ship.forEach((x) => (x.style.visibility = "visible"));
    finishPlacement.style.visibility = "hidden";
    startGame.style.visibility = "visible";
    gameBoardEl.addEventListener("click", checkHit);
  }
}

function hideTiles() {
  let allShipsPlaced = placements(player2Ship);
  if (!allShipsPlaced) {
    alert("Please Place All Ships!!!");
    return;
  } else {
    playerBoardEl.style.visibility = "visible";
    player2ShipsEl.style.visibility = "hidden";
    let tiles = [...playerBoardEl.querySelectorAll("div")];
    let tiles2 = [...player2BoardEl.querySelectorAll("div")];
    tiles.forEach((x) => (x.style.backgroundColor = ""));
    tiles2.forEach((x) => (x.style.backgroundColor = ""));
    startGame.style.visibility = "hidden";
    turn *= -1;
  }
}

function placements(player) {
  for (let i = 0; i < player.length; i++) {
    if (player[i].style.visibility !== "hidden") {
      return false;
    }
  }
  return true;
}

function turnCalc() {
  turn *= -1;
  renderGameState();
}

function generateGrid() {
  player1Grid = [];
  player2Grid = [];
  for (let i = 0; i < 10; i++) {
    let newRow = [];
    for (let j = 0; j < 10; j++) {
      newRow.push(0);
      newElCreator(i, j);
      newElCreator2(i, j);
    }
    player1Grid.push([...newRow]);
    player2Grid.push([...newRow]);
  }
}

function newElCreator(i, j) {
  let newEl = document.createElement("div");
  newEl.setAttribute("id", `player-1-r${i}c${j}`);
  newEl.setAttribute("drop", "true");
  newEl.classList.add("cell", "p1");
  playerBoardEl.append(newEl);
}

function newElCreator2(i, j) {
  let newEl = document.createElement("div");
  newEl.setAttribute("id", `player-2-r${i}c${j}`);
  newEl.setAttribute("drop", "true");
  newEl.classList.add("cell", "p2");
  player2BoardEl.append(newEl);
}

function appendToGrid(cell, targetBoard) {
  let match = cell.id.match(/r(\d+)c(\d+)/);
  if (!match || match.length !== 3) {
    return;
  }
  let [_, row, col] = match;
  const rowIndex = parseInt(row);
  const colIndex = parseInt(col);

  if (targetBoard === "player1") {
    player1Grid[rowIndex][colIndex] = 1;
  } else if (targetBoard === "player2") {
    player2Grid[rowIndex][colIndex] = 1;
  }
}

function lifeCounter() {
  let p1Lives = player1Grid.reduce((x, y) => {
    return x + y.reduce((u, i) => u + i, 0);
  }, 0);
  let p2Lives = player2Grid.reduce((x, y) => {
    return x + y.reduce((u, i) => u + i, 0);
  }, 0);
  checkForWin(p1Lives, p2Lives);
}

function checkForWin(p1Lives, p2Lives) {
  if (p1Lives === -17) {
    weGoAgane.style.visibility = "visible";
    winner = true;
    return "p2 wins";
  } else if (p2Lives === -17) {
    weGoAgane.style.visibility = "visible";
    winner = true;
    return "p1 wins";
  }
}

function checkHit(e) {
  if (winner) {
    return;
  }
  const cell = e.target;
  if (turn === 1 && cell.classList.contains("p1")) {
    alert("Please Select an Opposing Tile.");
    return;
  } else if (turn === -1 && cell.classList.contains("p2")) {
    alert("Please Select an Opposing Tile.");
    return;
  }
  if (cell.classList.contains("clicked")) {
    alert("Cell has Already Been Selected. Please choose another!");
    return;
  }
  let player = turn === 1 ? player2Grid : player1Grid;
  const match = cell.id.match(/r(\d+)c(\d+)/);
  const row = parseInt(match[1]);
  const col = parseInt(match[2]);
  if (player[row][col] === 1) {
    player[row][col] *= -1;
    cell.style.backgroundColor = "green";
  } else {
    cell.style.backgroundColor = "red";
  }
  cell.classList.add("clicked");
  turn *= -1;
//   renderPlayerTurn();
  lifeCounter();
}

function resetShips() {
  player1Ship.forEach((x) => (x.style.visibility = "visible"));
}

function clearGrid() {
  playerBoardEl.innerHTML = "";
  player2BoardEl.innerHTML = "";
  player1Grid = "";
  player2Grid = "";
  weGoAgane.style.visibility = "hidden";
  resetShips();
  init();
}

function showWinner() {
  if (winner) {
    
  }
}

function hideModal() {
  gameSelectModal.style.display = "none";
}

function randoNum() {
  return Math.floor(Math.random() * 10);
}

// function summonRaidBoss(){
//     let row = randoNum()
//     let col = randoNum()
//     console.log(row, col)
//     if(!raidBossTiles.includes([row, col])){
//         raidBossTiles.push([row, col])
//         raidBossHitDetection(row, col)
//     }else{
//         summonRaidBoss();
//     }
// }

// function raidBossHitDetection(row, column){
//     if(player1[row][column]===1){

//         cell.style.backgroundColor = 'green';
//     }
//     turn*=-1;
// }
