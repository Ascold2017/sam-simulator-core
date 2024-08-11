import * as CANNON from "cannon-es";
import ThermalCamera from "../cameras/ThermalCamera";
import TvCamera from "../cameras/TvCamera";
import Engine from "../core/Engine";
import HeightmapTerrain from "../core/HeightmapTerrain";
import TargetObject from "../flightObjects/TargetObject";
import SearchRadar from "../radars/SearchRadar";
import SectorRadar from "../radars/SectorRadar";
import {
  CameraData,
  MapData,
  MissionData,
  RadarData,
  TargetData,
} from "../types";
import TargetManager from "./TargetManager";
import { RadarConstructor } from "../core/Radar";

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
    this.initRadars(missionData.radars);
    this.initCameras(missionData.cameras);
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

  private initRadars(radars: RadarData[]) {
    for (const radarData of radars) {
      const common: RadarConstructor = {
        id: radarData.id,
        position: radarData.position,
        minElevationAngle: radarData.minElevationAngle,
        maxElevationAngle: radarData.maxElevationAngle,
        detectionRange: radarData.maxDistance,
        heightmapTerrain: this.engine.getHeightmapTerrain()!
      }
      let radar;
      if (radarData.type === "search") {
        radar = new SearchRadar(
          {
            ...common,
            sweepSpeed: radarData.sweepSpeed!,
          }
        );
      } else if (radarData.type === "sector") {
        radar = new SectorRadar(
          {
            ...common,
            viewAngle: radarData.viewAngle!
          }
        );
      }
      this.engine.addEntity(radar!);
    }
  }

  private initCameras(cameras: CameraData[]) {
    for (const cameraData of cameras) {
      const cameraBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(
          cameraData.position.x,
          cameraData.position.y,
          cameraData.position.z,
        ),
      });
      let camera;
      if (cameraData.type === "tv") {
        camera = new TvCamera(
          cameraData.id,
          cameraBody,
          cameraData.minElevationAngle,
          cameraData.maxElevationAngle,
          cameraData.azimuthAngle,
          cameraData.viewAngle,
        );
      } else if (cameraData.type === "thermal") {
        camera = new ThermalCamera(
          cameraData.id,
          cameraBody,
          cameraData.minElevationAngle,
          cameraData.maxElevationAngle,
          cameraData.azimuthAngle,
          cameraData.viewAngle,
        );
      }
      this.engine.addEntity(camera!);
    }
  }
}

export default MissionManager;
