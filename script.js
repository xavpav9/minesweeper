const gameBoard = document.querySelector(".gameboard");
const submitBtn = document.querySelector(".submitBtn");
const sizeInput = document.querySelector("#size");
const minesInput = document.querySelector("#mines");
const winScreen = document.querySelector(".win-screen");
const loseScreen = document.querySelector(".lose-screen");
let currentSize = 0;
let mousedownOnGameBoard = false;

submitBtn.addEventListener("click", evt => {
  [...gameBoard.children].forEach(child => child.remove());

  if ([...submitBtn.classList].includes("start")) createGrid(+sizeInput.value, +minesInput.value);

  submitBtn.classList.toggle("start");
  submitBtn.classList.toggle("reset");

  validateInputs(evt);
});

[sizeInput, minesInput].forEach(input => {
  ["click", "input"].forEach(event => {
    input.addEventListener(event, evt => {
      validateInputs(evt);
    });
  });
});

gameBoard.addEventListener("mouseup", evt => {
  if (mousedownOnGameBoard) {

    if ([...evt.target.classList].includes("square") || evt.target.tagName === "SPAN") {
      let span;
      let square;
      if ([...evt.target.classList].includes("square")) {
        span = evt.target.querySelector("span");
        square = evt.target;
      } else if (evt.target.tagName === "SPAN") {
        span = evt.target;
        square = evt.target.parentNode;
      };

      if (evt.button === 0 && span.textContent !== "🚩") {
        checkSquare(square);
        if (checkWin()) showWinScreen();
      } else if (evt.button === 2) {
        span.textContent = (span.textContent === "") ? "🚩" : "";
      };
    };
  mousedownOnGameBoard = false;
  };
});

gameBoard.addEventListener("mousedown", evt => {
  mousedownOnGameBoard = true;
});

window.addEventListener("mouseup", evt => {
  if (![...evt.target.classList].includes("square")) {
    mousedownOnGameBoard = false;
  };
});

gameBoard.addEventListener("contextmenu", evt => {
    evt.preventDefault();
});

[winScreen, loseScreen].forEach(screen => {
  const btn = screen.querySelector(".play-again"); 
  btn.addEventListener("click", evt => {
    screen.style.display = "none";
    screen.querySelector(".gameboard:last-child").remove();
    submitBtn.dispatchEvent(new Event("click"));
  });
});

function checkSquare(currentSquare) {
  const rows = [...gameBoard.children];
  const coords = getCoordinates(currentSquare);
  if ([...rows[coords.y].children[coords.x].classList].includes("mine")) {
    showLoseScreen();
    return;
  };

  let mineCount = 0;
  for (let x = coords.x - 1; x <= coords.x + 1; ++x) {
    for (let y = coords.y - 1; y <= coords.y + 1; ++y) {
      if (x >= 0 && x < currentSize && y >= 0 && y < currentSize && [...rows[y].children[x].classList].includes("mine")) mineCount++;
    };
  };
  currentSquare.classList.add("revealed");
  if (mineCount !== 0) {
    currentSquare.querySelector("span").textContent = mineCount;
  } else {
    for (let x = coords.x - 1; x <= coords.x + 1; ++x) {
      for (let y = coords.y - 1; y <= coords.y + 1; ++y) {
        if (x >= 0 && x < currentSize && y >= 0 && y < currentSize && ![...rows[y].children[x].classList].includes("revealed")) {
          checkSquare(rows[y].children[x]);
        };
      };
    };
  };
};

function getCoordinates(square) {
  const siblings = [...square.parentNode.children];
  const row = square.parentNode;
  const rows = [...square.parentNode.parentNode.children];

  return {x: siblings.indexOf(square), y: rows.indexOf(row)}; // from top right
};

function validateInputs(evt) {
  submitBtn.removeAttribute("disabled");
  const size = +sizeInput.value;
  const mines = +minesInput.value;
  if ((size < 5 || mines < 5 || size > 40 || mines >= Math.pow(size, 2)) && ([...submitBtn.classList].includes("start"))) {
    submitBtn.setAttribute("disabled", "disabled");
  } else if (evt.key === "Enter" && [...submitBtn.classList].includes("start")) {
    submitBtn.dispatchEvent(new Event("click"));
  };
};

function createGrid(size, mines) {
  currentSize = size;
  
  let counter = 0;
  const minePositions = [];
  let minesLeft = mines;
  while (minesLeft > 0) {
    const pos = Math.floor(Math.random() * Math.pow(size, 2));
    if (!minePositions.includes(pos)) {
      minePositions.push(pos);
      minesLeft--;
    };
  };
  minePositions.sort((a,b) => b-a);

  gameBoard.style.setProperty("--squares", size);
  for (let o = 0; o < size; ++o) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let i = 0; i < size; ++i) {
      const square = document.createElement("div");
      square.classList.add("square");
      if (minePositions.at(-1) === counter) {
        square.classList.add("mine");
        minePositions.pop();
      }
      
      const span = document.createElement("span");
      square.appendChild(span);
      row.appendChild(square);

      counter++;
    };
    gameBoard.appendChild(row);
  };
};

function showLoseScreen() {
  loseScreen.style.display = "flex";
  const gameBoardCopy = gameBoard.cloneNode(true);
  gameBoardCopy.style.setProperty("--board-size", "calc(clamp(20vh, 30vw, 40vh) - 24px - 40px)");
  loseScreen.querySelector(".content").appendChild(gameBoardCopy);
};

function showWinScreen() {
  winScreen.style.display = "flex";
  const gameBoardCopy = gameBoard.cloneNode(true);
  gameBoardCopy.style.setProperty("--board-size", "calc(clamp(20vh, 30vw, 40vh) - 24px - 40px)");
  winScreen.querySelector(".content").appendChild(gameBoardCopy);
};

function checkWin() {
  for (row of gameBoard.children) {
    for (square of row.children) {
      if (!([...square.classList].includes("mine") || [...square.classList].includes("revealed"))) {
        return false;
      };
    };
  };
  return true;
};
