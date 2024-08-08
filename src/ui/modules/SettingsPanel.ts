import {registerSettingListener, updateSetting} from "../../util/UserSettingManager";
import {closeModule} from "../ModuleLoader";

const switchGameClock = (window).document.getElementById("switchGameClock") as HTMLInputElement;

registerSettingListener("hud-clock", show => switchGameClock.checked = show, true);

(window as any).commandToggleClockSetting = function (element: HTMLInputElement) {
	updateSetting("hud-clock", element.checked);
};

(window as any).commandCloseSettingsPanel = function () {
	closeModule("SettingsPanel");
};

