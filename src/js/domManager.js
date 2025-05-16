import { GameBoard } from "./gameBoard"
import { Player } from "./player"

export const DomManager = (function() {

    let gameStarted = false

    function init() {
        renderBoards()
        setupButtons()
    }

    function renderBoards() {
        renderSingleBoard('human')
        renderSingleBoard('computer')
    }

    function setupButtons() {
        setupRandomShipPlacementButton()
        setupStartButton()
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
                cellDomElement.dataset.row = row
                cellDomElement.dataset.column = column

                if (cell === 'miss') {
                    cellDomElement.classList.add('miss')
                }

                if (typeof cell === 'object' && cell !== null && cell !== 'miss') {
                    const ship = board[row][column]

                    if (boardDomElement.id !== 'computer-board') {
                        cellDomElement.classList.add('ship')
                    }

                    for (let index = 0; index < ship.hitCells.length; index++) {
                        if (row === ship.hitCells[index][0] && column === ship.hitCells[index][1]) {
                            cellDomElement.classList.add('hit')
                        }
                    }
                }

                if (boardDomElement.id === 'computer-board') {
                    cellDomElement.addEventListener('click', (event) => {
                        attack(event.target)
                    })
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

    function resetBoards() {
        
        const human = Player.getPlayer('human')
        const computer = Player.getPlayer('computer')

        human.board = GameBoard.create()
        computer.board = GameBoard.create()
    }

    function resetSingleBoard(player) {
        const playerObj = Player.getPlayer(player);
        playerObj.board = GameBoard.create();
    }

    function setupRandomShipPlacementButton() {
        const button = document.querySelector('.random-placement')

        const human = Player.getPlayer('human')
        const computer = Player.getPlayer('computer')

        button.addEventListener('click', () => {
            resetBoards()
            GameBoard.placeShipsRandomly(human.board)
            GameBoard.placeShipsRandomly(computer.board)
            renderBoards()

            if (GameBoard.areShipsPlaced(human.board) && GameBoard.areShipsPlaced(computer.board)) {
                const startButton = document.querySelector('.start-game') 
                startButton.disabled = false
            }
        })
    }

    function setupStartButton() {
        const startButton = document.querySelector('.start-game')
        startButton.disabled = true

        startButton.addEventListener('click', () => {
            disableButtons()
            gameStarted = true
        })
    }

    function attack(domElement) {
        if (!gameStarted) return
        if (GameBoard.getCurrentPlayer() !== 'human') return

        const row = parseInt(domElement.dataset.row)
        const column = parseInt(domElement.dataset.column)
        const computerBoard = Player.getPlayer('computer').board

        GameBoard.receiveAttack(row, column, computerBoard)

        if (GameBoard.isGameOver(computerBoard)) {
            gameOver('human')
            return
        }

        GameBoard.setCurrentPlayer('computer')
        renderSingleBoard('computer')

        setTimeout(() => {
            computerAttack()
        }, 350);
    }

    function computerAttack() {
        if (GameBoard.getCurrentPlayer() !== 'computer') return

        const humanBoard = Player.getPlayer('human').board

        const maxAttempts = 100;
        let attempts = 0;

        let found = false
        while(!found && attempts < maxAttempts) {
            const randomRow = Math.floor(Math.random() * 10);
            const randomColumn = Math.floor(Math.random() * 10);

            const cell = humanBoard[randomRow][randomColumn]

            if (cell === 'miss') continue

            if (typeof cell === 'object' && cell !== null) {
                const ship = cell

                let alreadyHit = false

                for (let index = 0; index < ship.hitCells.length; index++) {
                    if (randomRow === ship.hitCells[index][0] && randomColumn === ship.hitCells[index][1]) {
                        alreadyHit = true
                        break
                    }
                }

                if (alreadyHit) continue
            }

            GameBoard.receiveAttack(randomRow, randomColumn, humanBoard)
            GameBoard.setCurrentPlayer('human')
            renderSingleBoard('human')


            if (GameBoard.isGameOver(humanBoard)) {
                gameOver('computer')
                return
            }

            found = true
        }

        if (!found) {
            console.warn('Computer could not find a valid move after maximum attempts');
            GameBoard.setCurrentPlayer('human');
        }
    }

    function enableButtons() {
        const buttons = document.querySelectorAll('.buttons button')
        buttons.forEach(button => button.disabled = false)
    }

    function disableButtons() {
        const buttons = document.querySelectorAll('.buttons button')
        buttons.forEach(button => button.disabled = true)
    }

    function gameOver(player) {
        const modal = document.getElementById('gameOverModal')
        const closeButton = document.getElementById('modal-close')
        const modalTitle = document.querySelector('.modal-title')

        function closeModal() {
            modal.close();
            endGame();
        }

        if (player === 'human') {
            modalTitle.textContent = 'You won!'
            modalTitle.classList.add('win')
        }

        if (player === 'computer') {
            modalTitle.textContent = 'You lost :c'
            modalTitle.classList.remove('win')
        }

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        closeButton.addEventListener('click', () => {
            closeModal();
        })

        modal.showModal()
    }

    function endGame() {
        resetBoards()
        renderBoards()
        enableButtons()

        gameStarted = false

        const startButton = document.querySelector('.start-game') 
        startButton.disabled = true
    }

    return {
        renderBoards,
        renderBoardCells,
        renderSingleBoard,
        renderSingleNumberTags,
        renderSingleLetterTags,
        renderSingleTags,
        setupRandomShipPlacementButton,
        setupButtons,
        init,
        resetBoards,
        resetSingleBoard,
        setupStartButton,
        attack,
        gameOver,
        enableButtons,
        disableButtons,
        computerAttack
    }
})()