export class Team {
    private color: number[] = [0, 0, 0];

    constructor(color: number[]) {
        this.color = color;
    }

    /**
     * Generates a new color for a player in this team, close to the team color.
     * @returns The new color.
     */
    getNewPlayerColor(): number[] {
        // return a random color, close to the team color
        let r = this.color[0] + Math.floor(Math.random() * 32 - 16);
        let g = this.color[1] + Math.floor(Math.random() * 32 - 16);
        let b = this.color[2] + Math.floor(Math.random() * 32 - 16);
        return [r, g, b];
    }
}