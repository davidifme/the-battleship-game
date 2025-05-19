import { GameBoard } from "./gameBoard"
import { Player } from "./player"
import { Ship } from "./ship";

export const DomManager = (function() {

    let gameStarted = false
    let draggedShipLength;
    let draggedShipName;
    let toggle3 = true
    let isHorizontal = true
    let highlightedCells = new Set();

    function init() {
        renderBoards()
        renderShips()
        setupButtons()
        setupOrientationToggle()
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
                    cellDomElement.dataset.player = 'computer'
                    cellDomElement.addEventListener('click', (event) => {
                        attack(event.target)
                    })
                }

                if (boardDomElement.id === 'human-board') {
                    cellDomElement.dataset.player = 'human'
                    cellDomElement.addEventListener("dragover", handleDragOver);
                    cellDomElement.addEventListener("drop", handleDrop);
                    cellDomElement.addEventListener("dragenter", handleDragEnter);
                    cellDomElement.addEventListener("dragleave", handleDragLeave);
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

        button.addEventListener('click', () => {
            resetSingleBoard('human')
            GameBoard.placeShipsRandomly(human.board)
            renderSingleBoard('human')

            if (GameBoard.areShipsPlaced(human.board)) {
                enableStartButton()
            }
        })
    }

    function placeComputerShips() {
        const computerBoard = Player.getPlayer('computer').board
        GameBoard.placeShipsRandomly(computerBoard)
        renderSingleBoard('computer')
    }

    function setupStartButton() {
        const startButton = document.querySelector('.start-game') 
        startButton.disabled = true

        startButton.addEventListener('click', () => {
            placeComputerShips()
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
            renderSingleBoard('computer')
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

            if (GameBoard.isGameOver(humanBoard)) {
                renderSingleBoard('human')
                gameOver('computer')
                return
            }

            GameBoard.setCurrentPlayer('human')
            renderSingleBoard('human')

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

    function enableStartButton() {
        const startButton = document.querySelector('.start-game') 
        startButton.disabled = false
    }

    function disableStartButton() {
        const startButton = document.querySelector('.start-game') 
        startButton.disabled = true
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
        renderShips()
        enableButtons()

        gameStarted = false

        disableStartButton()
    }

    function renderShips() {
        const shipSizes = GameBoard.getShipSizes()
        const shipsContainer = document.querySelector('.ships')
        shipsContainer.innerHTML = ''

        shipSizes.forEach(size => {
            const shipContainer = document.createElement('div')
            shipContainer.classList.add('ship-container')
            shipContainer.dataset.length = size
            shipContainer.dataset.name = setShipName(size)
            shipContainer.draggable = true

            shipContainer.addEventListener('dragstart', handleDragStart)
            shipContainer.addEventListener('dragend', handleDragEnd)

            for (let index = 0; index < size; index++) {
                const shipCell = document.createElement('div')
                shipCell.classList.add('ship-cell')
                shipContainer.appendChild(shipCell)
            }

            shipContainer.addEventListener('dragstart', (e) => {
                draggedShipLength = parseInt(e.target.dataset.length)
            })

            shipsContainer.appendChild(shipContainer)
        })

    }

    function setShipName(shipLength) {
        if (shipLength === 5) return 'Carrier';
        if (shipLength === 4) return 'Battleship';
        if (shipLength === 3) {
            const name = toggle3 ? 'Destroyer' : 'Submarine';
            toggle3 = !toggle3;
            return name;
        }
        if (shipLength === 2) return 'Patrol';
    }

    function handleDragStart(e) {
        e.target.style.opacity = '0.5'
        draggedShipLength = parseInt(e.target.dataset.length)
        draggedShipName = e.target.dataset.name
    }

    function handleDragEnd(e) {
        e.target.style.opacity = '1'
        clearHighlights()
        draggedShipLength = null
    }

    function handleDragEnter(e) {
        e.preventDefault()

        if (gameStarted) return

        highlightCells(e.target)
    }

    function handleDragLeave(e) {
        e.preventDefault()
        if (gameStarted) return

        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !highlightedCells.has(relatedTarget)) {
            clearHighlights();
        }
    }

    function handleDragOver(e) {
        e.preventDefault()
    }

    function handleDrop(e) {
        e.preventDefault()
        if (gameStarted) return

        const row = parseInt(e.target.dataset.row)
        const column = parseInt(e.target.dataset.column)
        const board = Player.getPlayer('human').board
        const ship = Ship.create(draggedShipLength)
        const draggedShip = document.querySelector(`[data-name="${draggedShipName}"]`)

        if (GameBoard.canBePlaced(row, column, board, ship.length, isHorizontal)) {
            GameBoard.place(row, column, board, ship, isHorizontal)
            renderSingleBoard('human')
            draggedShip.remove()

            if (GameBoard.areShipsPlaced(board)) {
                enableStartButton()
            }
        }
        clearHighlights()
    }

    function clearHighlights() {
        const cells = document.querySelectorAll('#human-board .cell');
        cells.forEach(cell => {
            cell.classList.remove('valid', 'invalid');
        });
    }

    function highlightCells(target) {
        clearHighlights();
        if (!draggedShipLength || gameStarted) return;

        const row = parseInt(target.dataset.row);
        const column = parseInt(target.dataset.column);
        const board = Player.getPlayer('human').board;

        const canPlace = GameBoard.canBePlaced(row, column, board, draggedShipLength, isHorizontal);

        for (let i = 0; i < draggedShipLength; i++) {
            const cellRow = isHorizontal ? row : row + i;
            const cellCol = isHorizontal ? column + i : column;
            
            if (cellRow >= 0 && cellRow < 10 && cellCol >= 0 && cellCol < 10) {
                const cell = document.querySelector(
                    `#human-board .cell[data-row="${cellRow}"][data-column="${cellCol}"]`
                );
                if (cell) {
                    cell.classList.add(canPlace ? 'valid' : 'invalid');
                    highlightedCells.add(cell);
                }
            }
        }
    }

    function setupOrientationToggle() {
        const button = document.querySelector('.direction')

        button.addEventListener('click', (e) => {
            isHorizontal = !isHorizontal
            button.textContent = isHorizontal === true ? 'Horizontal' : 'Vertical'
        })

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r' && !gameStarted) {
                isHorizontal = !isHorizontal;
                button.textContent = isHorizontal === true ? 'Horizontal' : 'Vertical'
            }
        });
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