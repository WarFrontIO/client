import {registerSettingListener, updateSetting} from "../../util/UserSettingManager";
import {blockInteraction, registerClickListener} from "../UIEventResolver";
import {hideUIElement} from "../UIManager";

const switchGameClock = window.document.getElementById("switchGameClock") as HTMLInputElement;

registerSettingListener("hud-clock", show => switchGameClock.checked = show, true);

switchGameClock.onchange = function () {
	updateSetting("hud-clock", switchGameClock.checked);
};

registerClickListener("settingsClose", () => hideUIElement("SettingsPanel"));
blockInteraction("SettingsPanel");