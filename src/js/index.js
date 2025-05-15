import { GameBoard } from "./gameBoard";
import { Ship } from "./ship";

const ship = Ship.create(5)
GameBoard.place(0, 0, GameBoard.getBoard(), ship)

console.log(ship)