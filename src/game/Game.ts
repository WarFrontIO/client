import {GameMap} from "../map/GameMap";
import {gameRenderer} from "../Loader";
import {mapNavigationHandler} from "./action/MapNavigationHandler";
import {territoryManager} from "./TerritoryManager";
import {playerManager} from "./player/PlayerManager";
import {Player} from "./player/Player";
import {mapActionHandler} from "./action/MapActionHandler";
import {spawnManager} from "./player/SpawnManager";
import {random} from "./Random";
import {gameTicker} from "./GameTicker";

export let gameMap: GameMap;
export let isLocalGame: boolean;

export function startGame(map: GameMap) {
	gameMap = map;
	mapNavigationHandler.enable();
	mapActionHandler.enable();
	gameRenderer.updateLayers();
	territoryManager.reset();
	spawnManager.init(500);
	playerManager.init([new Player(0, "Player", 0, 200, 200)], 0, 500);

	isLocalGame = true;
	random.reset(23452345);
}

export function startGameCycle() {
	gameTicker.start();
}