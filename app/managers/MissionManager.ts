import { AAObject } from "../core/AAObject";
import Engine from "../core/Engine";
import HeightmapTerrain from "../core/HeightmapTerrain";
import TargetObject from "../flightObjects/TargetObject";
import {
  AAData,
  MapData,
  MissionData,
  TargetData,
} from "../types";
import TargetManager from "./TargetManager";

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
    this.initAAs(missionData.aas)
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

      const target = new TargetObject({
        id: targetData.id,
        initialPosition: targetData.waypoints[0].position,
        size: targetData.size,
        rcs: targetData.rcs
      });
      this.engine.addEntity(target);
      // Устанавливаем маршруты для целей
      this.targetManager.updateRoute({
        targetId: targetData.id,
        waypoints: targetData.waypoints.slice(1),
      });
    }
  }

  private initAAs(aas: AAData[]) {
    for (const aa of aas) {

      const aaObject = new AAObject(
        aa.id,
        {
          type: aa.type,
          position: aa.position,
          ammoMaxRange: aa.ammoMaxRange,
          ammoVelocity: aa.ammoVelocity,
          viewAngle: aa.viewAngle

        });
      this.engine.addEntity(aaObject);

    }
  }
}

export default MissionManager;
