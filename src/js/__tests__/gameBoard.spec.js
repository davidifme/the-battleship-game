import { beforeEach, describe, expect, it } from "vitest";
import { Ship } from "../ship";
import { GameBoard } from "../gameBoard";

describe('GameBoard Functions', () => {
    let board;

    beforeEach(() => {
        board = Array(10).fill().map(() => Array(10).fill(null));
    });

    describe('place()', () => {
        it('places ship at specific coordinates', () => {
            const ship = Ship.create(3);
            GameBoard.place(0, 0, board, ship);

            expect(board[0][0]).toBe(ship);
            expect(board[0][1]).toBe(ship);
            expect(board[0][2]).toBe(ship);
        });

        it('does not place ship if it does not fit horizontally', () => {
            const ship = Ship.create(3);
            GameBoard.place(0, 8, board, ship);

            expect(board[0][8]).toBe(null);
            expect(board[0][9]).toBe(null);
        });

        it('does not place ship if it overlaps with another ship', () => {
            const ship1 = Ship.create(3);
            const ship2 = Ship.create(2);
            GameBoard.place(0, 0, board, ship1);
            GameBoard.place(0, 1, board, ship2);

            expect(board[0][0]).toBe(ship1);
            expect(board[0][1]).toBe(ship1);
            expect(board[0][2]).toBe(ship1);
            expect(board[0][3]).toBe(null);
        });

        it('does not place ship if position is out of bounds', () => {
            const ship = Ship.create(3);
            GameBoard.place(-1, 0, board, ship);

            expect(board[0][0]).toBe(null);
            expect(board[0][1]).toBe(null);
            expect(board[0][2]).toBe(null);
        });
        it('does not place ship if there is no 1-cell buffer around the ship', () => {
            const ship1 = Ship.create(3);
            const ship2 = Ship.create(2);
            GameBoard.place(0, 0, board, ship1);
            GameBoard.place(1, 1, board, ship2);

            expect(board[1][1]).toBe(null);
            expect(board[1][2]).toBe(null);
        });

        it('places ship if there is a 1-cell buffer around the ship', () => {
            const ship1 = Ship.create(3);
            const ship2 = Ship.create(2);
            GameBoard.place(0, 0, board, ship1);
            GameBoard.place(2, 0, board, ship2);

            expect(board[2][0]).toBe(ship2);
            expect(board[2][1]).toBe(ship2);
        });
    });

    describe('receiveAttack()', () => {
        it("sends the 'hit' function to the correct ship", () => {
            const ship = Ship.create(3)
            GameBoard.place(0, 0, board, ship)

            GameBoard.receiveAttack(0, 0, board)

            expect(ship.hitCells[0][0]).toBe(0)
            expect(ship.hitCells[0][1]).toBe(0)
        })

        it("marks the board with 'miss' if no ship is present", () => {
            GameBoard.receiveAttack(0, 0, board);

            expect(board[0][0]).toBe('miss');
        });

        it("does not mark 'miss' if the cell is already marked as 'miss'", () => {
            board[0][0] = 'miss';
            GameBoard.receiveAttack(0, 0, board);

            expect(board[0][0]).toBe('miss');
        });

        it("does not affect the board if the attack is out of bounds", () => {
            GameBoard.receiveAttack(-1, 0, board);
            GameBoard.receiveAttack(0, 10, board);

            expect(board[0][0]).toBe(null);
            expect(board[0][9]).toBe(null);
        });

        it("does not affect the board if the attack is on a cell with a ship that is already hit", () => {
            const ship = Ship.create(3);
            GameBoard.place(0, 0, board, ship);
            GameBoard.receiveAttack(0, 0, board);
            GameBoard.receiveAttack(0, 0, board);

            expect(ship.hitCells.length).toBe(1);
        });
    })

    describe('isGameOver()', () => {
        it("returns true when all ships are sunk", () => {
            const ship1 = Ship.create(1);
            const ship2 = Ship.create(1);
            GameBoard.place(0, 0, board, ship1);
            GameBoard.place(2, 0, board, ship2);

            GameBoard.receiveAttack(0, 0, board);
            GameBoard.receiveAttack(2, 0, board);

            expect(GameBoard.isGameOver(board)).toBe(true);
        });

        it("returns false when at least one ship is not sunk", () => {
            const ship1 = Ship.create(1);
            const ship2 = Ship.create(1);
            GameBoard.place(0, 0, board, ship1);
            GameBoard.place(2, 0, board, ship2);

            GameBoard.receiveAttack(0, 0, board);

            expect(GameBoard.isGameOver(board)).toBe(false);
        });

        it("returns true when there are no ships on the board", () => {
            expect(GameBoard.isGameOver(board)).toBe(true);
        });
    })

    describe('placeShipsRandomly(board)', () => {
        it("successfully places all ships on the board", () => {
            GameBoard.placeShipsRandomly(board);
            
            let shipCount = 0;
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {
                    if (board[row][col] !== null) {
                        shipCount++;
                    }
                }
            }
            
            // Expecting 17 cells to be occupied by ships (5 ships with lengths 5, 4, 3, 3, 2)
            expect(shipCount).toBe(17);
        });

        it("places ships without overlapping", () => {
            GameBoard.placeShipsRandomly(board);
            
            // If ships overlap, we would have fewer unique ship objects than expected
            const ships = new Set();
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {
                    if (board[row][col] !== null) {
                        ships.add(board[row][col]);
                    }
                }
            }
            
            // Expecting 5 unique ships
            expect(ships.size).toBe(5);
        });

        it("places ships within board boundaries", () => {
            GameBoard.placeShipsRandomly(board);
            
            let outOfBounds = false;
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {
                    if (board[row][col] !== null) {
                        if (row < 0 || row >= 10 || col < 0 || col >= 10) {
                            outOfBounds = true;
                        }
                    }
                }
            }
            
            expect(outOfBounds).toBe(false);
        });
    })
});