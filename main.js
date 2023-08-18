//DOM elements
const gameSelectModal = document.getElementById("game-select-modal");
const lossScreenModal = document.getElementById("play-again-modal");
const singlePlayerBtn = document.getElementById("vs-comp");
const turnEl = document.getElementById('turn-display')
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
const bodyEl = document.querySelector('body')

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
        renderMessages('drop')
      return;
    }
    for (let i = 0; i < shipLength; i++) {
      if (grid[row + i][col] === 1) {
        renderMessages('drop')
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
      cell.style.backgroundColor = 'yellow';
      appendToGrid(cell, targetBoard);
    }
  } else {
    if (col + shipLength - 1 >= 10) {
      renderMessages('drop')
      return;
    }
    for (let i = 0; i < shipLength; i++) {
      if (grid[row][col + i] === 1) {
        renderMessages('drop')
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
      cell.style.backgroundColor = "yellow";
      appendToGrid(cell, targetBoard);
    }
  }
  currentShip.style.visibility = "hidden";
}

//initalize function
function init() {
    bodyEl.style.backgroundImage = 'url(ship-background.gif)'
  finishPlacement.style.visibility = "visible";
  lossScreenModal.style.display = 'none';
  winner = false;
  renderMessages('init')
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
    renderMessages('placement')
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
    renderMessages('placement');
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
    renderMessages(turn)
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
    renderMessages('player2')
    weGoAgane.style.visibility = "visible";
    winner = true;
    return;
  } else if (p2Lives === -17) {
    renderMessages('player1')
    weGoAgane.style.visibility = "visible";
    winner = true;
    return;
  }
}

function checkHit(e) {
  if (winner) {
    return;
  }
  const cell = e.target;
  if (turn === 1 && cell.classList.contains("p1")) {
    renderMessages("opponent");
    return;
  } else if (turn === -1 && cell.classList.contains("p2")) {
    renderMessages("opponent");
    return;
  }
  if (cell.classList.contains("clicked")) {
    renderMessages("selected");
    return;
  }
  let player = turn === 1 ? player2Grid : player1Grid;
  const match = cell.id.match(/r(\d+)c(\d+)/);
  const row = parseInt(match[1]);
  const col = parseInt(match[2]);
  if (player[row][col] === 1) {
    player[row][col] *= -1;
    cell.classList.add('class', 'hit');
  } else {
    cell.classList.add('class', 'miss');
  }
  cell.classList.add("clicked");
  turn *= -1;
  renderMessages(turn)
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

function hideModal() {
  gameSelectModal.style.display = "none";
}

//ai integration & random board placements
// function randoNum(x) {
//   return Math.floor(Math.random() * (x));
// }

// function randomizePlacement(){
//     let amountOfVert = randoNum(player2Ship.length)
//     let remaining = player2Ship.length - amountOfVert
//     for(let i=0;i<amountOfVert;i++){
//         let currShip = parseInt(player2Ship[i].getAttribute('length'))
//         let randomShipRow = randoNum(currShip)
//         let randomShipCol = randoNum(10)
//         // let random
//         let placeable = checkForCollision(randomShipRow, randomShipCol, currShip)
//         if(placeable){
//             let cell = `player-2-r${randomShipRow}c${randomShipCol}`
//             appendToGrid(cell, 'player2')
//         }else{
//             i--
//         }
//     }
// }

// function checkForCollision(col, row, size){
//     for(let i=0;i<size;i++){
//         if(player2Grid[row+i][col]===1||row===9||col===9){
//             return false
//         }
//     }
//     return true;
// }

function renderMessages(x){
    if(x==='drop'){
        turnEl.innerHTML = "Please place your Ship within the alloted tiles!";
            setTimeout(()=>{
                turnEl.innerHTML = 'Please finish placing your ships.'
            },2500);
        return;
    }else if(x==='placement'){
        turnEl.innerHTML = 'Please place all your ships before progressing.'
        setTimeout(()=>{
            turnEl.innerHTML = 'Please finish placing your tiles.'
        },2500);
        return;
    }else if(x==='player2'){
        bodyEl.style.backgroundImage = 'url(game-over-bg.gif)'
        turnEl.innerHTML = 'Game Over! Player 2 Wins!'
        setTimeout(()=>{
            bodyEl.style.backgroundImage = 'url(static-nuke.jpg)'
        },9000)
        setTimeout(()=>{
            lossScreenModal.style.display = 'flex'
        },10000)
    }else if(x==='player1'){
        bodyEl.style.backgroundImage = 'url(game-over-bg.gif)'
        turnEl.innerHTML = 'Game Over! Player 1 Wins!'
        setTimeout(()=>{
            bodyEl.style.backgroundImage = 'url(static-nuke.jpg)'
        },9000)
        setTimeout(()=>{
            lossScreenModal.style.display = 'flex'
        },10000)
    }else if(x==='init'){
        turnEl.innerHTML = 'Please place your pieces!'
    }else if(x==='selected'){
        turnEl.innerHTML = 'This tile has already been selected!'
        setTimeout(()=>{
            turnEl.innerHTML = 'Please select another tile!'
        }, 1000)
    }else if(x==='opponent'){
        turnEl.innerHTML = 'Please select an opposing tile!'
    }else if(x===1){
        turnEl.innerHTML = 'Player 1\'s turn!'
        setTimeout(()=>{
            turnEl.innerHTML = 'Player 1\'s turn!'
        },500)
    }else if(x===-1){
        turnEl.innerHTML = 'Player 2\'s turn!'
        setTimeout(()=>{
            turnEl.innerHTML = 'Player 1\'s turn!'
        },500)
    }else if(x==='hit'){
        turnEl.innerHTML = 'A Ship Was Hit!'
    }
}