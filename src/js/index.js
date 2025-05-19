import { DomManager } from "./domManager";
import { GameBoard } from "./gameBoard";
import { Player } from "./player";
import { Ship } from "./ship";

const human = Player.create('human');
const computer = Player.create('computer');

DomManager.init();

console.log('Computer from index.js:', computer);
console.log('Computer board from index.js:', computer.board);
console.log('Computer from Player.getPlayer:', Player.getPlayer('computer'));