import { DomManager } from "./domManager";
import { GameBoard } from "./gameBoard";
import { Player } from "./player";
import { Ship } from "./ship";

const human = Player.create('human');
const computer = Player.create('computer');

DomManager.init();
