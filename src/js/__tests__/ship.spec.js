import { describe, expect, it } from "vitest";
import { Ship } from "../ship";
import { GameBoard } from "../gameBoard";

describe('Ship Functions', () => {

    let board;

    beforeEach(() => {
        board = Array(10).fill().map(() => Array(10).fill(null));
    });

    it('creates a ship object', () => {
        const ship = Ship.create(5)

        expect(ship).toBeTypeOf('object')
    })

    it('returns true when the ship is sunk', () => {
        const ship = Ship.create(1)
        GameBoard.place(0, 0, board, ship)

        ship.hit(0, 0)

        expect(ship.isSunk()).toBe(true)
    })

    it('returns false when the ship is not sunk', () => {
        const ship = Ship.create(2)
        GameBoard.place(0, 0, board, ship)

        ship.hit(0, 0)

        expect(ship.isSunk()).toBe(false)
    })

    it('correctly tracks hits on the ship', () => {
        const ship = Ship.create(3);
        GameBoard.place(0, 0, board, ship)
        ship.hit(0, 0);
        ship.hit(0, 1);

        expect(ship.hitCells.length).toBe(2);
        expect(ship.notHitCells.length).toBe(1);
    });

    it('does not register the same hit twice', () => {
        const ship = Ship.create(3);
        GameBoard.place(0, 0, board, ship)
        ship.hit(0, 0);
        ship.hit(0, 0);

        expect(ship.hitCells.length).toBe(1);
        expect(ship.notHitCells.length).toBe(2);
    });

    it('initializes with correct length', () => {
        const ship = Ship.create(4);

        expect(ship.length).toBe(4);
    });

    it('initializes with no hits', () => {
        const ship = Ship.create(3);

        expect(ship.hits).toBe(0);
    });

    it('updates hits count correctly', () => {
        const ship = Ship.create(3);
        GameBoard.place(0, 0, board, ship)
        
        ship.hit(0, 0);
        ship.hit(0, 1);

        expect(ship.hits).toBe(2);
    });
})