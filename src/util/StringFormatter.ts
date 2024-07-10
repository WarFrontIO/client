export function formatTroops(troops: number): string {
	let result = "";
	while (troops > 1000) {
		result = (troops % 1000).toString().padStart(3, "0") + result;
		troops = Math.floor(troops / 1000);
		if (troops > 0) result = "." + result;
	}
	return troops.toString() + result;
}

export function formatTime(time: number): string {
    const pad = (n: number, z: number = 2) => ('00' + n).slice(-z);
    
    const minutes = Math.floor(time / 60000);
    time %= 60000;
    const seconds = Math.floor(time / 1000);
    const milliseconds = (time % 1000) / 10;
    
    return `${pad(minutes)}:${pad(seconds)}:${pad(milliseconds, 2)}`;
}