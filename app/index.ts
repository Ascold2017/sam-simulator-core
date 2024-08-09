import Engine from "./core/Engine";
import MissionManager from "./managers/MissionManager";
import RadarManager from "./managers/RadarManager";
import TargetManager from "./managers/TargetManager";

export * from './types.d'

export class Core {
    engine: Engine;
    missionManager: MissionManager;
    targetManager: TargetManager;
    radarManager: RadarManager;
    constructor() {
        this.engine = new Engine();
        this.missionManager = new MissionManager(this.engine)
        this.targetManager = new TargetManager(this.engine);
        this.radarManager = new RadarManager(this.engine);
    }
}