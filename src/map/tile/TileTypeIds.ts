/**
 * Tile type IDs are used to identify tile types in storage and game logic.
 *
 * Certain ranges of tile type IDs are reserved for specific purposes:
 * - 0-1023: Tile type IDs for built-in tile types
 * - 1024-2047: Tile type IDs for custom tile types (reserved for user-defined tile types)
 * - 2048-16383: Tile type IDs for 3rd party applications (e.g. mods) to avoid conflicts with built-in and custom tile types
 * - 16384-32767: Tile type IDs for internal use (e.g. temporary tile types, player territory aliases)
 * - 32768-65535: Reserved for future use
 *
 * Do not change the order of the enum values (TypeScript implicitly assigns numbers to enum values).
 */
export enum TileTypeIds {
	WATER,
	GRASS
}