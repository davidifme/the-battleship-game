import { beforeEach, describe, it } from "vitest";
import { Player } from "../player";

describe('Player Functions', () => {

    beforeEach(() => {
        Player.reset()
    })

    it('should create a player with a specified type', () => {
        const player = Player.create('human');
        expect(player).toBeDefined();
        expect(player.playerType).toBe('human');
    });

    it('should not create more than two players', () => {
        Player.create('human');
        Player.create('computer');
        const thirdPlayer = Player.create('alien');
        expect(thirdPlayer).toBeUndefined();
    });

    it('should create a player with a game board', () => {
        const player = Player.create('human');

        expect(player.board).toBeDefined();
    });
});
