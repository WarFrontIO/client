import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import {closeMenu} from "../ModuleLoader";
import {openMenu} from "../ModuleLoader";

(window as any).commandClosePanel = function () {
	closeMenu();
	openMenu("MainMenu");
};