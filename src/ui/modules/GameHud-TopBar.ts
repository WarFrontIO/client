import {gameTicker} from "../../game/GameTicker";
import {formatTime} from "../../util/StringFormatter";
import {registerSettingListener} from "../../util/UserSettingManager";
import {openModule} from "../ModuleLoader";

const gameClock: HTMLElement = (window.document.getElementById("gameClock") as HTMLElement);
const lblGameTime: HTMLElement = (window.document.getElementById("lblGameTime") as HTMLElement);

gameTicker.registry.register(() => lblGameTime.innerHTML = formatTime(gameTicker.getElapsedTime()));
registerSettingListener("hud-clock", show => gameClock.style.display = show ? "inherit" : "none", true);


(window as any).commandShowSettings = function () {
	openModule("SettingsPanel");
};

(window as any).commandExitGame = function () {
	window.location.reload();
};
