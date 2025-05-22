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
    let hitQueue = [] // [{ row, col, ship }]
    let directionMap = new Map() // Map<ship, 'horizontal'|'vertical'|null>

    const setup = (function() {
        function buttons() {
            randomShipPlacementButton()
            startButton()
            resetButton()
        }

        function randomShipPlacementButton() {
            const buttons = document.querySelectorAll('.random-placement')

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const player = Player.getPlayer(GameBoard.getCurrentPlayer())
                    const playerName = GameBoard.getCurrentPlayer()
    
                    resetSingleBoard(playerName)
                    GameBoard.placeShipsRandomly(player.board)
                    render.singleBoard(playerName)
                    removeDraggableShips()
        
                    if (GameBoard.areShipsPlaced(player.board)) {
                        enableStartButton()
                    }
                })
            })
        }

        function startButton() {
            const startButtons = document.querySelectorAll('.start-game') 

            startButtons.forEach(button => {
                button.disabled = true

                if (GameBoard.getGameMode() === 'single') {
                    button.addEventListener('click', () => {
                        placeComputerShips()
                        disableButtons()
                        gameStarted = true
                    })
                }

                if ((GameBoard.getGameMode() === 'multi')) {
                    button.addEventListener('click', () => {
                        if (GameBoard.getCurrentPlayer() === 'player1') {
                            showPassDeviceModal()
                        }

                        if (GameBoard.getCurrentPlayer() === 'player2') {
                            disableButtons()
                            gameStarted = true  
                        }
                    })
                }
            })
        }

        function orientationToggle() {
            const buttons = document.querySelectorAll('.direction')

            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    isHorizontal = !isHorizontal
                    button.textContent = isHorizontal === true ? 'Horizontal' : 'Vertical'
        
                    const shipContainers = document.querySelectorAll('.ship-container')
                    shipContainers.forEach(ship => {
                        ship.style.flexDirection = isHorizontal === true ? 'row' : 'column'
                    })
                })
            })
    
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'r' && !gameStarted) {
                    isHorizontal = !isHorizontal;
                    buttons.forEach(btn => btn.textContent = isHorizontal === true ? 'Horizontal' : 'Vertical')
    
                    const shipContainers = document.querySelectorAll('.ship-container')
                    shipContainers.forEach(ship => {
                        ship.style.flexDirection = isHorizontal === true ? 'row' : 'column'
                    })
                }
            });
        }
    
        function resetButton() {
            const buttons = document.querySelectorAll('.reset-board')
    
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const playerName = GameBoard.getCurrentPlayer()
                    resetSingleBoard(playerName)
                    render.singleBoard(playerName)
                    render.ships()
                })
            })
        }

        function game() {
            if (GameBoard.getGameMode() === 'single') {
                setup.players()
                render.boards()
                render.ships()
                setup.buttons()
                setup.orientationToggle()
                showContent()
            }

            if (GameBoard.getGameMode() === 'multi') {
                showContent()
                setup.players()
                setup.secondPlayerBoard()
                setup.buttons()
                setup.orientationToggle()
                render.boards()
                render.ships()
            }
        }

        function players() {
            if (GameBoard.getGameMode() === 'single') {
                Player.reset()
                Player.create('player1')
                Player.create('computer')
            }

            if (GameBoard.getGameMode() === 'multi') {
                Player.reset()
                Player.create('player1')
                Player.create('player2')
            }
        }

        function secondPlayerBoard() {
            const contentDiv = document.getElementById('computer')
            contentDiv.dataset.player = 'player2'
            contentDiv.style.visibility = 'hidden'

            const boardDiv = document.getElementById('computer-board')
            boardDiv.dataset.player = 'player2'

            const gameBoardContentDiv = document.querySelector('#computer .gameBoard-content')
            gameBoardContentDiv.style.visibility = 'visible'

            const titleContainer = contentDiv.querySelector('.title-container')
            titleContainer.style.visibility = 'visible'

            const title = contentDiv.querySelector('.title-container h1')
            title.textContent = 'Player 2 Fleet'
        }

        return {
            buttons,
            randomShipPlacementButton,
            startButton,
            orientationToggle,
            resetButton,
            game,
            players,
            secondPlayerBoard
        }
    })()

    const render = (function() {
        function boards() {
            if (GameBoard.getGameMode() === 'single') {
                render.singleBoard('player1')
                render.singleBoard('computer')
            }
            if (GameBoard.getGameMode() === 'multi') {
                render.singleBoard('player1')
                render.singleBoard('player2')
            }
        }
    
        function singleTags(player) {
            render.singleNumberTags(player)
            render.singleLetterTags(player)
        }
    
        function singleBoard(player) {
            if (player === 'player1') {
                const player1 = Player.getPlayer('player1')
                const player1BoardDomElement = document.querySelector('#human-board')
                render.boardCells(player1BoardDomElement, player1.board)
                render.singleTags(player)
            }

            if (player === 'player2') {
                const player2 = Player.getPlayer('player2')
                const player2BoardDomElement = document.querySelector('#computer-board')
                render.boardCells(player2BoardDomElement, player2.board)
                render.singleTags(player)
            }

            if (player === 'computer') {
                const computer = Player.getPlayer('computer')
                const computerBoardDomElement = document.querySelector('#computer-board')
                render.boardCells(computerBoardDomElement, computer.board)
                render.singleTags(player)
            }
        }
        
        function boardCells(domElement, board) {
    
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

                    if (GameBoard.getGameMode() === 'single') {
                        if (boardDomElement.id === 'computer-board') {
                            cellDomElement.dataset.player = 'computer'
                            cellDomElement.addEventListener('click', (event) => {
                                attack(event.target)
                            })
                        }

                        if (boardDomElement.id === 'human-board') {
                            cellDomElement.dataset.player = 'player1'
                            cellDomElement.addEventListener("dragover", handleDragOver);
                            cellDomElement.addEventListener("drop", handleDrop);
                            cellDomElement.addEventListener("dragenter", handleDragEnter);
                            cellDomElement.addEventListener("dragleave", handleDragLeave);
                        }
                    }

                    if (GameBoard.getGameMode() === 'multi') {
                        if (boardDomElement.id === 'human-board' || boardDomElement.dataset.player === 'player2') {
                            cellDomElement.addEventListener("dragover", handleDragOver);
                            cellDomElement.addEventListener("drop", handleDrop);
                            cellDomElement.addEventListener("dragenter", handleDragEnter);
                            cellDomElement.addEventListener("dragleave", handleDragLeave);
                        }
                        
                        if (boardDomElement.id === 'human-board') {
                            cellDomElement.dataset.player = 'player1'
                        }

                        if (boardDomElement.dataset.player === 'player2') {
                            cellDomElement.dataset.player = 'player2'
                        }
                    }
    
                    if (typeof cell === 'object' && cell !== null && cell !== 'miss') {
                        const ship = board[row][column]
    
                        if (boardDomElement.id === 'human-board' || boardDomElement.dataset.player === 'player2') {

                            if (GameBoard.getGameMode() === 'multi') {
                                const currentPlayer = GameBoard.getCurrentPlayer()
                                const target = currentPlayer === 'player1' ? 'player2' : 'player1'

                                if (cellDomElement.dataset.player !== target) {
                                    cellDomElement.classList.add('ship')

                                    cellDomElement.addEventListener('click', () => {
                                        if (!gameStarted) {
                                            removeShip(ship, row, column);
                                        }
                                    })
                                }
                            }

                            if (GameBoard.getGameMode() === 'single') {
                                cellDomElement.classList.add('ship')

                                cellDomElement.addEventListener('click', () => {
                                    if (!gameStarted) {
                                        removeShip(ship, row, column);
                                    }
                                })
                            }
                        }
    
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

        function singleNumberTags(player) {
            let containerSelector;

            if (player === 'player1') {
                containerSelector = '#human .numbers'
            }

            if (player === 'player2' || player === 'computer') {
                containerSelector = '#computer .numbers'
            }

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
    
        function singleLetterTags(player) {
            let containerSelector;

            if (player === 'player1') {
                containerSelector = '#human .numbers'
            }

            if (player === 'player2' || player === 'computer') {
                containerSelector = '#computer .numbers'
            }

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

        function ships() {
            if (GameBoard.getGameMode() === 'single') {
                const shipSizes = GameBoard.getShipSizes()
                const shipsContainer = document.querySelector('.content#human .ships')
                shipsContainer.innerHTML = ''
        
                shipSizes.forEach(size => {
                    const shipContainer = document.createElement('div')
                    shipContainer.classList.add('ship-container')
                    shipContainer.dataset.length = size
                    shipContainer.dataset.name = setShipName(size)
                    shipContainer.draggable = true
        
                    shipContainer.style.flexDirection = isHorizontal ? 'row' : 'column';
        
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

            if (GameBoard.getGameMode() === 'multi') {
                const shipSizes = GameBoard.getShipSizes()
                const shipsContainer = document.querySelectorAll('.ships')

                shipsContainer.forEach(shipContainer => {
                    shipContainer.innerHTML = ''

                    shipSizes.forEach(size => {
                        const shipContent = document.createElement('div')
                        shipContent.classList.add('ship-container')
                        shipContent.dataset.length = size
                        shipContent.dataset.name = setShipName(size)
                        shipContent.draggable = true
            
                        shipContent.style.flexDirection = isHorizontal ? 'row' : 'column';
            
                        shipContent.addEventListener('dragstart', handleDragStart)
                        shipContent.addEventListener('dragend', handleDragEnd)
            
                        for (let index = 0; index < size; index++) {
                            const shipCell = document.createElement('div')
                            shipCell.classList.add('ship-cell')
                            shipContent.appendChild(shipCell)
                        }
            
                        shipContent.addEventListener('dragstart', (e) => {
                            draggedShipLength = parseInt(e.target.dataset.length)
                        })
            
                        shipContainer.appendChild(shipContent)
                    })
                })
            }
        }

        return {
            boards,
            singleTags,
            singleBoard,
            boardCells,
            singleNumberTags,
            singleLetterTags,
            ships
        }
    })()

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

    function getShipNameFromLength(length) {
        return setShipName(length)
    }

    function init() {
        showGameModeModal()
    }

    function showGameModeModal() {
        const modal = document.getElementById('game-mode-modal')
        const singlePlayerBtn = document.getElementById('single-player')
        const multiPlayerBtn = document.getElementById('multi-player')

        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
            }
        })

        singlePlayerBtn.addEventListener('click', (event) => {
            handleSinglePlayer(event, modal)
        })

        multiPlayerBtn.addEventListener('click', (event) => {
            handleMultiPlayer(event, modal)
        })

        modal.showModal()
    }

    function handleSinglePlayer(e, modal) {
        modal.close()
        GameBoard.setGameMode('single')
        setup.game()
    }

    function handleMultiPlayer(e, modal) {
        modal.close()
        GameBoard.setGameMode('multi')
        setup.game()
    }

    function showContent() {
        if (GameBoard.getGameMode() === 'single') {
            const contentDivs = document.querySelectorAll('.content')
            contentDivs.forEach(content => content.style.visibility = 'visible')
        }

        if (GameBoard.getGameMode() === 'multi') {
            const player1ContentDiv = document.querySelector('#human')
            player1ContentDiv.style.visibility = 'visible'
        }
    }

    function removeShip(ship, clickedRow, clickedColumn) {
        const board = Player.getPlayer(GameBoard.getCurrentPlayer()).board;
        const shipLength = ship.length;
        const shipName = getShipNameFromLength(shipLength);

        for (let i = 0; i < ship.notHitCells.length; i++) {
            const [row, col] = ship.notHitCells[i];
            board[row][col] = null;
        }
        for (let i = 0; i < ship.hitCells.length; i++) {
            const [row, col] = ship.hitCells[i];
            board[row][col] = null;
        }

        addShipToContainer(shipLength, shipName);

        render.singleBoard(GameBoard.getCurrentPlayer());

        if (!GameBoard.areShipsPlaced(board)) {
            disableStartButton();
        }
    }

    function addShipToContainer(length, name) {
        if (GameBoard.getGameMode() === 'single') {
            const shipsContainer = document.querySelector('.ships');
            const shipContainer = document.createElement('div');
            shipContainer.classList.add('ship-container');
            shipContainer.dataset.length = length;
            shipContainer.dataset.name = name;
            shipContainer.draggable = true;
    
            shipContainer.style.flexDirection = isHorizontal ? 'row' : 'column';
    
            shipContainer.addEventListener('dragstart', handleDragStart);
            shipContainer.addEventListener('dragend', handleDragEnd);
    
            for (let index = 0; index < length; index++) {
                const shipCell = document.createElement('div');
                shipCell.classList.add('ship-cell');
                shipContainer.appendChild(shipCell);
            }
    
            shipsContainer.appendChild(shipContainer);
        }

        if (GameBoard.getGameMode() === 'multi') {
            const currentPlayer = GameBoard.getCurrentPlayer()
            let shipsContainer;

            if (currentPlayer === 'player1') {
                shipsContainer = document.querySelector('#human .ships')
            }

            if (currentPlayer === 'player2') {
                shipsContainer = document.querySelector('#computer .ships')
            }

            const shipContainer = document.createElement('div');
            shipContainer.classList.add('ship-container');
            shipContainer.dataset.length = length;
            shipContainer.dataset.name = name;
            shipContainer.draggable = true;
            shipContainer.style.flexDirection = isHorizontal ? 'row' : 'column';
            shipContainer.addEventListener('dragstart', handleDragStart);
            shipContainer.addEventListener('dragend', handleDragEnd);

            for (let index = 0; index < length; index++) {
                const shipCell = document.createElement('div');
                shipCell.classList.add('ship-cell');
                shipContainer.appendChild(shipCell);
            }
    
            shipsContainer.appendChild(shipContainer);
        }
    }

    function resetBoards() {
        if (GameBoard.getGameMode() === 'single') {
            let humanBoard = Player.getPlayer('player1').board
            let computerBoard = Player.getPlayer('computer').board
    
            humanBoard = GameBoard.create()
            computerBoard = GameBoard.create()
        }

        if (GameBoard.getGameMode() === 'multi') {
            let player1board = Player.getPlayer('player1').board
            let player2board = Player.getPlayer('player2').board

            player1board = GameBoard.create()
            player2board = GameBoard.create()
        }
    }

    function resetSingleBoard(player) {
        let playerBoard = Player.getPlayer(player).board
        playerBoard = GameBoard.create();
    }

    function placeComputerShips() {
        const computerBoard = Player.getPlayer('computer').board
        GameBoard.placeShipsRandomly(computerBoard)
        render.singleBoard('computer')
    }

    function showPassDeviceModal() {
        const modal = document.getElementById('pass-device-modal')
        const continueButton = document.getElementById('pass-device-continue')
        const modalTitle = document.querySelector('.pass-device-title')

        const player = GameBoard.getCurrentPlayer()
        const target = player === 'player1' ? 'player2' : 'player1'
        const targetName = player === 'player1' ? 'Player 2' : 'Player 1'
        modalTitle.textContent = `Pass the device to the ${targetName}.`

        function toggleContentView() {
            const id = player === 'player1' ? 'human' : 'computer'
            const gameBoardContentId = player === 'player1' ? '#human .gameBoard-content' : '#computer .gameBoard-content'
            const buttonsId = player === 'player1' ? '#human .buttons' : '#computer .buttons'
            const shipsId = player === 'player1' ? '#human .ships' : '#computer .ships'
            const content = document.getElementById(id)
            const gameBoardContent = document.querySelector(gameBoardContentId)
            const buttons = document.querySelector(buttonsId)
            const ships = document.querySelector(shipsId)


            const opponentId = player === 'player1' ? 'computer' : 'human'
            const opponentGameBoardContentId = player === 'player1' ? '#computer .gameBoard-content' : '#human .gameBoard-content'
            const opponentButtonsId = player === 'player1' ? '#computer .buttons' : '#human .buttons'
            const opponentShipsId = player === 'player1' ? '#computer .ships' : '#human .ships'
            const opponentContent = document.getElementById(opponentId)
            const opponentGameBoardContent = document.querySelector(opponentGameBoardContentId)
            const opponentButtons = document.querySelector(opponentButtonsId)
            const opponentShips = document.querySelector(opponentShipsId)

            content.style.visibility = 'hidden'
            gameBoardContent.style.visibility = 'visible'
            buttons.style.visibility = 'hidden'
            ships.style.visibility = 'hidden'

            opponentContent.style.visibility = 'visible'
            opponentGameBoardContent.style.visibility = 'visible'
            opponentButtons.style.visibility = 'visible'
            opponentShips.style.visibility = 'visible'
        }

        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
            }
        })

        continueButton.addEventListener('click', (e) => {
            modal.close()
            render.boards()
            toggleContentView()
            GameBoard.setCurrentPlayer(target)
        })

        modal.showModal()
    }

    function attack(domElement) {
        if (!gameStarted) return

        if (GameBoard.getGameMode() === 'single') {
            if (GameBoard.getCurrentPlayer() !== 'player1') return

            const row = parseInt(domElement.dataset.row)
            const column = parseInt(domElement.dataset.column)
            const computerBoard = Player.getPlayer('computer').board
    
            GameBoard.receiveAttack(row, column, computerBoard)
    
            if (GameBoard.isGameOver(computerBoard)) {
                render.singleBoard('computer')
                gameOver('player1')
                return
            }
    
            GameBoard.setCurrentPlayer('computer')
            render.singleBoard('computer')
    
            setTimeout(() => {
                computerAttack()
            }, 350);
        }

        if (GameBoard.getGameMode() === 'multi') {
            const row = parseInt(domElement.dataset.row)
            const column = parseInt(domElement.dataset.column)
            const target = GameBoard.getCurrentPlayer() === 'player1' ? 'player2' : 'player1'
            const targetBoard = Player.getPlayer(target).board

            GameBoard.receiveAttack(row, column, targetBoard)

            if (GameBoard.isGameOver(targetBoard)) {
                render.singleBoard(target)
                gameOver(GameBoard.getCurrentPlayer())
                return
            }

            render.singleBoard(target)
            showPassDeviceModal()
        }
    }

    function computerAttack() {
        if (GameBoard.getCurrentPlayer() !== 'computer') return;
    
        const humanBoard = Player.getPlayer('player1').board;
        const maxAttempts = 100;
        let attempts = 0;
        let found = false;
    
        // Persistent state
        let hitQueue = DomManager.hitQueue || []; // [{ row, col, ship }]
        let directionMap = DomManager.directionMap || new Map(); // Map<ship, 'horizontal'|'vertical'|null>
    
        // Helper: Check if a cell is valid for attack
        function isValidCell(row, col) {
            if (row < 0 || row >= 10 || col < 0 || col >= 10) return false;
            const cell = humanBoard[row][col];
            if (cell === 'miss') return false;
            if (typeof cell === 'object' && cell !== null) {
                const ship = cell;
                return !ship.hitCells.some(([r, c]) => r === row && c === col);
            }
            return true;
        }
    
        // Helper: Get all possible cells in the ship's direction
        function getDirectionalCells(ship, hitQueue) {
            const direction = directionMap.get(ship);
            const shipHits = hitQueue.filter(hit => hit.ship === ship);
            if (!direction || shipHits.length === 0) return [];
    
            let cells = [];
    
            if (direction === 'horizontal') {
                const row = shipHits[0].row;
                const cols = shipHits.map(hit => hit.col);
                const minCol = Math.min(...cols);
                const maxCol = Math.max(...cols);
                // Extend up to max ship length (5 for Carrier)
                for (let col = minCol - 5; col <= maxCol + 5; col++) {
                    if (col >= 0 && col < 10 && isValidCell(row, col)) {
                        cells.push([row, col]);
                    }
                }
            } else if (direction === 'vertical') {
                const col = shipHits[0].col;
                const rows = shipHits.map(hit => hit.row);
                const minRow = Math.min(...rows);
                const maxRow = Math.max(...rows);
                for (let row = minRow - 5; row <= maxRow + 5; row++) {
                    if (row >= 0 && row < 10 && isValidCell(row, col)) {
                        cells.push([row, col]);
                    }
                }
            }
    
            // Shuffle cells to avoid predictable order
            for (let i = cells.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cells[i], cells[j]] = [cells[j], cells[i]];
            }
            return cells;
        }
    
        // Helper: Get all adjacent cells in random order (fallback)
        function getAdjacentCells(row, col) {
            const directions = [
                [row - 1, col], // Up
                [row + 1, col], // Down
                [row, col - 1], // Left
                [row, col + 1], // Right
            ];
            // Shuffle directions
            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [directions[i], directions[j]] = [directions[j], directions[i]];
            }
            return directions.filter(([r, c]) => isValidCell(r, c));
        }
    
        // Helper: Infer ship direction based on hits
        function inferDirection(ship) {
            const shipHits = hitQueue.filter(hit => hit.ship === ship);
            if (shipHits.length < 2) return null;
    
            const [hit1, hit2] = shipHits;
            if (hit1.row === hit2.row) return 'horizontal';
            if (hit1.col === hit2.col) return 'vertical';
            return null;
        }
    
        while (!found && attempts < maxAttempts) {
            let row, col, currentShip;
    
            // Hunting mode: Prioritize directional cells
            if (hitQueue.length > 0) {
                ({ row, col, ship: currentShip } = hitQueue[0]);
                let direction = directionMap.get(currentShip) || inferDirection(currentShip);
    
                // Update directionMap if direction is inferred
                if (direction && !directionMap.has(currentShip)) {
                    directionMap.set(currentShip, direction);
                }
    
                let validCell = false;
    
                // Try directional cells if direction is known
                if (direction) {
                    const directionalCells = getDirectionalCells(currentShip, hitQueue);
                    if (directionalCells.length > 0) {
                        [row, col] = directionalCells[0];
                        validCell = true;
                    }
                }
    
                // Fallback to adjacent cells only if no direction is known
                if (!validCell && !direction) {
                    const adjacentCells = getAdjacentCells(row, col);
                    if (adjacentCells.length > 0) {
                        [row, col] = adjacentCells[0];
                        validCell = true;
                    }
                }
    
                if (!validCell) {
                    // No valid cells; try next hit in queue
                    hitQueue.shift();
                    attempts++;
                    continue;
                }
            } else {
                // Random mode
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * 10);
                if (!isValidCell(row, col)) {
                    attempts++;
                    continue;
                }
            }
    
            // Perform the attack
            GameBoard.receiveAttack(row, col, humanBoard);
            const cell = humanBoard[row][col];
    
            // Check if attack hit a ship
            if (typeof cell === 'object' && cell !== null) {
                hitQueue.push({ row, col, ship: cell });
            }
    
            // If ship is sunk, clear its state
            if (currentShip && currentShip.isSunk()) {
                hitQueue = hitQueue.filter(hit => hit.ship !== currentShip);
                directionMap.delete(currentShip);
            }
    
            // Update state
            DomManager.hitQueue = hitQueue;
            DomManager.directionMap = directionMap;
    
            if (GameBoard.isGameOver(humanBoard)) {
                render.singleBoard('player1');
                gameOver('computer');
                return;
            }
    
            GameBoard.setCurrentPlayer('player1');
            render.singleBoard('player1');
            found = true;
        }
    
        if (!found) {
            console.warn('Computer could not find a valid move after maximum attempts');
            GameBoard.setCurrentPlayer('player1');
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
            modalTitle.classList.remove('win')
        }

        if (GameBoard.getGameMode === 'single') {
            if (player === 'player1') {
                modalTitle.textContent = 'You won!'
                modalTitle.classList.add('win')
            }
    
            if (player === 'computer') {
                modalTitle.textContent = 'You lost :c'
            }
        }

        if (GameBoard.getGameMode === 'multi') {
            const winner = player === 'player1' ? 'Player 1' : 'Player 2'
            modalTitle.textContent = `${winner} wins!`
            modalTitle.classList.add('win')

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
        render.boards()
        render.ships()
        enableButtons()
        hitQueue = []
        directionMap = new Map()
        gameStarted = false
        disableStartButton()
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
        const board = Player.getPlayer(GameBoard.getCurrentPlayer()).board
        const ship = Ship.create(draggedShipLength)
        const draggedShip = document.querySelector(`[data-name="${draggedShipName}"]`)

        if (GameBoard.canBePlaced(row, column, board, ship.length, isHorizontal)) {
            GameBoard.place(row, column, board, ship, isHorizontal)
            render.singleBoard(GameBoard.getCurrentPlayer())
            draggedShip.remove()

            if (GameBoard.areShipsPlaced(board)) {
                enableStartButton()
            }
        }
        clearHighlights()
    }

    function clearHighlights() {
        if (GameBoard.getGameMode() === 'single') {
            const cells = document.querySelectorAll('#human-board .cell');
            cells.forEach(cell => {
                cell.classList.remove('valid', 'invalid');
            });
        }

        if (GameBoard.getGameMode() === 'multi') {
            const id = GameBoard.getCurrentPlayer() === 'player1' ? '#human-board' : '#computer-board'
            const cells = document.querySelectorAll(`${id} .cell`);
            cells.forEach(cell => {
                cell.classList.remove('valid', 'invalid');
            });
        }
    }

    function highlightCells(target) {
        clearHighlights();
        if (!draggedShipLength || gameStarted) return;

        const row = parseInt(target.dataset.row);
        const column = parseInt(target.dataset.column);
        const board = Player.getPlayer(GameBoard.getCurrentPlayer()).board;

        const id = GameBoard.getCurrentPlayer() === 'player1' ? '#human-board' : '#computer-board'

        const canPlace = GameBoard.canBePlaced(row, column, board, draggedShipLength, isHorizontal);

        for (let i = 0; i < draggedShipLength; i++) {
            const cellRow = isHorizontal ? row : row + i;
            const cellCol = isHorizontal ? column + i : column;
            
            if (cellRow >= 0 && cellRow < 10 && cellCol >= 0 && cellCol < 10) {
                const cell = document.querySelector(
                    `${id} .cell[data-row="${cellRow}"][data-column="${cellCol}"]`
                );
                if (cell) {
                    cell.classList.add(canPlace ? 'valid' : 'invalid');
                    highlightedCells.add(cell);
                }
            }
        }
    }

    function removeDraggableShips() {
        if (GameBoard.getGameMode() === 'single') {
            const shipsContainer = document.querySelector('.ships')
            shipsContainer.innerHTML = ''
        }

        if (GameBoard.getGameMode() === 'multi') {
            let shipsContainer;

            if (GameBoard.getCurrentPlayer() === 'player1') {
                shipsContainer = document.querySelector('#human .ships')
            }

            if (GameBoard.getCurrentPlayer() === 'player2') {
                shipsContainer = document.querySelector(`.ships[data-player="player2"]`)
            }

            shipsContainer.innerHTML = ''
        }
    }

    return {
        render,
        setup,
        init,
        resetBoards,
        resetSingleBoard,
        attack,
        gameOver,
        enableButtons,
        disableButtons,
        computerAttack,
        hitQueue
    }
})()