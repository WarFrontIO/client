import {mapFromId} from "../../map/MapRegistry";
import {closeAllModules, openModule} from "../ModuleLoader";
import {getSetting, registerSettingListener, updateSetting} from "../../util/UserSettingManager";
import {startGame} from "../../game/Game";
import {gameModeFromId} from "../../game/mode/GameModeRegistry";
import {GameModeIds} from "../../network/protocol/util/GameTypeIds";

const txtPlayerName: HTMLInputElement = (window.document.getElementById("txtPlayerName") as HTMLInputElement);
const lblPlayerNameValidation: HTMLElement = (window.document.getElementById("lblPlayerNameValidation") as HTMLElement);
const btnStart: HTMLButtonElement = (window.document.getElementById("btnStart") as HTMLButtonElement)

const playerNameValidationExp: RegExp = /^[a-zA-Z0-9\u00A0-\u00FF\u0100-\u024F\u1E00-\u1EFF\-_. ({)}<>]{3,32}$/;

//TODO: When the input is processed (e.g. trimmed), this needs to only change the value after the focus is lost.
registerSettingListener("player-name", name => txtPlayerName.value = name, true);

(window as any).commandStartGame = function () {
	closeAllModules();
	openModule("GameHud");
	startGame(mapFromId(Math.floor(Math.random() * 2)), gameModeFromId(GameModeIds.FFA), 23452345, [{ name: getSetting("player-name") }], 0, true);
};

(window as any).commandShowCommunity = function () {
	openModule("CommunityPanel");
};

(window as any).commandShowImprint = function () {
	openModule("ImprintPanel");
};

(window as any).commandShowPrivacy = function () {
	openModule("PrivacyPanel");
};

(window as any).commandUpdateName = function () {

	txtPlayerName.classList.remove("wf-form-control-error");
	lblPlayerNameValidation.style.display = "none";
	lblPlayerNameValidation.innerHTML = "";
	btnStart.disabled = false;

	if (playerNameValidationExp.test(txtPlayerName.value)) {
		updateSetting("player-name", txtPlayerName.value);
	} else {
		txtPlayerName.classList.add("wf-form-control-error");
		lblPlayerNameValidation.innerHTML = "Name contains invalid characters.";
		lblPlayerNameValidation.style.display = "block";
		btnStart.disabled = true;
	}

	if (txtPlayerName.value.length < 3) {
		txtPlayerName.classList.add("wf-form-control-error");
		lblPlayerNameValidation.innerHTML = "Name is too short (must be at least 3 characters).";
		lblPlayerNameValidation.style.display = "block";
		btnStart.disabled = true;
	}

	if (txtPlayerName.value.length > 32) {
		txtPlayerName.classList.add("wf-form-control-error");
		lblPlayerNameValidation.innerHTML = "Name is too long (32 characters maximum).";
		lblPlayerNameValidation.style.display = "block";
		btnStart.disabled = true;
	}


};

