import { startGame } from "../../game/Game";
import { mapFromId } from "../../map/MapRegistry";
import { ModuleAdapter, closeAllModules, closeModule } from "../ModuleLoader";
import { openModule } from "../ModuleLoader";
import { FFAGameMode } from "../../game/mode/FFAGameMode";
import { getSetting, updateSetting } from "../../util/UserSettingManager";

const txtPlayerName: HTMLInputElement = (window.document.getElementById("txtPlayerName") as HTMLInputElement);
const lblPlayerNameValidation: HTMLElement = (window.document.getElementById("lblPlayerNameValidation") as HTMLElement);
const btnStart: HTMLButtonElement = (window.document.getElementById("btnStart") as HTMLButtonElement)

const playerNameValidationExp: RegExp = /^[a-zA-Z0-9\u00A0-\u00FF\u0100-\u024F\u1E00-\u1EFF\-_. ({)}<>]{3,32}$/;

export default {
	
	onOpen: () => {
		const savedPlayerName = getSetting("playerName");
		if (savedPlayerName)
			txtPlayerName.value = savedPlayerName;
	}
} as ModuleAdapter;

(window as any).commandStartGame = function () {
	closeAllModules();
	openModule("GameHud");
	startGame(mapFromId(Math.floor(Math.random() * 2)), new FFAGameMode());
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
		updateSetting("playerName", txtPlayerName.value);
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

