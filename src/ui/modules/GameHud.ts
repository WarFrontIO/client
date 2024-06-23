import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import {closeMenu} from "../ModuleLoader";
import {openMenu} from "../ModuleLoader";

(window as any).commandShowSettings = function () {
	alert("Nothing to see here yet XD");
};

(window as any).commandExitGame = function () {
	window.location.reload();
};