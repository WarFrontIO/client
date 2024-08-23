import {GameMode} from "./GameMode";
import {InvalidArgumentException} from "../../util/exception/InvalidArgumentException";
import {FFAGameMode} from "./FFAGameMode";
import {GameModeIds} from "../../network/protocol/util/GameTypeIds";

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