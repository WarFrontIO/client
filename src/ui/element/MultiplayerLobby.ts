import {getSetting} from "../../util/settings/UserSettingManager";
import {connectToServer, disconnectFromServer, socketCloseRegistry} from "../../network/NetworkManager";
import {GameQueueUpdatePacket} from "../../network/protocol/packet/game/GameQueueUpdatePacket";
import {hidePanel, showPanel, updatePanel} from "../type/UIPanel";
import {buildTextNode, displayAlert} from "../type/TextNode";
import {SocketErrorCodes} from "../../network/protocol/util/SocketErrorCodes";
import {awaitSafeForward} from "../../network/NetworkAuthenticator";
import {packetRegistry} from "../../network/PacketManager";

//@module ui

let abortController: AbortController | null = null;

export function openMultiplayerLobby() {
	abortController = new AbortController();
	let error = false;
	connectToServer(getSetting("game-server"), abortController.signal).then(() => {
		abortController = null;
	}).catch(() => {
		hidePanel();
		error = true;
	});

	setTimeout(() => {
		if (error) return;
		showPanel("Connecting to Multiplayer Lobby", buildTextNode("Connecting to server..."))
			.setCloseHandler(() => {
				if (abortController) {
					abortController.abort();
					abortController = null;
				} else {
					disconnectFromServer();
				}
				hidePanel();
			});
	}, 500);
}

packetRegistry.handle(GameQueueUpdatePacket, function () {
	updatePanel(buildTextNode(`Game starting in ${this.time} seconds (${this.playerCount} player${this.playerCount > 1 ? "s" : ""})...`));
});

socketCloseRegistry.register(code => {
	switch (code) {
		case SocketErrorCodes.NO_ERROR:
			break;
		case SocketErrorCodes.SERVER_OUT_OF_DATE:
			displayAlert("secondary", "This third party server is out of date, ask the server administrator to update it");
			break;
		case SocketErrorCodes.OUT_OF_DATE:
			displayAlert("secondary", "Server is for a newer version of the game, reloading the page...")
			setTimeout(() => {
				awaitSafeForward().then(() => window.location.reload()).catch(() => {});
			}, 5000);
			break;
		case SocketErrorCodes.NO_GAME_SERVER:
			displayAlert("secondary", "No game server is available, please try again later");
			break;
		default:
			displayAlert("danger", "Connection to server lost");
	}
})