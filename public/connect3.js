const rows = 8;
const cols = 9;
let data;
let currentPlayer;
const totalPlayers = 3; // Fixed number of players
let playerNumber = localStorage.getItem('playerNumber') || null;

const initializeGame = () => {
    data = Array.from(Array(rows), () => Array(cols).fill(0));
    currentPlayer = 1;
    createBoard();
};

const getColumnIndex = (col) => parseInt(col, 10) - 1;

const findAvailableRow = (colIndex) => {
    for (let rowIndex = rows - 1; rowIndex >= 0; rowIndex--) {
        if (data[rowIndex][colIndex] === 0) {
            return rowIndex;
        }
    }
    return -1; // No available row
};

const checkWin = (player) => {
    // Check rows
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - 2; col++) {
            if (data[row][col] === player && data[row][col + 1] === player && data[row][col + 2] === player) {
                return true;
            }
        }
    }
    // Check columns
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows - 2; row++) {
            if (data[row][col] === player && data[row + 1][col] === player && data[row + 2][col] === player) {
                return true;
            }
        }
    }
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row < rows - 2; row++) {
        for (let col = 0; col < cols - 2; col++) {
            if (data[row][col] === player && data[row + 1][col + 1] === player && data[row + 2][col + 2] === player) {
                return true;
            }
        }
    }
    // Check diagonals (bottom-left to top-right)
    for (let row = 2; row < rows; row++) {
        for (let col = 0; col < cols - 2; col++) {
            if (data[row][col] === player && data[row - 1][col + 1] === player && data[row - 2][col + 2] === player) {
                return true;
            }
        }
    }
    return false;
};

const createBoard = () => {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let row = 0; row < rows; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < cols; col++) {
            const td = document.createElement('td');
            td.dataset.col = col + 1;
            td.addEventListener('click', handleCellClick);
            tr.appendChild(td);
        }
        board.appendChild(tr);
    }
};

const socket = io();
const turnBanner = document.getElementById('turnBanner');
const playerBanner = document.getElementById('playerBanner');
const resultBanner = document.getElementById('resultBanner');
const returnButton = document.getElementById('returnButton');
const homepage = document.getElementById('homepage');
const gamepage = document.getElementById('gamepage');
const playerList = {
    1: document.getElementById('player1'),
    2: document.getElementById('player2'),
    3: document.getElementById('player3')
};

const updateTurnBanner = () => {
    turnBanner.textContent = currentPlayer === playerNumber ? "It's your turn!" : `Player ${currentPlayer}'s turn`;
};

const updatePlayerBanner = () => {
    playerBanner.textContent = `You are Player ${playerNumber}`;
};

document.getElementById('joinButton').addEventListener('click', () => {
    socket.emit('joinGame');
});

document.getElementById('startButton').addEventListener('click', () => {
    socket.emit('startGame');
});

returnButton.addEventListener('click', () => {
    resultBanner.style.display = 'none';
    returnButton.style.display = 'none';
    homepage.style.display = 'block';
    gamepage.style.display = 'none';
    localStorage.removeItem('playerNumber');
    socket.emit('returnToLobby');
});

socket.on('initialize', ({ data: serverData, currentPlayer: serverCurrentPlayer, totalPlayers: serverTotalPlayers, playerNumber: serverPlayerNumber }) => {
    data = serverData;
    currentPlayer = serverCurrentPlayer;
    totalPlayers = serverTotalPlayers;
    playerNumber = serverPlayerNumber;
    localStorage.setItem('playerNumber', playerNumber);
    updateBoard();
    updateTurnBanner();
    updatePlayerBanner();
});

socket.on('updateBoard', ({ data: serverData, currentPlayer: serverCurrentPlayer }) => {
    data = serverData;
    currentPlayer = serverCurrentPlayer;
    updateBoard();
    updateTurnBanner();
});

socket.on('gameOver', (message) => {
    resultBanner.textContent = message;
    resultBanner.style.display = 'block';
    returnButton.style.display = 'block';
});

socket.on('invalidMove', (message) => {
    alert(message);
});

socket.on('updatePlayerSlots', (players) => {
    for (let i = 1; i <= totalPlayers; i++) {
        playerList[i].textContent = players[i] ? `Player ${i}` : 'Empty';
    }
    if (players[1] && players[2] && players[3] && playerNumber === 1) {
        document.getElementById('startButton').style.display = 'block';
    }
});

socket.on('startGame', (players) => {
    homepage.style.display = 'none';
    gamepage.style.display = 'block';
    playerNumber = players[socket.id];
    localStorage.setItem('playerNumber', playerNumber);
    initializeGame();
    updateTurnBanner();
});

const handleCellClick = (event) => {
    if (currentPlayer !== playerNumber) {
        alert('It is not your turn.');
        return;
    }
    const colIndex = getColumnIndex(event.target.dataset.col);
    socket.emit('playerMove', colIndex + 1);
};

const updateBoard = () => {
    const board = document.getElementById('board');
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = board.rows[row].cells[col];
            cell.className = data[row][col] === 1 ? 'player1' : data[row][col] === 2 ? 'player2' : data[row][col] === 3 ? 'player3' : '';
        }
    }
};

// Initialize the game when the script is loaded
initializeGame();
