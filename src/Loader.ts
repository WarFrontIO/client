import {GameRenderer} from "./renderer/GameRenderer";
import {TileManager} from "./map/TileManager";
import {startGame} from "./game/Game";
import {mapFromId} from "./map/MapRegistry";

export const tileManager = new TileManager();
export const gameRenderer = new GameRenderer();

//dummy game
startGame(mapFromId(Math.floor(Math.random() * 2)));