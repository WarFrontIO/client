import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import { getSetting } from "../../util/UserSettingManager";
import {closeModule, ModuleAdapter} from "../ModuleLoader";
import {openModule} from "../ModuleLoader";

export default {
	onOpen: () => {
		openModule("GameHud-TopBar");
	}
} as ModuleAdapter;