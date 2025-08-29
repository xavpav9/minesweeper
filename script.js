const gameBoard = document.querySelector(".gameboard");
const submitBtn = document.querySelector(".submitBtn");
const sizeInput = document.querySelector("#size");
const minesInput = document.querySelector("#mines");
const winScreen = document.querySelector(".win-screen");
const loseScreen = document.querySelector(".lose-screen");
const levelSelect = document.querySelector("#levels");
const flagMineOutput = document.querySelector(".flag-count span:last-child");
const flagMineToggleBtn = document.querySelector(".flag-mine-toggle");
const flagMineToggleOutput = document.querySelector(".flag-mine-toggle span:last-child");

let currentSize = 0;
let mousedownOnGameBoard = false;
let flagCount = 0;
let currentFlagMineToggle = "Mine";

submitBtn.addEventListener("click", evt => {
  flagCount = 0;
  flagMineOutput.textContent = flagCount;

  [...gameBoard.children].forEach(child => child.remove());

  if ([...submitBtn.classList].includes("start")) createGrid(+sizeInput.value, +minesInput.value);

  submitBtn.classList.toggle("start");
  submitBtn.classList.toggle("reset");

  validateInputs();
});

flagMineToggleBtn.addEventListener("click", evt => {
  if (currentFlagMineToggle === "Mine") {
    currentFlagMineToggle = "Flag";
    flagMineToggleOutput.textContent = currentFlagMineToggle;
  } else {
    currentFlagMineToggle = "Mine";
    flagMineToggleOutput.textContent = currentFlagMineToggle;
  };
  flagMineToggleBtn.classList.toggle("flag-mode");
  flagMineToggleBtn.classList.toggle("mine-mode");
});

[sizeInput, minesInput].forEach(input => {
  ["click", "input"].forEach(event => {
    input.addEventListener(event, evt => {
      validateInputs();
    });
  });
});

window.addEventListener("keydown", evt=> {
  validateInputs();
  if (evt.key === "Enter") {
    if (winScreen.style.display === "flex") winScreen.querySelector("button").dispatchEvent(new Event("click"));
    else if (loseScreen.style.display === "flex") loseScreen.querySelector("button").dispatchEvent(new Event("click"));
    else if (evt.key === "Enter" && !submitBtn.hasAttribute("disabled")) submitBtn.dispatchEvent(new Event("click"));
  };
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
      
      const flagClick = (currentFlagMineToggle === "Flag") ? 0 : 2;
      const mineClick = (currentFlagMineToggle === "Mine") ? 0 : 2;


      if (evt.button === mineClick && span.textContent !== "🚩") {
        checkSquare(square);
        if (checkWin()) showEndScreen("win");
      } else if (evt.button === flagClick && ![...span.parentNode.classList].includes("revealed")) {
        if (span.textContent === "") {
          span.textContent = "🚩";
          flagMineOutput.textContent = ++flagCount;

        } else {
          span.textContent = "";
          flagMineOutput.textContent = --flagCount;
        };
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
    sizeInput.removeAttribute("disabled");
    minesInput.removeAttribute("disabled");
    submitBtn.removeAttribute("disabled");
    levelSelect.removeAttribute("disabled");
    levelSelect.dispatchEvent(new Event("change"));

    screen.style.display = "none";
    screen.querySelector(".gameboard:last-child").remove();
    submitBtn.dispatchEvent(new Event("click"));
  });
});

levelSelect.addEventListener("change", evt => {
  function disable() {
    sizeInput.setAttribute("disabled", "disabled");
    minesInput.setAttribute("disabled", "disabled");
  }
  switch (evt.target.value) {
    case "custom":
      sizeInput.removeAttribute("disabled");
      minesInput.removeAttribute("disabled");
      break;
    case "easy":
      disable();
      sizeInput.value = 6;
      minesInput.value = 5;
      break;
    case "medium":
      disable();
      sizeInput.value = 12;
      minesInput.value = 20;
      break;
    case "hard":
      disable();
      sizeInput.value = 18;
      minesInput.value = 50;
      break;
    case "impossible":
      disable();
      sizeInput.value = 40;
      minesInput.value = 125;
      break;
  };
  validateInputs();
});

function checkSquare(currentSquare) {
  const rows = [...gameBoard.children];
  const coords = getCoordinates(currentSquare);
  if ([...rows[coords.y].children[coords.x].classList].includes("mine")) {
    showEndScreen("lose");
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

function validateInputs() {
  submitBtn.removeAttribute("disabled");
  const size = +sizeInput.value;
  const mines = +minesInput.value;
  if ((size < 5 || mines < 5 || size > 40 || mines >= Math.pow(size, 2)) && ([...submitBtn.classList].includes("start"))) {
    submitBtn.setAttribute("disabled", "disabled");
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

function showEndScreen(screenType = "win") {
  sizeInput.setAttribute("disabled", "disabled");
  minesInput.setAttribute("disabled", "disabled");
  submitBtn.setAttribute("disabled", "disabled");
  levelSelect.setAttribute("disabled", "disabled");

  flagCount = 0;
  flagMineOutput.textContent = flagCount;

  let screen;
  if (screenType === "lose") screen = loseScreen;
  else if (screenType === "win") screen = winScreen;

  screen.style.display = "flex";

  const gameBoardCopy = gameBoard.cloneNode(true);
  gameBoardCopy.style.setProperty("--board-size", "calc(clamp(20vh, 30vw, 40vh) - 24px - 40px)");
  gameBoardCopy.querySelectorAll(".mine").forEach(mineSquare => {
    mineSquare.textContent = "💣";
    mineSquare.style.backgroundColor = "pink";
  });
  screen.querySelector(".content").appendChild(gameBoardCopy);
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
