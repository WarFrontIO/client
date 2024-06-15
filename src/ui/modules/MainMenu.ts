import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import {closeMenu} from "../ModuleLoader";
import {FFAGameMode} from "../../game/mode/FFAGameMode";

(window as any).commandStartGame = function () {
	closeMenu();
	startGame(mapFromId(Math.floor(Math.random() * 2)), new FFAGameMode());
}