const board = document.getElementById('board');
const statusText = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const resetBtn = document.getElementById('resetBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');

let currentPlayer = 'X';
let cells = Array(9).fill('');
let gameActive = true;

// Score tracking
let playerWins = 0;
let computerWins = 0;
let draws = 0;

// Load sounds (make sure these files exist in sounds folder)
const clickSound = new Audio('sounds/click.mp3');
const winSound = new Audio('sounds/win.mp3');
const drawSound = new Audio('sounds/draw.mp3');

function createBoard() {
  board.innerHTML = '';
  cells.forEach((value, index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    if(value !== '') cell.classList.add('taken');
    cell.dataset.index = index;
    cell.innerText = value;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  });
  statusText.innerText = `Your turn (X)`;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (cells[index] !== '' || !gameActive || currentPlayer !== 'X') return;

  makeMove(index, 'X');

  if (gameActive) {
    setTimeout(() => {
      const bestMove = getBestMove();
      makeMove(bestMove, 'O');
    }, 400);
  }
}

function makeMove(index, player) {
  cells[index] = player;
  const cellDiv = document.querySelector(`[data-index='${index}']`);
  cellDiv.innerText = player;
  cellDiv.classList.add('taken');
  clickSound.play();

  if (checkWinner()) {
    statusText.innerText = player === 'X' ? 'You win!' : 'Computer wins!';
    winSound.play();
    gameActive = false;

    if (player === 'X') playerWins++;
    else computerWins++;

    updateScoreboard();
    return;
  }

  if (cells.every(cell => cell !== '')) {
    statusText.innerText = "It's a draw!";
    drawSound.play();
    gameActive = false;

    draws++;
    updateScoreboard();
    return;
  }

  currentPlayer = player === 'X' ? 'O' : 'X';
  statusText.innerText = currentPlayer === 'X' ? 'Your turn (X)' : "Computer's turn (O)";
}

function checkWinner() {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  return winPatterns.some(([a, b, c]) => {
    return cells[a] && cells[a] === cells[b] && cells[a] === cells[c];
  });
}

// Minimax AI
function getBestMove() {
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === '') {
      cells[i] = 'O';
      let score = minimax(cells, 0, false);
      cells[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  let result = evaluate(boardState);
  if (result !== null) return result;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'O';
        let score = minimax(boardState, depth + 1, false);
        boardState[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'X';
        let score = minimax(boardState, depth + 1, true);
        boardState[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluate(boardState) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a,b,c] of winPatterns) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      if (boardState[a] === 'O') return 10;
      else if (boardState[a] === 'X') return -10;
    }
  }

  if (boardState.every(cell => cell !== '')) return 0;

  return null;
}

function updateScoreboard() {
  document.getElementById('playerWins').innerText = playerWins;
  document.getElementById('computerWins').innerText = computerWins;
  document.getElementById('draws').innerText = draws;
}

function resetGame() {
  cells = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  createBoard();
  statusText.innerText = 'Your turn (X)';
}

// Dark mode toggle and persistence
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggleBtn.innerText = 'Switch to Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    themeToggleBtn.innerText = 'Switch to Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggleBtn.innerText = 'Switch to Dark Mode';
    localStorage.setItem('theme', 'light');
  }
});

resetBtn.addEventListener('click', () => {
  resetGame();
});

resetScoresBtn.addEventListener('click', () => {
  playerWins = 0;
  computerWins = 0;
  draws = 0;
  updateScoreboard();
});

// Initialize game
createBoard();
updateScoreboard();
