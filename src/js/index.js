import { DomManager } from "./domManager";
import { GameBoard } from "./gameBoard";
import { Player } from "./player";
import { Ship } from "./ship";

const human = Player.create('human');
const computer = Player.create('computer');

const humanBoard = human.board;
const computerBoard = computer.board;

const shipSizes = [5, 4, 3, 3, 2];

// placeShipsRandomly(humanBoard);
// placeShipsRandomly(computerBoard);

DomManager.renderBoards();
