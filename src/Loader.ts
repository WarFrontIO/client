import {GameRenderer} from "./renderer/GameRenderer";
import {TileManager} from "./map/TileManager";
import {MapBuilder} from "./map/MapBuilder";
import {startGame} from "./game/Game";

export const tileManager = new TileManager();
export const mapBuilder = new MapBuilder();
export const gameRenderer = new GameRenderer();

//dummy game
mapBuilder.fromPath("../resources/map.png").then(map => startGame(map));