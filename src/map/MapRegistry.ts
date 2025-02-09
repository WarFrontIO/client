import {decodeMap} from "./codec/MapCodec";
import {GameMap} from "./GameMap";
import {InvalidArgumentException} from "../util/Exceptions";

const mapRegistry: EncodedMapData[] = [];

type EncodedMapData = {
	name: string;
	data: Uint8Array;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function registerMap(name: string, base64Data: string) {
	mapRegistry.push({
		name: name,
		data: Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
	});
}

/**
 * Retrieves a map from the registry by its ID.
 * @param id numeric ID of the map
 * @returns the map
 * @throws InvalidArgumentException if the map is not found
 */
export function mapFromId(id: number): GameMap {
	const data = mapRegistry[id];
	if (!data) {
		throw new InvalidArgumentException(`Map with id ${id} not found`);
	}
	const decoded = decodeMap(data.data);
	const map = new GameMap(data.name, id, decoded.width, decoded.height, decoded.types);
	for (let i = 0; i < decoded.tiles.length; i++) {
		map.setTileId(i, decoded.tiles[i]);
	}
	map.calculateAreaMap();
	map.calculateDistanceMap();
	return map;
}

// The following lines are filled in by the build process
// BUILD_MAPS_REGISTER
// End of map register block