import { Player } from "./player"
import { Ship } from "./ship"

export const GameBoard = (function() {

    const shipSizes = [5, 4, 3, 3, 2]
    let gameBoard = Array(10).fill().map(() => Array(10).fill(null))
    let currentPlayer = 'player1'
    let gameMode = 'single'

    function getCurrentPlayer() {
        return currentPlayer
    }

    function setCurrentPlayer(player) {
        currentPlayer = player
    }

    function getGameMode() {
        return gameMode
    }

    function setGameMode(mode) {
        gameMode = mode
        currentPlayer = 'player1'
    }

    function getBoard() {
        return gameBoard
    }

    function getShipSizes() {
        return shipSizes
    }

    function create() {
        return Array(10).fill().map(() => Array(10).fill(null))
    }

    function canBePlaced(row, column, board, shipLength, isHorizontal = true) {
        // Check if the ship is within board boundaries
        if (row < 0 || row >= board.length || column < 0 || column >= board[0].length) {
            return false;
        }
    
        // Check if the ship fits on the board (horizontally or vertically)
        if (isHorizontal && column + shipLength > board[0].length) {
            return false;
        }
        
        if (!isHorizontal && row + shipLength > board.length) {
            return false;
        }
    
        // Check if the ship overlaps with another ship
        for (let index = 0; index < shipLength; index++) {
            const checkRow = isHorizontal ? row : row + index;
            const checkCol = isHorizontal ? column + index : column;
            
            if (board[checkRow][checkCol] !== null) {
                return false;
            }
        }
    
        // Check for a minimum 1-cell buffer around the ship
        for (let index = 0; index < shipLength; index++) {
            const checkRow = isHorizontal ? row : row + index;
            const checkCol = isHorizontal ? column + index : column;
    
            // Check left cell
            if (checkCol > 0 && board[checkRow][checkCol - 1] !== null) {
                return false;
            }
    
            // Check right cell
            if (checkCol < board[0].length - 1 && board[checkRow][checkCol + 1] !== null) {
                return false;
            }
    
            // Check top cell
            if (checkRow > 0 && board[checkRow - 1][checkCol] !== null) {
                return false;
            }
    
            // Check bottom cell
            if (checkRow < board.length - 1 && board[checkRow + 1][checkCol] !== null) {
                return false;
            }
    
            // Check diagonal cells
            if (checkRow > 0 && checkCol > 0 && board[checkRow - 1][checkCol - 1] !== null) {
                return false;
            }
            if (checkRow > 0 && checkCol < board[0].length - 1 && board[checkRow - 1][checkCol + 1] !== null) {
                return false;
            }
            if (checkRow < board.length - 1 && checkCol > 0 && board[checkRow + 1][checkCol - 1] !== null) {
                return false;
            }
            if (checkRow < board.length - 1 && checkCol < board[0].length - 1 && board[checkRow + 1][checkCol + 1] !== null) {
                return false;
            }
        }
    
        return true;
    }

    function place(row, column, board, ship, isHorizontal = true) {
        if (!canBePlaced(row, column, board, ship.length, isHorizontal)) return

        // Place the ship on the board
        for (let index = 0; index < ship.length; index++) {
            const placeRow = isHorizontal ? row : row + index;
            const placeCol = isHorizontal ? column + index : column;
            
            board[placeRow][placeCol] = ship;
            ship.notHitCells.push([placeRow, placeCol]);
        }
    }

    function receiveAttack(row, column, board) {

        // The specified row or column is not out of bounds
        if (row < 0 || row >= board.length || column < 0 || column >= board[0].length) {
            return
        }

        // Cell is not already hit-missed
        if (board[row][column] === 'miss') {
            return
        }

        // Hit was missed
        if (board[row][column] === null) {
            board[row][column] = 'miss'
        }

        if (typeof board[row][column] === 'object' && board[row][column] !== null) {
            const ship = board[row][column]
            
            ship.hit(row, column)
        }
    }

    function isGameOver(board = gameBoard) {

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = board[row][col];
                if (typeof cell === 'object' && cell !== null && !cell.isSunk()) {
                    return false;
                }
            }
        }
        
        return true;
    }

    function placeShipsRandomly(board) {
        shipSizes.forEach(size => {
            let placed = false;
    
            while (!placed) {
                // Randomly decide if the ship will be horizontal or vertical
                const isHorizontal = Math.random() < 0.5;
    
                // Generate random starting coordinates
                const maxRow = board.length - (isHorizontal ? 1 : size);
                const maxCol = board[0].length - (isHorizontal ? size : 1);
                const row = Math.floor(Math.random() * (maxRow + 1));
                const col = Math.floor(Math.random() * (maxCol + 1));
    
                const ship = Ship.create(size);
                
                // Store current board state to check if placement succeeded
                const boardSnapshot = board.map(row => [...row]);
                
                // Attempt to place the ship
                place(row, col, board, ship, isHorizontal);
                
                // Check if ship was actually placed by comparing with snapshot
                placed = false;
                for (let i = 0; i < size; i++) {
                    const checkRow = isHorizontal ? row : row + i;
                    const checkCol = isHorizontal ? col + i : col;
                    
                    if (board[checkRow][checkCol] === ship) {
                        placed = true;
                        break;
                    }
                }
                
                // If placement failed, restore board to previous state
                if (!placed) {
                    for (let r = 0; r < board.length; r++) {
                        for (let c = 0; c < board[r].length; c++) {
                            board[r][c] = boardSnapshot[r][c];
                        }
                    }
                }
            }
        });
    }

    function areShipsPlaced(board) {
        const requiredCounts = {};
    
        for (const size of shipSizes) {
            requiredCounts[size] = (requiredCounts[size] || 0) + 1;
        }
    
        const foundCounts = {};
        const countedShips = new Set();
    
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = board[row][col];
                if (typeof cell === 'object' && cell !== null && !countedShips.has(cell)) {
                    const size = cell.length;
                    foundCounts[size] = (foundCounts[size] || 0) + 1;
                    countedShips.add(cell);
                }
            }
        }
    
        return Object.entries(requiredCounts).every(([size, count]) =>
            foundCounts[size] === count
        );
    }

    function printShips(board) {
        const printedShips = new Set();

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = board[row][col];
                if (typeof cell === 'object' && cell !== null && !printedShips.has(cell)) {
                    console.log(cell);
                    printedShips.add(cell);
                }
            }
        }
    }

    return {
        getBoard,
        create,
        place,
        receiveAttack,
        isGameOver,
        placeShipsRandomly,
        areShipsPlaced,
        getCurrentPlayer,
        setCurrentPlayer,
        getShipSizes,
        canBePlaced,
        setGameMode,
        getGameMode,
        printShips
    }
})()