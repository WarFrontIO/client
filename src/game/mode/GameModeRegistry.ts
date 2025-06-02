import type {GameMode} from "./GameMode";
import type {GameModeIds} from "../../network/protocol/util/GameTypeIds";
import {FFAGameMode} from "./FFAGameMode";
import {InvalidArgumentException} from "../../util/Exceptions";

const gameModes: { [id in GameModeIds]: GameMode } & GameMode[] = [
	new FFAGameMode()
];

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