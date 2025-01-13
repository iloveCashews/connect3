const rows = 8;
const cols = 9;
let data;
let currentPlayer;
let totalPlayers;

const initializeGame = () => {
    data = Array.from(Array(rows), () => Array(cols).fill(0));
    currentPlayer = 1;
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

const startGame = () => {
    totalPlayers = parseInt(document.getElementById('numPlayers').value, 10);
    initializeGame();
    createBoard();
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

const handleCellClick = (event) => {
    const colIndex = getColumnIndex(event.target.dataset.col);
    const rowIndex = findAvailableRow(colIndex);

    if (rowIndex === -1) {
        alert('This column is full. Please try again.');
    } else {
        data[rowIndex][colIndex] = currentPlayer;
        updateBoard();
        if (checkWin(currentPlayer)) {
            alert(`Player ${currentPlayer} wins!`);
            startGame();
        } else {
            currentPlayer = currentPlayer % totalPlayers + 1;
        }
    }
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
