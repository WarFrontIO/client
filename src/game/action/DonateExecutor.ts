import { Player } from "../player/Player";

export class DonateExecutor {
    readonly player: Player;
    readonly target: Player;
    private troops: number;

    constructor(player: Player, target: Player, troops: number) {
        this.player = player;
        this.target = target;
        this.troops = troops;
    }

    /**
     * Transfer troops from the player to the target.
     */
    runDonation(): void {
        if (this.player.getTroops() < this.troops) {
            this.troops = this.player.getTroops();
        }
        this.target.addTroops(this.troops * 0.9);
        this.player.removeTroops(this.troops);
    }
}