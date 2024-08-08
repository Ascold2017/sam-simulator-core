import Engine from "./core/Engine";
import MissionManager from "./managers/MissionManager";
import TargetManager from "./managers/TargetManager";

export * from './types.d'

export class Core {
    engine: Engine;
    missionManager: MissionManager;
    targetManager: TargetManager;
    constructor() {
        this.engine = new Engine();
        this.missionManager = new MissionManager(this.engine)
        this.targetManager = new TargetManager(this.engine);
    }
}