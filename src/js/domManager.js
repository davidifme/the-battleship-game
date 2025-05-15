import { Player } from "./player"

export const DomManager = (function() {

    function renderBoards() {
        const human = Player.getPlayer('human')
        const computer = Player.getPlayer('computer')

        renderSingleBoard(human)
        renderSingleBoard(computer)
    }

    function renderSingleBoard(player) {

        if (player.playerType === 'human') {
            const humanBoardDomElement = document.querySelector('#human-board')
            renderBoardCells(humanBoardDomElement, player.board)
        }

        if (player.playerType === 'computer') {
            const computerBoardDomElement = document.querySelector('#computer-board')
            renderBoardCells(computerBoardDomElement, player.board)
        }
    }
    
    function renderBoardCells(domElement, board) {

        const boardDomElement = domElement
        boardDomElement.innerHTML = ''

        for (let row = 0; row < board.length; row++) {
            for (let column = 0; column < board[0].length; column++) {
                
                const cell = board[row][column]

                const cellDomElement = document.createElement('button')
                cellDomElement.classList.add('cell')

                if (cell === 'miss') {
                    cellDomElement.classList.add('miss')
                }

                if (typeof cell === 'object' && cell !== null && cell !== 'miss') {
                    const ship = board[row][column]

                    cellDomElement.classList.add('ship')

                    for (let index = 0; index < ship.hitCells.length; index++) {
                        if (row === ship.hitCells[index][0] && column === ship.hitCells[index][1]) {
                            cellDomElement.classList.add('hit')
                        }
                    }
                }

                boardDomElement.appendChild(cellDomElement)
            }
        }
    }

    return {
        renderBoards,
        renderSingleBoard,
        renderBoardCells
    }
})()