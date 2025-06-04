import type {GameMap} from "../map/GameMap";
import type {GameMode} from "./mode/GameMode";
import type {GameResult} from "./result/GameResult";
import {mapNavigationHandler} from "./action/MapNavigationHandler";
import {territoryManager} from "./TerritoryManager";
import {playerManager} from "./player/PlayerManager";
import {Player} from "./player/Player";
import {spawnManager} from "./player/SpawnManager";
import {random} from "./Random";
import {attackActionHandler} from "./attack/AttackActionHandler";
import {HSLColor} from "../util/HSLColor";
import {initGameData, resetGameData} from "./GameData";
import {ClientPlayer} from "./player/ClientPlayer";
import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {borderManager} from "./BorderManager";
import {gameTicker} from "./GameTicker";

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
	territoryManager.reset();
	const maxPlayers = spawnManager.init(500);
	borderManager.reset(maxPlayers);
	attackActionHandler.init(maxPlayers);
	playerManager.init(players.map((p, i) => new (i === clientId ? ClientPlayer : Player)(i, p.name, HSLColor.fromRGB(0, 200, 200))), clientId, maxPlayers);

	random.reset(seed);
	gameInitHandler.broadcast();
	playerManager.randomizeSpawnPoints();
}

/**
 * Starts the playable part of the game, normally called by spawn selector.
 */
export function actuallyStartGame() {
	gameTicker.start();
	gameStartRegistry.broadcast();
	gameResumeRegistry.broadcast();
}

/**
 * Pauses the game, this should also block (most) interactions with the game.
 */
export function pauseGame() {
	gameTicker.pause();
	gamePauseRegistry.broadcast();
}

/**
 * Resumes the game after it was paused.
 */
export function resumeGame() {
	gameResumeRegistry.broadcast();
	gameTicker.resume();
}

/**
 * Quit the game, this should stop all game relevant tasks
 */
export function quitGame() {
	gameQuitRegistry.broadcast();
	gameTicker.stop();
	gamePauseRegistry.broadcast();
	resetGameData();
}

/**
 * Call-order of these events:
 * 1. gameLoad - after maps are loaded, most methods won't work at this point
 * 2. gameInit - after initializing game data such as players
 * 3. gameStart - after players selected their spawns, before the first tick is processed (also fires a gameResume)
 * 4. gameResult - after the game finished (also fires a gamePause), this might be called again after the game is resumed
 * 5. gameQuit - before the client leaves the game
 *
 * gamePause and gameResume are called whenever the ticker is paused or resumed.
 * If {@link GameTicker.isPaused} is false this event was fired along gameInit or gameResult.
 */
export const gameLoadRegistry = new EventHandlerRegistry<[]>();
export const gameInitHandler = new EventHandlerRegistry<[]>();
export const gameStartRegistry = new EventHandlerRegistry<[]>();
export const gamePauseRegistry = new EventHandlerRegistry<[]>();
export const gameResumeRegistry = new EventHandlerRegistry<[]>();
export const gameResultRegistry = new EventHandlerRegistry<[GameResult]>();
export const gameQuitRegistry = new EventHandlerRegistry<[]>();