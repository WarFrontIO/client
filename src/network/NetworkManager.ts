import {PacketRegistry, PROTOCOL_VERSION} from "./protocol/PacketRegistry";
import {getUserToken} from "./NetworkAuthenticator";
import {requestTokenExternal} from "./api/UserAuthenticationRoutes";
import {HandshakeResponsePacket} from "./protocol/packet/handshake/HandshakeResponsePacket";
import {NetworkException} from "../util/exception/NetworkException";
import {HandshakeAuthPacket} from "./protocol/packet/handshake/HandshakeAuthPacket";
import {getSetting} from "../util/UserSettingManager";
import {timedPromise} from "../util/TimedPromise";
import {SocketErrorCodes} from "./protocol/util/SocketErrorCodes";
import {deserializePacket} from "./protocol/DataTransferContext";
import {BasePacket} from "./protocol/packet/BasePacket";
import {isLocalGame} from "../game/GameData";
import {GameActionPacket} from "./protocol/packet/game/GameActionPacket";

export const packetRegistry = new PacketRegistry<void>();

let openSocket: WebSocket | null = null;
let socketReady = false;
let socketTimeout: number | undefined;

/**
 * Connects to the server at the given host
 * @param host host to connect to, has to be a valid host
 * @param abortSignal signal to abort the connection
 */
export function connectToServer(host: string, abortSignal: AbortSignal | undefined = undefined): Promise<void> {
	return new Promise((resolve, reject) => {
		const secure = !host.startsWith("http://");
		const baseHost = host.replace(/^https?:\/\/|\/$/g, "");
		let authPromise: Promise<string | undefined>;
		if (baseHost === "warfront.io") {
			host = "wss://gateway.warfront.io/";
			authPromise = getUserToken().refresh().then(token => token.getRawToken());
		} else {
			host = (secure ? "wss://" : "ws://") + baseHost + "/";
			authPromise = new Promise((resolve) => {
				requestTokenExternal({host: baseHost})
					.on(200, token => resolve(token))
					.catch(() => resolve(undefined));
			});
		}
		if (openSocket !== null) {
			openSocket.close();
		}
		openSocket = new WebSocket(host + "?v=" + PROTOCOL_VERSION);
		openSocket.binaryType = "arraybuffer";
		openSocket.onopen = () => {
			console.log("Socket opened");
			authPromise.then(token => {
				try {
					sendPacket(new HandshakeAuthPacket(PROTOCOL_VERSION, getSetting("playerName"), token), true);
					awaitHandshakeResponse().then(() => {
						socketReady = true;
						resolve();
					}).catch(reject);
				} catch (e) {
					console.error("Failed to send auth packet", e);
					reject(e as Error);
				}
			}).catch(reject);
		};
		openSocket.onclose = e => {
			clearTimeout(socketTimeout);
			socketReady = false;
			reject(new NetworkException("Socket closed"));
			if (e.code !== SocketErrorCodes.NO_ERROR as number) {
				//TODO: Show error message to user
				console.error("Socket closed with code " + e.code);
			}
		}
		openSocket.onerror = () => {};
		openSocket.onmessage = (event) => {
			if (openSocket?.readyState !== WebSocket.OPEN) {
				return;
			}
			if (!(event.data instanceof ArrayBuffer)) {
				openSocket.close(SocketErrorCodes.BAD_MESSAGE);
				return;
			}
			try {
				deserializePacket(new Uint8Array(event.data), packetRegistry).handle();
			} catch (e) {
				console.error("Failed to handle packet", e);
				openSocket.close(SocketErrorCodes.BAD_MESSAGE);
			}
		};
		openSocket.addEventListener("ping", () => {
			clearTimeout(socketTimeout);
			// window is needed here as typescript assumes the global object is NodeJS (which has a different return type)
			socketTimeout = window.setTimeout(() => {
				openSocket?.close(SocketErrorCodes.NO_ERROR);
			}, 30 * 1000);
		});

		if (abortSignal) {
			try {
				if (abortSignal.aborted) {
					openSocket?.close(SocketErrorCodes.NO_ERROR);
					return;
				}
				abortSignal.addEventListener("abort", () => {
					openSocket?.close(SocketErrorCodes.NO_ERROR);
				});
			} catch (e) {
				console.error("Failed to add abort listener", e);
			}
		}
	});
}

/**
 * Disconnects from the server
 */
export function disconnectFromServer() {
	openSocket?.close(SocketErrorCodes.NO_ERROR);
}

/**
 * Awaits a handshake response from the server
 */
function awaitHandshakeResponse(): Promise<void> {
	return timedPromise(15 * 1000, (resolve) => {
		packetRegistry.handle(HandshakeResponsePacket, function () {
			resolve();
		});
	});
}

/**
 * Sends a packet to the server
 * @param packet packet to send
 * @param force whether to send the packet even if the socket is not ready
 * @throws NetworkException if the socket is not open or not connected
 * @throws InvalidArgumentException if the packet is not registered
 */
export function sendPacket<T extends BasePacket<T>>(packet: T, force: boolean = false) {
	if (!openSocket || (!force && !socketReady) || openSocket.readyState !== WebSocket.OPEN) {
		throw new NetworkException("Socket is not open or not connected");
	}
	openSocket.send(packet.transferContext.serialize<T, void>(packet, packetRegistry));
}

/**
 * Submits a game action to the server or the local game.
 * @param action The action to submit.
 */
export function submitGameAction<T extends GameActionPacket<T>>(action: T): void {
	if (isLocalGame) {
		packetRegistry.getPacketHandler(action.id).call(action);
	} else {
		sendPacket(action);
	}
}