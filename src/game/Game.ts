import {GameMap} from "../map/GameMap";
import {mapNavigationHandler} from "./action/MapNavigationHandler";
import {territoryManager} from "./TerritoryManager";
import {playerManager} from "./player/PlayerManager";
import {Player} from "./player/Player";
import {mapActionHandler} from "./action/MapActionHandler";
import {spawnManager} from "./player/SpawnManager";
import {random} from "./Random";
import {playerNameRenderingManager} from "../renderer/manager/PlayerNameRenderingManager";
import {attackActionHandler} from "./attack/AttackActionHandler";
import {HSLColor} from "../util/HSLColor";
import {GameMode} from "./mode/GameMode";
import {boatManager} from "./boat/BoatManager";
import {initGameData} from "./GameData";
import {ClientPlayer} from "./player/ClientPlayer";
import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {borderManager} from "./BorderManager";

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
	gameLoadRegistry.broadcast();
	mapNavigationHandler.enable();
	mapActionHandler.enable();
	territoryManager.reset();
	const maxPlayers = spawnManager.init(500);
	borderManager.reset(maxPlayers);
	boatManager.reset();
	playerNameRenderingManager.reset(maxPlayers);
	attackActionHandler.init(maxPlayers);
	playerManager.init(players.map((p, i) => new (i === clientId ? ClientPlayer : Player)(i, p.name, HSLColor.fromRGB(0, 200, 200))), clientId, maxPlayers);

	random.reset(seed);
	gameStartRegistry.broadcast();
}

export const gameLoadRegistry = new EventHandlerRegistry<[]>();
export const gameStartRegistry = new EventHandlerRegistry<[]>();