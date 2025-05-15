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

    function getPlayer(playerType) {

        for (let index = 0; index < players.length; index++) {
            if (players[index].playerType === playerType) {
                return players[index]
            }
        }

        return null
    }

    return {
        create,
        reset,
        getPlayer
    }
})()