import {GameMap} from "./GameMap";
import {tileManager} from "../Loader";

export class MapBuilder {
	async fromPath(file: string): Promise<GameMap> {
		return new Promise<GameMap>((resolve, reject) => {
			const image = new Image();
			image.src = file;
			image.onload = () => {
				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d");
				canvas.width = image.width;
				canvas.height = image.height;
				context.drawImage(image, 0, 0);
				const data = context.getImageData(0, 0, image.width, image.height).data;
				const map = new GameMap(file, image.width, image.height);
				for (let y = 0; y < image.height; y++) {
					for (let x = 0; x < image.width; x++) {
						const index = (y * image.width + x) * 4;
						map.setTile(x, y, tileManager.fromColor(data[index], data[index + 1], data[index + 2]));
					}
				}
				resolve(map);
			};
			image.onerror = reject;
		});
	}
}