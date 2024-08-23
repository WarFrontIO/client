import {GameMap} from "../map/GameMap";
import {mapNavigationHandler} from "./action/MapNavigationHandler";
import {territoryManager} from "./TerritoryManager";
import {playerManager} from "./player/PlayerManager";
import {Player} from "./player/Player";
import {mapActionHandler} from "./action/MapActionHandler";
import {spawnManager} from "./player/SpawnManager";
import {random} from "./Random";
import {gameTicker} from "./GameTicker";
import {playerNameRenderingManager} from "../renderer/manager/PlayerNameRenderingManager";
import {attackActionHandler} from "./attack/AttackActionHandler";
import {HSLColor} from "../util/HSLColor";
import {GameMode} from "./mode/GameMode";
import {gameRenderer} from "../renderer/GameRenderer";
import {boatManager} from "./boat/BoatManager";
import {initGameData} from "./GameData";

/**
 * Start a new game with the given map.
 * @param map The map to start the game with
 * @param mode The game mode to use
 * @param seed The seed for the random number generator
 * @param players The players in the game
 * @param clientId The id of the local player
 * @param isLocal Whether the game is a local game
 */
export function startGame(map: GameMap, mode: GameMode, seed: number, players: { name: string }[], clientId: number, isLocal: boolean) {
	initGameData(map, mode, isLocal);
	mapNavigationHandler.enable();
	mapActionHandler.enable();
	territoryManager.reset();
	boatManager.reset();
	gameRenderer.initGameplayLayers();
	playerNameRenderingManager.reset(500);
	attackActionHandler.init(500);
	spawnManager.init(500);
	playerManager.init(players.map((p, i) => new Player(i, p.name, HSLColor.fromRGB(0, 200, 200))), clientId, 500);

	random.reset(seed);
}
