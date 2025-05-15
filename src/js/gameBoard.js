import { Ship } from "./ship"

export const GameBoard = (function() {

    const shipSizes = [5, 4, 3, 3, 2]

    let gameBoard = Array(10).fill().map(() => Array(10).fill(null))

    function getBoard() {
        return gameBoard
    }

    function create() {
        return Array(10).fill().map(() => Array(10).fill(null))
    }

    function place(row, column, board, ship) {

        // The specified row or column is not out of bounds
        if (row < 0 || row >= board.length || column < 0 || column >= board[0].length) {
            return
        }

        // The ship fits horizontally on the board
        if (column + ship.length > board[0].length) {
            return
        }

        // The ship doesn't overlap with another ship on the board
        for (let index = 0; index < ship.length; index++) {
            if (board[row][column + index] !== null) {
                return
            }
        }

        // Ensure there is a minimum 1-cell buffer around the ship
        for (let index = 0; index < ship.length; index++) {

            if (column > 0 && board[row][column - 1] !== null) {
                return;
            }

            if (column + ship.length < board[0].length && board[row][column + ship.length] !== null) {
                return;
            }

            if (row > 0 && board[row - 1][column + index] !== null) {
                return;
            }

            if (row < board.length - 1 && board[row + 1][column + index] !== null) {
                return;
            }
        }

        ship.position.x = row
        ship.position.y = column + (ship.length - 1)

        for (let index = 0; index < ship.length; index++) {
            board[row][column + index] = ship

            ship.notHitCells.push([row, column + index])
        }
    }

    function receiveAttack(row, column, board) {

        // The specified row or column is not out of bounds
        if (row < 0 || row >= gameBoard.length || column < 0 || column >= gameBoard[0].length) {
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

        if (typeof board[row][column] === 'object') {
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
                // TODO vertical implementation
                const isHorizontal = true;
    
                // Generate random starting coordinates
                const maxRow = board.length - (isHorizontal ? 1 : size);
                const maxCol = board[0].length - (isHorizontal ? size : 1);
                const row = Math.floor(Math.random() * (maxRow + 1));
                const col = Math.floor(Math.random() * (maxCol + 1));
    
                const ship = Ship.create(size);
                
                // Store current board state to check if placement succeeded
                const boardSnapshot = board.map(row => [...row]);
                
                // Attempt to place the ship
                place(row, col, board, ship);
                
                // Check if ship was actually placed by comparing with snapshot
                placed = false;
                for (let i = 0; i < size; i++) {
                    if (board[row][col + i] === ship) {
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
        printShips
    }
})()