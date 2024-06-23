import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import {closeMenu} from "../ModuleLoader";
import {openMenu} from "../ModuleLoader";
import {FFAGameMode} from "../../game/mode/FFAGameMode";

(window as any).commandStartGame = function () {
	closeMenu();
	openMenu("GameHud");
	startGame(mapFromId(Math.floor(Math.random() * 2)), new FFAGameMode());
};

(window as any).commandShowCommunity = function () {
	openMenu("CommunityPanel");
};