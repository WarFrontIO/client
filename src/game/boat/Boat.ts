import {Player} from "../player/Player";
import {mapNavigationHandler} from "../action/MapNavigationHandler";
import {boatManager} from "./BoatManager";
import {territoryManager} from "../TerritoryManager";
import {attackActionHandler} from "../attack/AttackActionHandler";
import {playerNameRenderingManager} from "../../renderer/manager/PlayerNameRenderingManager";
import {playerManager} from "../player/PlayerManager";
import {gameMap, gameMode} from "../GameData";
import {PlayerAttackTransaction} from "../transaction/PlayerAttackTransaction";
import {AttackTransaction} from "../transaction/AttackTransaction";

export class Boat {
	private readonly MAX_SPEED = 1;

	private readonly owner: Player;
	private readonly troops: number;
	private readonly paths: number[][] = [];
	private currentPathIndex: number = 0;
	private currentPath: number[] = [];
	private currentNode: number = 0;

	private x: number = 0;
	private y: number = 0;
	private nextX: number = 0;
	private nextY: number = 0;
	private speed: number = 0.2;
	private targetSpeed: number = 1;

	/**
	 * Creates a new boat with given starting and ending positions.
	 * @param owner The player that owns the boat.
	 * @param path The path to follow.
	 * @param troops The amount of troops the boat carries.
	 */
	constructor(owner: Player, path: number[][], troops: number) {
		this.owner = owner;
		this.paths = path;
		this.troops = troops;

		this.x = path[0][0] % gameMap.width + 0.5;
		this.y = Math.floor(path[0][0] / gameMap.width) + 0.5;
		this.updateWaypoint();
	}

	/**
	 * Moves the boat to the next waypoint.
	 */
	move() {
		this.speed = Math.min(this.MAX_SPEED, this.speed + 0.005, this.targetSpeed + Math.sqrt((this.nextX - this.x) * (this.nextX - this.x) + (this.nextY - this.y) * (this.nextY - this.y)) / 200);

		let speed = this.speed;
		while (speed > 0) {
			speed = this.moveTowards(this.nextX, this.nextY, speed);
		}
	}

	/**
	 * Moves the boat towards the given position.
	 * @param x The x-coordinate to move towards.
	 * @param y The y-coordinate to move towards.
	 * @param speed The speed to move with.
	 * @returns The remaining speed.
	 * @private
	 */
	private moveTowards(x: number, y: number, speed: number): number {
		const dx = x - this.x;
		const dy = y - this.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist === 0) {
			//TODO: how is this even possible?
			if (!this.updateWaypoint()) {
				return 0;
			}
			return speed;
		}

		if (dist <= speed) {
			this.x = x;
			this.y = y;
			if (!this.updateWaypoint()) {
				return 0;
			}
			return speed - dist;
		}

		this.x += dx / dist * speed;
		this.y += dy / dist * speed;
		return 0;
	}

	/**
	 * Initialize the next waypoint.
	 * @returns True if the boat has more waypoints, false otherwise.
	 * @private
	 */
	private updateWaypoint(): boolean {
		const beforeX = this.nextX, beforeY = this.nextY;

		if (++this.currentNode < this.currentPath.length) {
			this.nextX = this.currentPath[this.currentNode] % gameMap.width + 0.5;
			this.nextY = Math.floor(this.currentPath[this.currentNode] / gameMap.width) + 0.5;
		} else if (this.currentPathIndex < this.paths.length) {
			this.currentPath = this.paths[this.currentPathIndex++];
			this.currentNode = 0;
			this.nextX = this.currentPath[this.currentNode] % gameMap.width + 0.5;
			this.nextY = Math.floor(this.currentPath[this.currentNode] / gameMap.width) + 0.5;
		} else {
			//TODO: find a way to nicely integrate this with the normal attack system (the first tile currently has no cost)
			const target = territoryManager.getOwner(this.currentPath[--this.currentNode]);
			if (this.owner.isAlive() && gameMode.canAttack(this.owner.id, target)) {
				const transaction = playerManager.getPlayer(target) ? new PlayerAttackTransaction(this.owner, playerManager.getPlayer(target), this.troops) : new AttackTransaction(this.owner, this.troops);
				territoryManager.conquer(this.currentPath[this.currentNode], this.owner.id, transaction);
				transaction.apply();
				playerNameRenderingManager.applyTransaction(this.owner, playerManager.getPlayer(target) || this.owner);

				if (target === territoryManager.OWNER_NONE) {
					attackActionHandler.attackUnclaimed(this.owner, this.troops, new Set([this.currentPath[this.currentNode]]));
				} else {
					attackActionHandler.attackPlayer(this.owner, playerManager.getPlayer(target), this.troops, new Set([this.currentPath[this.currentNode]]));
				}
			} else {
				playerManager.getPlayer(this.owner.id).addTroops(this.troops);
			}
			boatManager.unregisterBoat(this);
			return false;
		}

		this.targetSpeed = this.calculateSpeed(beforeX, beforeY, this.nextX, this.nextY, 0, 1);

		return true;
	}

	/**
	 * Calculates the target speed at the next waypoint.
	 * @param oldX The x-coordinate of the previous waypoint.
	 * @param oldY The y-coordinate of the previous waypoint.
	 * @param currentX The x-coordinate of the current waypoint.
	 * @param currentY The y-coordinate of the current waypoint.
	 * @param dist The distance to the current waypoint.
	 * @param offset The amount of waypoints to skip.
	 * @returns The target speed.
	 * @private
	 */
	private calculateSpeed(oldX: number, oldY: number, currentX: number, currentY: number, dist: number, offset: number): number {
		const next = this.getWaypoint(offset);
		if (next === -1) {
			return this.MAX_SPEED;
		}
		const nextX = next % gameMap.width + 0.5, nextY = Math.floor(next / gameMap.width) + 0.5;
		let angle = Math.atan2(currentY - oldY, currentX - oldX) - Math.atan2(nextY - currentY, nextX - currentX);
		angle = Math.abs((Math.abs(angle) + Math.PI) % (2 * Math.PI) - Math.PI);

		const distToNext = dist + Math.sqrt((nextX - currentX) * (nextX - currentX) + (nextY - currentY) * (nextY - currentY));

		if (distToNext < 100 * this.MAX_SPEED) {
			return Math.min(this.MAX_SPEED * Math.exp(-angle), (distToNext - dist) * 0.005 + this.calculateSpeed(currentX, currentY, nextX, nextY, distToNext, offset + 1));
		}
		return this.MAX_SPEED * Math.exp(-angle);
	}

	/**
	 * Returns the next waypoint in the path.
	 * @param offset The amount of waypoints to skip.
	 * @returns The next waypoint.
	 * @private
	 */
	private getWaypoint(offset: number): number {
		let currentNode = this.currentNode;
		let currentPathIndex = this.currentPathIndex - 1;
		for (let i = 0; i < offset; i++) {
			if (++currentNode < this.paths[currentPathIndex].length) {
				continue;
			}
			if (++currentPathIndex < this.paths.length) {
				currentNode = 0;
			} else {
				return -1;
			}
		}
		return this.paths[currentPathIndex][currentNode];
	}

	/**
	 * Renders the boat on the given canvas context.
	 * @param context The canvas context to render on.
	 */
	render(context: CanvasRenderingContext2D) {
		const zoom = mapNavigationHandler.zoom;
		const x = mapNavigationHandler.x;
		const y = mapNavigationHandler.y;

		//TODO: Add boat sprite
		context.beginPath();
		context.arc(this.x * zoom + x, this.y * zoom + y, zoom, 0, 2 * Math.PI);
		context.fill();
	}
}