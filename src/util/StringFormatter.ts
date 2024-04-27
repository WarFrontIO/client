export function formatTroops(troops: number): string {
	let result = "";
	while (troops > 1000) {
		result = (troops % 1000).toString().padStart(3, "0") + result;
		troops = Math.floor(troops / 1000);
		if (troops > 0) result = "." + result;
	}
	return troops.toString() + result;
}