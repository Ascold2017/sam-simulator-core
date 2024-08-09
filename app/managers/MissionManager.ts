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

class MissionManager {
  engine: Engine;
  private targetManager: TargetManager;

  constructor(engine: Engine) {
    this.engine = engine;
    this.targetManager = new TargetManager(engine);
  }

  createEntities(missionData: MissionData) {
    //this.initTerrain(missionData.map);
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
      const targetBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(
          targetData.waypoints[0].position.x,
          targetData.waypoints[0].position.y,
          targetData.waypoints[0].position.z,
        ),
      });
      const target = new TargetObject(
        targetData.id,
        targetBody,
        new CANNON.Vec3(0, 0, 0),
      );
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
      const radarBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(
          radarData.position.x,
          radarData.position.y,
          radarData.position.z,
        ),
      });
      let radar;
      if (radarData.type === "search") {
        radar = new SearchRadar(
          radarData.id,
          radarBody,
          radarData.minElevationAngle,
          radarData.maxElevationAngle,
          1000,
          1
        );
      } else if (radarData.type === "sector") {
        radar = new SectorRadar(
          radarData.id,
          radarBody,
          radarData.minElevationAngle,
          radarData.maxElevationAngle,
          radarData.azimuthAngle!,
          radarData.viewAngle!,
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
