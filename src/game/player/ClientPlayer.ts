import {Player} from "./Player";
import {TerritoryTransaction} from "../transaction/TerritoryTransaction";
import {onNeighbors} from "../../util/MathUtil";
import {HSLColor} from "../../util/HSLColor";
import {areaCalculator} from "../../map/area/AreaCalculator";
import {territoryManager} from "../TerritoryManager";

let areaIndex: Uint16Array;

export class ClientPlayer extends Player {
	constructor(id: number, name: string, baseColor: HSLColor) {
		super(id, name, baseColor);

		areaIndex = new Uint16Array(areaCalculator.preprocessMap());
	}

	addTile(tile: number, transaction: TerritoryTransaction) {
		super.addTile(tile, transaction);

		onNeighbors(tile, neighbor => {
			if (territoryManager.isWater(neighbor)) {
				areaIndex[areaCalculator.areaIndex[neighbor]]++;
			}
		});
	}

	removeTile(tile: number, transaction: TerritoryTransaction) {
		super.removeTile(tile, transaction);

		onNeighbors(tile, neighbor => {
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