const gameBoard = document.querySelector(".gameboard");
const submitBtn = document.querySelector(".submitBtn");
const sizeInput = document.querySelector("#size");
const minesInput = document.querySelector("#mines");

submitBtn.addEventListener("click", evt => {
  // to-do: validation 

  [...gameBoard.children].forEach(child => child.remove());
  createGrid(+sizeInput.value, +minesInput.value);
});


function createGrid(size, mines) {
  gameBoard.style.setProperty("--squares", size);
  for (let o = 0; o < size; ++o) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let i = 0; i < size; ++i) {
      const square = document.createElement("div");
      square.classList.add("square");
      row.appendChild(square);
    };
    gameBoard.appendChild(row);
  };
};
