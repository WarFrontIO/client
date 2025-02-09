import {LazyWriter} from "../map/codec/src/util/LazyWriter";
import {StreamReader} from "../map/codec/src/util/StreamReader";

const events: DebugEvent[] = [];

/**
 * Debug Events are triggered when specific game elements enter an invalid state, normally these are caused by bugs in the game code.
 * The game can continue to run after these events are triggered, but the game might not behave as expected.
 * The provided data should contain everything needed to reproduce the issue where possible.
 * @param name The name of the event
 * @param id A unique identifier for the event
 * @param data The data associated with the event
 */
export function triggerDebugEvent(name: string, id: string, ...data: DebugDataEntry[]) {
	if (events.filter(event => event.id === id).length < 5) { // Keep a maximum of 5 duplicate events
		events.push({
			name,
			id,
			time: Date.now(),
			data
		});
	}
}

/**
 * @returns All debug events that have been triggered
 */
export function getDebugEvents(): DebugEvent[] {
	return events;
}

/**
 * Writes the debug event to a writer.
 * @param event The event to write
 * @param writer The writer to write to
 */
function writeDebugEvent(event: DebugEvent, writer: LazyWriter) {
	writer.writeString(64, event.name);
	writer.writeString(64, event.id);
	writer.writeBits(64, event.time);
	writer.writeBits(16, event.data.length);
	for (const data of event.data) {
		writeDebugDataEntry(data, writer);
	}
}

/**
 * Writes a debug data entry to a writer.
 * @param data The data to write
 * @param writer The writer to write to
 */
function writeDebugDataEntry(data: DebugDataEntry, writer: LazyWriter) {
	writer.writeString(64, data.name);
	if (data.value === undefined) {
		writer.writeString(16, "undefined");
	}else if (data.value === null) {
		writer.writeString(16, "null");
	} else {
		writer.writeString(16, data.type);
	}
	switch (data.type) {
		case "string":
			writer.writeString(1024, data.value);
			break;
		case "number":
			writer.writeBits(64, data.value);
			break;
		case "boolean":
			writer.writeBoolean(data.value);
			break;
		case "array":
			writer.writeString(16, data.elementType);
			writer.writeBits(16, data.value.length);
			switch (data.elementType) {
				case "string":
					data.value.forEach(value => writer.writeString(1024, value));
					break;
				case "number":
					data.value.forEach(value => writer.writeBits(64, value));
					break;
				case "boolean":
					data.value.forEach(value => writer.writeBoolean(value));
					break;
			}
			break;
		case "object":
			writer.writeBits(16, Object.keys(data.value).length);
			for (const [key, value] of Object.entries(data.value)) {
				writer.writeString(64, key);
				writeDebugDataEntry(value, writer);
			}
			break;
	}
}

/**
 * Reads a debug event from a reader.
 * @param reader The reader to read from
 * @returns The read event
 * @throws Error if not enough data is available
 */
function readDebugEvent(reader: StreamReader): DebugEvent {
	const name = reader.readString(64);
	const id = reader.readString(64);
	const time = reader.readBits(64);
	const data: DebugDataEntry[] = [];
	const dataLength = reader.readBits(16);
	for (let i = 0; i < dataLength; i++) {
		data.push(readDebugDataEntry(reader));
	}
	return {name, id, time, data};
}

/**
 * Reads a debug data entry from a reader.
 * @param reader The reader to read from
 * @returns The read data
 * @throws Error if not enough data is available
 */
function readDebugDataEntry(reader: StreamReader): DebugDataEntry {
	const name = reader.readString(64);
	const type = reader.readString(16);
	switch (type) {
		case "undefined":
			return {name, type: "string", value: "undefined - missing data"};
		case "null":
			return {name, type: "string", value: "null - missing data"};
		case "string":
			return {name, type, value: reader.readString(1024)};
		case "number":
			return {name, type, value: reader.readBits(64)};
		case "boolean":
			return {name, type, value: reader.readBoolean()};
		case "array": {
			const elementType = reader.readString(16);
			const arrayLength = reader.readBits(16);
			switch (elementType) {
				case "string":
					return {name, type, elementType, value: new Array(arrayLength).fill(0).map(() => reader.readString(1024))};
				case "number":
					return {name, type, elementType, value: new Array(arrayLength).fill(0).map(() => reader.readBits(64))};
				case "boolean":
					return {name, type, elementType, value: new Array(arrayLength).fill(0).map(() => reader.readBoolean())};
			}
			return {name, type, elementType: "string", value: ["Invalid array type"]};
		}
		case "object": {
			const objectLength = reader.readBits(16);
			const object: { [key: string]: DebugDataEntry } = {};
			for (let i = 0; i < objectLength; i++) {
				const key = reader.readString(64);
				object[key] = readDebugDataEntry(reader);
			}
			return {name, type, value: object};
		}
	}
	return {name, type: "string", value: "Invalid data type"};
}

type DebugEvent = {
	name: string,
	id: string,
	time: number,
	data: DebugDataEntry[]
}

type DebugDataEntry = BaseDebugDataEntry<string, "string"> | BaseDebugDataEntry<number, "number"> | BaseDebugDataEntry<boolean, "boolean"> | ArrayDebugDataEntry<string, "string"> | ArrayDebugDataEntry<number, "number"> | ArrayDebugDataEntry<boolean, "boolean"> | ObjectDebugDataEntry;

type BaseDebugDataEntry<T, R extends string> = {
	name: string,
	type: R,
	value: T
};
type ArrayDebugDataEntry<T, R> = {
	name: string,
	type: "array",
	elementType: R
	value: T[]
}
type ObjectDebugDataEntry = {
	name: string,
	type: "object",
	value: { [key: string]: DebugDataEntry }
}