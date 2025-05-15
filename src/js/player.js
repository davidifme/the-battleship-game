import { GameBoard } from "./gameBoard"

export const Player = (function() {

    let players = []

    function create(playerType) {

        if (players.length === 2) return

        const player = {
            playerType,
            board: GameBoard.create()
        }

        players.push(player)

        return player
    }

    function reset() {
        players = []
    }

    return {
        create,
        reset
    }
})()