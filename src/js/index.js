import { DomManager } from "./domManager";
import { GameBoard } from "./gameBoard";
import { Player } from "./player";
import { Ship } from "./ship";

const human = Player.create('human')
const computer = Player.create('computer')

const humanBoard = human.board
const computerBoard = computer.board

const humanShip1 = Ship.create(3)
const humanShip2 = Ship.create(2)

const computerShip1 = Ship.create(3)
const computerShip2 = Ship.create(2)

GameBoard.place(0, 0, humanBoard, humanShip1)
GameBoard.place(2, 0, humanBoard, humanShip2)

GameBoard.place(0, 0, computerBoard, computerShip1)
GameBoard.place(2, 0, computerBoard, computerShip2)

GameBoard.receiveAttack(0, 0, humanBoard)
GameBoard.receiveAttack(0, 1, computerBoard)

DomManager.renderBoards()
