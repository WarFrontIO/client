import { GameMap } from "../map/GameMap"
import { GameMode } from "./mode/GameMode"
import { PlayerManager } from "./player/PlayerManager"

class GameState {
    public map: GameMap
    public mode: GameMode
    public players: PlayerManager

    constructor(map: GameMap, mode: GameMode, players: PlayerManager) {
        this.map = map
        this.mode = mode
        this.players = players
    }
}

