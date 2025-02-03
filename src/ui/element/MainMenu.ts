import {mapFromId} from "../../map/MapRegistry";
import {getSetting, getSettingObject} from "../../util/settings/UserSettingManager";
import {startGame} from "../../game/Game";
import {gameModeFromId} from "../../game/mode/GameModeRegistry";
import {GameModeIds} from "../../network/protocol/util/GameTypeIds";
import {registerClickListener} from "../UIEventResolver";
import {loadValidatedInput} from "../type/ValidatedInput";
import {showPanel} from "../type/UIPanel";
import {hideAllUIElements, showUIElement} from "../UIManager";
//import {openMultiplayerLobby} from "./MultiplayerLobby";

//const btnStartMultiplayer: HTMLButtonElement = (window.document.getElementById("btnStartMultiplayer") as HTMLButtonElement);
const btnStartSingleplayer: HTMLButtonElement = (window.document.getElementById("btnStartSingleplayer") as HTMLButtonElement);

const playerNameValidationExp: RegExp = /^[a-zA-Z0-9\u00A0-\u00FF\u0100-\u024F\u1E00-\u1EFF\-_. ({)}<>]*$/;

//registerClickListener("btnStartMultiplayer", () => openMultiplayerLobby());

registerClickListener("btnStartSingleplayer", () => {
	hideAllUIElements();
	showUIElement("GameHud");
	startGame(mapFromId(Math.floor(Math.random() * 2)), gameModeFromId(GameModeIds.FFA), 23452345, [{name: getSetting("player-name")}], 0, true);
});

registerClickListener("linkImprint", () => showPanel("Site Notice"));
registerClickListener("linkPrivacy", () => showPanel("Privacy Policy"));

loadValidatedInput("playerNameInput", "playerNameInputValidation")
	.onInput((_value, valid) => {
		//btnStartMultiplayer.disabled = !valid;
		btnStartSingleplayer.disabled = !valid;
	})
	.mutate(value => value.trim())
	.addRule("Name contains invalid characters.", value => playerNameValidationExp.test(value))
	.addRule("Name is too short (must be at least 3 characters).", value => value.length >= 3)
	.addRule("Name is too long (32 characters maximum).", value => value.length <= 32)
	.linkSetting(getSettingObject("player-name"), false);