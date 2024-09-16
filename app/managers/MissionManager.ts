import Engine from "../core/Engine";
import HeightmapTerrain from "../core/HeightmapTerrain";
import TargetObject from "../flightObjects/TargetObject";
import {
  MapData,
  MissionData,
  TargetData,
} from "../types";
import TargetManager from "./TargetManager";
import { v4 as uuidv4 } from "uuid";

class MissionManager {
  private engine: Engine;
  private targetManager: TargetManager;

  constructor(engine: Engine) {
    this.engine = engine;
    this.targetManager = new TargetManager(engine);
  }

  createEntities(missionData: MissionData) {
    this.initTerrain(missionData.map);
    this.initTargets(missionData.targets);
  }

  clearEntities() {
    this.engine.removeAllEntities();
  }

  private initTerrain(mapData: MapData) {
    const terrain = new HeightmapTerrain(mapData.data, mapData.size);
    this.engine.addEntity(terrain);
  }

  private initTargets(targets: TargetData[]) {
    for (const targetData of targets) {
      const targetId = `${targetData.id}_${uuidv4()}`;
      const target = new TargetObject({
        id: targetId,
        initialPosition: targetData.waypoints[0].position,
        size: targetData.size,
        rcs: targetData.rcs
      });
      this.engine.addEntity(target);
      // Устанавливаем маршруты для целей
      this.targetManager.updateRoute({
        targetId: targetId,
        waypoints: targetData.waypoints.slice(1),
      });
    }
  }
}

export default MissionManager;
