import {disconnectFromServer, packetRegistry} from "../network/NetworkManager";
import {GameStartPacket} from "../network/protocol/packet/game/GameStartPacket";
import {mapFromId} from "../map/MapRegistry";
import {gameModeFromId} from "./mode/GameModeRegistry";
import {GameTickPacket} from "../network/protocol/packet/game/GameTickPacket";
import {gameTicker} from "./GameTicker";
import {spawnManager} from "./player/SpawnManager";
import {playerManager} from "./player/PlayerManager";
import {startGame} from "./Game";
import {gameMode} from "./GameData";
import {showPanel} from "../ui/type/UIPanel";
import {buildButton, buildTextNode} from "../ui/type/TextNode";
import {t} from "../util/Lang";
import {mapActionHandler} from "./action/MapActionHandler";

//@module game

packetRegistry.handle(GameStartPacket, function () {
	startGame(mapFromId(this.map), gameModeFromId(this.mode), this.seed, this.players, this.clientId, false);
});

packetRegistry.handle(GameTickPacket, function () {
	if (this.index === 0 && !gameTicker.isRunning) {
		spawnManager.isSelecting = false;
		for (const player of playerManager.getPlayers()) {
			if (player.getTerritorySize() === 0) {
				spawnManager.randomSpawnPoint(player);
			}
		}
		gameTicker.start();
	}
	const expectedIndex = Math.ceil(gameTicker.getTickCount() / 10) + gameTicker.dataPacketQueue.length;
	if (this.index === expectedIndex % 256) {
		gameTicker.addPacket(this);
	} else {
		console.warn(`Received out-of-order game tick packet ${this.index} expected ${expectedIndex % 256}`);
		//TODO: Handle out-of-order packets: Cache this packet and request missing packets from the server
		//TODO: Show error message to the user
		disconnectFromServer();
	}
});

gameTicker.registry.register(() => {
	const result = gameMode.getResult();
	if (result) {
		showPanel(t("game.result.title"),
			buildTextNode(result.getWinnerString()),
			buildButton(t("game.action.leave"), "danger", "btn-block").onClick(() => window.location.reload())
		);
		gameTicker.stop();
		mapActionHandler.disable();
		//TODO: allow continuing if player wants to
	}
});