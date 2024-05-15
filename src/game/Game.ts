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
import {playerNameRenderingManager} from "../renderer/manager/PlayerNameRenderingManager";
import {attackActionHandler} from "./action/AttackActionHandler";
import {Color} from "../util/Color";

/**
 * The map of the current game.
 */
export let gameMap: GameMap;
/**
 * Local games are directly played on the client without any server interaction.
 */
export let isLocalGame: boolean;

/**
 * Start a new game with the given map.
 * @param map The map to start the game with.
 */
export function startGame(map: GameMap) {
	gameMap = map;
	mapNavigationHandler.enable();
	mapActionHandler.enable();
	gameRenderer.initGameplayLayers();
	territoryManager.reset();
	playerNameRenderingManager.reset();
	attackActionHandler.init(500);
	spawnManager.init(500);
	playerManager.init([new Player(0, "Player", Color.fromRGB(0, 200, 200))], 0, 500);

	isLocalGame = true;
	random.reset(23452345);
}

/**
 * Start the game cycle.
 * @internal This method is called by the spawn manager when the player has selected a spawn point.
 */
export function startGameCycle() {
	gameTicker.start();
}