import type {HSLColor} from "../../util/HSLColor";
import {Player} from "./Player";
import {areaCalculator} from "../../map/area/AreaCalculator";
import {territoryManager} from "../TerritoryManager";
import {gameMap} from "../GameData";

let areaIndex: Uint16Array;

export class ClientPlayer extends Player {
	constructor(id: number, name: string, baseColor: HSLColor) {
		super(id, name, baseColor);

		areaIndex = new Uint16Array(areaCalculator.preprocessMap());
	}

	override addTile(tile: number) {
		super.addTile(tile);

		gameMap.onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				areaIndex[areaCalculator.areaIndex[neighbor]]++;
			}
		});
	}

	override removeTile(tile: number) {
		super.removeTile(tile);

		gameMap.onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				areaIndex[areaCalculator.areaIndex[neighbor]]--;
			}
		});
	}
}

/**
 * Check if a player has territory neighboring a specific area.
 * This is used to determine whether an area needs to be checked for potential attacks or boat placements.
 * @param area The area to check
 */
export function hasTerritoryNear(area: number): boolean {
	return areaIndex[area] > 0;
}