import { GameBoard } from "./gameBoard"

export const Player = (function() {
    let players = []

    function create(playerType, isHuman = true) {
        if (players.length === 2) return

        const player = {
            playerType,
            board: GameBoard.create(),
            isHuman
        }

        players.push(player)
        return player
    }

    function reset() {
        players = []
    }

    function getPlayer(playerType) {
        return players.find(player => player.playerType === playerType) || null
    }

    return {
        create,
        reset,
        getPlayer
    }
})()