import Engine from "./core/Engine";
import MissionManager from "./managers/MissionManager";
import TargetManager from "./managers/TargetManager";

const engine = new Engine();
const missionManager = new MissionManager(engine)
const targetManager = new TargetManager(engine);
export {
    engine,
    missionManager,
    targetManager
}