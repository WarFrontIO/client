import {startGame} from "../../game/Game";
import {mapFromId} from "../../map/MapRegistry";
import { getSetting, updateSetting } from "../../util/UserSettingManager";
import {closeModule, ModuleAdapter} from "../ModuleLoader";
import {openModule} from "../ModuleLoader";

const switchGameClock = (window).document.getElementById("switchGameClock") as HTMLInputElement;

export default {
	onOpen: () => {
			switchGameClock.checked = getSetting("gameHud-clock");
	}
} as ModuleAdapter;

(window as any).commandToggleClockSetting = function (element: HTMLInputElement) {
	updateSetting("gameHud-clock", element.checked);
};

(window as any).commandCloseSettingsPanel = function () {
	closeModule("SettingsPanel");
};

