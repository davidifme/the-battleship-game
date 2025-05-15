export const GameBoard = (function() {

    let gameBoard = Array(10).fill().map(() => Array(10).fill(null))

    function getBoard() {
        return gameBoard
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

    return {
        getBoard,
        place,
        receiveAttack,
        isGameOver
    }
})()