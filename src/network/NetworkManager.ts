import type {BasePacket} from "./protocol/packet/BasePacket";
import type {GameActionPacket} from "./protocol/packet/game/GameActionPacket";
import {PROTOCOL_VERSION} from "./protocol/PacketRegistry";
import {getUserToken} from "./NetworkAuthenticator";
import {requestTokenExternal} from "./api/UserAuthenticationRoutes";
import {HandshakeResponsePacket} from "./protocol/packet/handshake/HandshakeResponsePacket";
import {HandshakeAuthPacket} from "./protocol/packet/handshake/HandshakeAuthPacket";
import {getSetting} from "../util/settings/UserSettingManager";
import {timedPromise} from "../util/TimedPromise";
import {SocketErrorCodes} from "./protocol/util/SocketErrorCodes";
import {deserializePacket} from "./protocol/DataTransferContext";
import {isLocalGame} from "../game/GameData";
import {NetworkException} from "../util/Exceptions";
import {doPacketValidation, packetRegistry} from "./PacketManager";
import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {gameQuitRegistry} from "../game/Game";

let openSocket: WebSocket | null = null;
let socketReady = false;
let socketTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * Connects to the server at the given host
 * @param host host to connect to, has to be a valid host
 * @param abortSignal signal to abort the connection
 */
export function connectToServer(host: string, abortSignal: AbortSignal | undefined = undefined): Promise<void> {
	return new Promise((resolve, reject) => {
		const url = new URL(host);
		let authPromise: Promise<string | undefined>;
		if (url.hostname === "warfront.io" || url.hostname === "gateway.warfront.io") {
			url.protocol = "wss:";
			url.hostname = "gateway.warfront.io";
			authPromise = getUserToken().refresh().then(token => token.getRawToken());
		} else {
			url.protocol = url.protocol === "http:" || url.protocol === "ws:" ? "ws:" : "wss:";
			authPromise = new Promise((resolve) => {
				requestTokenExternal({host: url.hostname})
					.on(200, token => resolve(token))
					.catch(() => resolve(undefined));
			});
		}
		url.searchParams.set("v", PROTOCOL_VERSION.toString());
		if (openSocket !== null) {
			openSocket.close();
		}
		openSocket = new WebSocket(url.href);
		openSocket.binaryType = "arraybuffer";
		openSocket.onopen = () => {
			console.log("Socket opened");
			authPromise.then(token => {
				try {
					sendPacket(new HandshakeAuthPacket(PROTOCOL_VERSION, getSetting("player-name"), token), true);
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
			socketCloseRegistry.broadcast(e.code);
			if (e.code !== SocketErrorCodes.NO_ERROR as number) {
				//TODO: Mark connection as dead, and try to reconnect
				console.error(`Socket closed with code ${e.code}`);
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
		openSocket.addEventListener("ping", resetTimeout);
		resetTimeout();

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

export const socketCloseRegistry = new EventHandlerRegistry<[SocketErrorCodes]>();

/**
 * Resets the timeout of the socket connection.
 */
function resetTimeout() {
	clearTimeout(socketTimeout);
	socketTimeout = setTimeout(() => {
		openSocket?.close(SocketErrorCodes.NO_ERROR);
	}, 30 * 1000);
}

/**
 * Disconnects from the server
 */
export function disconnectFromServer() {
	openSocket?.close(SocketErrorCodes.NO_ERROR);
}

gameQuitRegistry.register(disconnectFromServer);

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
	openSocket.send(packet.transferContext.serialize(packet, packetRegistry));
}

/**
 * Submits a game action to the server or the local game.
 * @param action The action to submit.
 */
export function submitGameAction<T extends GameActionPacket<T>>(action: T): void {
	if (!doPacketValidation(action)) return;
	if (isLocalGame) {
		packetRegistry.getPacketHandler(action.id).call(action);
	} else {
		sendPacket(action);
	}
}