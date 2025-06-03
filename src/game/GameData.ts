import type {GameMap} from "../map/GameMap";
import type {GameMode} from "./mode/GameMode";

/**
 * The map of the current game.
 */
export let gameMap: GameMap;
/**
 * The current game mode.
 */
export let gameMode: GameMode;
/**
 * Whether the game is currently running.
 */
export let isPlaying: boolean;
/**
 * Local games are directly played on the client without any server interaction.
 */
export let isLocalGame: boolean;

export function initGameData(map: GameMap, mode: GameMode, isLocal: boolean): void {
	gameMap = map;
	gameMode = mode;
	isLocalGame = isLocal;
	isPlaying = true;
}

export function resetGameData(): void {
	isPlaying = false;
}