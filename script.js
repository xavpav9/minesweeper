const gameBoard = document.querySelector(".gameboard");
const submitBtn = document.querySelector(".submitBtn");
const sizeInput = document.querySelector("#size");
const minesInput = document.querySelector("#mines");

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
      row.appendChild(square);

      counter++;
    };
    gameBoard.appendChild(row);
  };
};
