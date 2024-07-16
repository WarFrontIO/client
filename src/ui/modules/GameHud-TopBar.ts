import {gameTicker} from "../../game/GameTicker";
import {formatTime} from "../../util/StringFormatter";
import {getSetting, registerSettingListener} from "../../util/UserSettingManager";
import {ModuleAdapter} from "../ModuleLoader";
import {openModule} from "../ModuleLoader";

const gameClock: HTMLElement = (window.document.getElementById("gameClock") as HTMLElement);
const lblGameTime: HTMLElement = (window.document.getElementById("lblGameTime") as HTMLElement);

export default {
	onOpen: () => {
		// Initialize elements according to user settings
		gameClock.style.display = getSetting("gameHud-clock") ? "inherit" : "none";
	}
} as ModuleAdapter;

gameTicker.registry.register(() => lblGameTime.innerHTML = formatTime(gameTicker.getElapsedTime()));
registerSettingListener("gameHud-clock", show => gameClock.style.display = show ? "inherit" : "none");


(window as any).commandShowSettings = function () {
	openModule("SettingsPanel");
};

(window as any).commandExitGame = function () {
	window.location.reload();
};
