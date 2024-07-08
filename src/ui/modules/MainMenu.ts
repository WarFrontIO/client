import { Game } from "../../game/Game";
import { mapFromId } from "../../map/MapRegistry";
import { closeMenu } from "../ModuleLoader";
import { openMenu } from "../ModuleLoader";
import { FFAGameMode } from "../../game/mode/FFAGameMode";
import { PlayerNameRenderingManager } from "../../renderer/manager/PlayerNameRenderingManager";
import { PlayerManager } from "../../game/player/PlayerManager";
import { TerritoryRenderingManager } from "../../renderer/manager/TerritoryRenderingManager";
import { TerritoryRenderer } from "../../renderer/layer/TerritoryRenderer";
import { HSLColor } from "../../util/HSLColor";
import { registerSettingListener } from "../../util/UserSettingManager";
import { Player } from "../../game/player/Player";
import { GameRenderer } from "../../renderer/GameRenderer";
import { TerritoryManager } from "../../game/TerritoryManager";
import { TileManager } from "../../map/TileManager";
import { MapRenderer } from "../../renderer/layer/MapRenderer";
import { NameRenderer } from "../../renderer/layer/NameRenderer";
import { MapNavigationHandler } from "../../game/action/MapNavigationHandler";
import { MapActionHandler } from "../../game/action/MapActionHandler";
import { AttackActionHandler } from "../../game/action/AttackActionHandler";
import { MapTransformHandler } from "../../event/MapTransformHandler";
import { SpawnManager } from "../../game/player/SpawnManager";


(window as any).commandStartGame = function () {
	closeMenu();
	openMenu("GameHud");

	console.log('loading game')



	var tileManager = new TileManager();
	var gameMap = mapFromId(Math.floor(Math.random() * 2), tileManager);
	var gameMode = new FFAGameMode()

	// circular dependency
	var players = new PlayerManager(null, null, null, null, null)
	var game = new Game(gameMap, gameMode, players)

	var territoryManager = new TerritoryManager(null, null, null)

	// Circular
	var mapNavigationHandler = new MapNavigationHandler(gameMap, null)
	var mapTransformHandler = new MapTransformHandler(mapNavigationHandler)
	mapNavigationHandler.mapTransformHandler = mapTransformHandler

	var playerNameRenderingManager = new PlayerNameRenderingManager(game, territoryManager, mapNavigationHandler);

	var spawnManager = new SpawnManager()
	players.spawnManager = spawnManager


	var tr = new TerritoryRenderer(gameMap, mapTransformHandler)
	var trm = new TerritoryRenderingManager(game, tr, territoryManager)
	registerSettingListener("theme", trm.forceRepaint);

	// Circular dependencies.
	territoryManager.game = game
	territoryManager.playerNameRenderingManager = playerNameRenderingManager
	territoryManager.territoryRenderingManager = trm


	var mapRenderer = new MapRenderer(game, mapTransformHandler)
	registerSettingListener("theme", (theme) => game.isPlaying && mapRenderer.forceRepaint(theme));

	var nameRenderer = new NameRenderer(game, playerNameRenderingManager, mapNavigationHandler)

	var gameRenderer = new GameRenderer(tr, trm, mapRenderer, nameRenderer, playerNameRenderingManager)

	// Circular
	spawnManager.gameRenderer = gameRenderer


	var attackActionHandler = new AttackActionHandler(game, territoryManager, gameRenderer)
	var mapActionHandler = new MapActionHandler(spawnManager, attackActionHandler, game.players, territoryManager, mapNavigationHandler)


	// Circular
	players.spawnManager = spawnManager
	players.gameRenderer = gameRenderer
	players.game = game
	players.territoryManager = territoryManager
	players.attackActionHandler = attackActionHandler


	// Init
	mapNavigationHandler.enable();
	mapActionHandler.enable();
	gameRenderer.initGameplayLayers();
	territoryManager.reset();
	playerNameRenderingManager.reset(500);
	attackActionHandler.init(500);
	spawnManager.init(game, 500, territoryManager, gameRenderer);
	players.init([new Player(attackActionHandler, game, territoryManager, gameRenderer, 0, "Player", HSLColor.fromRGB(0, 200, 200))], 0, 500);

	game.startGame()
};

(window as any).commandShowCommunity = function () {
	openMenu("CommunityPanel");
};