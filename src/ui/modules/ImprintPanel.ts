import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import {closeModule} from "../ModuleLoader";
import {openModule} from "../ModuleLoader";

(window as any).commandCloseImprintPanel = function () {
	closeModule("ImprintPanel");
};