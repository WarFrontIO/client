import type {BasePacket} from "./protocol/packet/BasePacket";
import {PacketRegistry} from "./protocol/PacketRegistry";

export const packetRegistry = new PacketRegistry<void>();

const validators: Record<number, (packet: IncomingPacket) => boolean> = {};

/**
 * Register a packet validator.
 * @param packet The packet to validate
 * @param validator The validator function, should return true if the packet is valid
 */
export function validatePacket<T extends IncomingPacket>(packet: {prototype: T}, validator: (packet: T) => boolean) {
	validators[packet.prototype.id] = validator as (packet: IncomingPacket) => boolean;
}

/**
 * Validate a packet.
 * @param packet The packet to validate
 * @returns Whether the packet is valid, if not, the packet should be dropped
 */
export function doPacketValidation(packet: IncomingPacket): boolean {
	const validator = validators[packet.id];
	if (!validator) {
		console.warn(`No validator for packet ${packet.id} (${packet.constructor.name})`);
		return false;
	}
	return validator(packet);
}

type IncomingPacket = Omit<BasePacket<void>, "transferContext" | "buildTransferContext">;