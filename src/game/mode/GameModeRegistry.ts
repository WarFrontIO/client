import type {GameMode} from "./GameMode";
import type {GameModeIds} from "../../network/protocol/util/GameTypeIds";
import {InvalidArgumentException} from "../../util/Exceptions";

const gameModes: GameMode[] = [];

/**
 * Returns all registered game modes.
 */
export function getGameModes(): GameMode[] {
	return gameModes;
}

/**
 * Returns the game mode with the given id.
 * @param id The id of the game mode.
 */
export function gameModeFromId(id: GameModeIds): GameMode {
	if (!gameModes[id]) {
		throw new InvalidArgumentException(`No game mode with id ${id}`);
	}
	return gameModes[id];
}

/**
 * Register a game mode.
 * @param id The id of the game mode.
 * @param gameMode The game mode to register.
 */
export function registerGameMode(id: GameModeIds, gameMode: GameMode): void {
	if (gameModes[id]) {
		throw new InvalidArgumentException(`Game mode with id ${id} already registered`);
	}
	gameModes[id] = gameMode;
}