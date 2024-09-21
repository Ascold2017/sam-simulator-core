import {EventEmitter} from "events";
import { World } from "./entities/World";
import HeightmapTerrain, { HeightmapTerrainProps } from "./entities/HeightmapTerrain";

// Константа для частоты обновления (40 раз в секунду)
const UPDATE_FREQUENCY = 1 / 40;

interface CoreParams {
    heightmapTerrain: HeightmapTerrainProps;
}
export class Core {
    readonly eventEmitter = new EventEmitter();
    private gameWorld: World;
    private lastUpdateTime: number = Date.now();

    constructor(params: CoreParams) {
        this.gameWorld = new World();
        this.initEntities(params);
        setInterval(() => this.update(), UPDATE_FREQUENCY * 1000);
    }

    private update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        if (deltaTime >= UPDATE_FREQUENCY) {
            this.lastUpdateTime = now;
            this.gameWorld.updateWorld(deltaTime);
            this.eventEmitter.emit("update_world_state", this.getWorldState());
        }
    }

    getWorldState() {
        return this.gameWorld.getState();
    }

    private initEntities(params: CoreParams) {
        // ## TERRAIN ##
        const terrain = new HeightmapTerrain(params.heightmapTerrain);
        this.gameWorld.addEntity(terrain);
    }

    addAA() {
        // TODO
    }

    removeAA() {
        // TODO
    }

    collisionTest() {
        this.gameWorld.addCollisionTest();
    }
}