import { Player } from "./player"

export const DomManager = (function() {

    function renderBoards() {
        renderSingleBoard('human')
        renderSingleBoard('computer')
    }

    function renderSingleTags(player) {
        renderSingleNumberTags(player)
        renderSingleLetterTags(player)
    }

    function renderSingleBoard(player) {

        if (player === 'human') {
            const human = Player.getPlayer('human')
            const humanBoardDomElement = document.querySelector('#human-board')
            renderBoardCells(humanBoardDomElement, human.board)
            renderSingleTags(player)
        }

        if (player === 'computer') {
            const computer = Player.getPlayer('computer')
            const computerBoardDomElement = document.querySelector('#computer-board')
            renderBoardCells(computerBoardDomElement, computer.board)
            renderSingleTags(player)
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

    function renderSingleNumberTags(player) {
        const containerSelector = player === 'human' ? '#human .numbers' : '#computer .numbers';
        const container = document.querySelector(containerSelector);

        if (container) {
            container.innerHTML = '';
            for (let index = 0; index < 10; index++) {
                const numberTag = document.createElement('div');
                numberTag.classList.add('number-tag');
                numberTag.textContent = index + 1;
                container.appendChild(numberTag);
            }
        }
    }

    function renderSingleLetterTags(player) {
        const containerSelector = player === 'human' ? '#human .letters' : '#computer .letters';
        const container = document.querySelector(containerSelector);

        if (container) {
            container.innerHTML = '';
            const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
            for (let index = 0; index < letters.length; index++) {
                const letterTag = document.createElement('div');
                letterTag.classList.add('letter-tag');
                letterTag.textContent = letters[index];
                container.appendChild(letterTag);
            }
        }
    }

    return {
        renderBoards,
        renderBoardCells,
        renderSingleBoard,
        renderSingleNumberTags,
        renderSingleLetterTags,
        renderSingleTags
    }
})()