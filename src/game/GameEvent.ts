export class ClearTileEvent {
    constructor(
        public tilePos: number
    ) { }

}

export class EventDispatcher {
    private clearTileEventListeners: ((event: ClearTileEvent) => void)[] = [];

    addClearTileEventListener(listener: (event: ClearTileEvent) => void) {
        this.clearTileEventListeners.push(listener)
    }

    fireClearTileEvent(event: ClearTileEvent) {
        this.clearTileEventListeners.forEach((listener) => listener(event))
    }
}

export const eventDispatcher = new EventDispatcher()