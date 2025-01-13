const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rows = 8;
const cols = 9;
let data = Array.from(Array(rows), () => Array(cols).fill(0));
let currentPlayer = 1;
const totalPlayers = 3;
let playerCount = 0;
const players = {};

const initializeGame = () => {
    data = Array.from(Array(rows), () => Array(cols).fill(0));
    currentPlayer = 1;
    playerCount = 0; // Reset player count when initializing the game
    console.log('Game initialized');
    io.emit('initialize', { data, currentPlayer, totalPlayers });
};

const updatePlayerSlots = () => {
    const playerSlots = {};
    for (let i = 1; i <= totalPlayers; i++) {
        playerSlots[i] = Object.values(players).includes(i);
    }
    console.log('Player slots updated:', playerSlots);
    io.emit('updatePlayerSlots', playerSlots);
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

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinGame', () => {
        if (playerCount < totalPlayers) {
            playerCount++;
            const playerNumber = playerCount;
            players[socket.id] = playerNumber;

            console.log(`Player ${playerNumber} joined the game`);
            socket.emit('initialize', { data, currentPlayer, totalPlayers, playerNumber });
            updatePlayerSlots();

            if (playerCount === totalPlayers) {
                console.log('All players have joined. Starting game...');
                io.emit('startGame', players);
            }

            socket.on('playerMove', (col) => {
                if (players[socket.id] !== currentPlayer) {
                    socket.emit('invalidMove', 'It is not your turn.');
                    return;
                }

                const colIndex = getColumnIndex(col);
                const rowIndex = findAvailableRow(colIndex);

                if (rowIndex === -1) {
                    socket.emit('invalidMove', 'This column is full. Please try again.');
                } else {
                    data[rowIndex][colIndex] = currentPlayer;
                    console.log(`Player ${currentPlayer} moved to column ${col}`);
                    io.emit('updateBoard', { data, currentPlayer });

                    if (checkWin(currentPlayer)) {
                        setTimeout(() => {
                            console.log(`Player ${currentPlayer} wins!`);
                            io.emit('gameOver', `Player ${currentPlayer} wins!`);
                        }, 500); // Delay to show the last move
                    } else {
                        currentPlayer = currentPlayer % totalPlayers + 1;
                        console.log(`Next player: ${currentPlayer}`);
                        io.emit('updateBoard', { data, currentPlayer });
                    }
                }
            });
        } else {
            socket.emit('invalidMove', 'Game is full. Please wait for the next game.');
        }
    });

    socket.on('returnToLobby', () => {
        console.log('Client returned to lobby:', socket.id);
        delete players[socket.id];
        playerCount--;
        updatePlayerSlots();
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        delete players[socket.id];
        playerCount--;
        updatePlayerSlots();
    });
});

app.use(express.static('public'));

server.listen(4000, () => {
    console.log('Server is running on port 4000');
    console.log(`Initial player number: ${currentPlayer}`);
});
