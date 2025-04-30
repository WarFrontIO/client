// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * All constants in this file are injected by the webpack build process.
 */

/**
 * Version hash of the client, generated using git describe.
 */
export const clientHash: string = process.env.BUILD_CLIENT_HASH;

export const gameServerAddress: string = process.env.BUILD_GAME_SERVER;