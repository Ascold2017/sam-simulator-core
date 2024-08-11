import Engine from "./core/Engine";
import { FlightObjectDTO } from "./dto/FlightObject.dto";
import { HeightmapTerrainDTO } from "./dto/HeightmapTerrain.dto";
import { RadarDTO, SearchRadarState, SectorRadarState } from "./dto/Radar.dto";
import MissionManager from "./managers/MissionManager";
import RadarManager from "./managers/RadarManager";
import TargetManager from "./managers/TargetManager";
import WeaponManager from "./managers/WeaponManager";
import { MissionData } from "./types.d";

export * from './types.d'

export type { FlightObjectDTO, RadarDTO, HeightmapTerrainDTO, SearchRadarState, SectorRadarState };
export class Core {
    private engine: Engine;
    private missionManager: MissionManager;
    private targetManager: TargetManager;
    weaponManager: WeaponManager
    radarManager: RadarManager;
    updateListener: Function | null = null
    constructor() {
        this.engine = new Engine();
        this.missionManager = new MissionManager(this.engine)
        this.targetManager = new TargetManager(this.engine);
        this.radarManager = new RadarManager(this.engine);
        this.weaponManager = new WeaponManager(this.engine)
        this.engine.addEventListener('update', () => {
            this.updateListener && this.updateListener()
        })
    }

    /// ENGINE ///
    get engineTimeScale() {
        return this.engine.timeScale;
    }
    set engineTimeScale(v: number) {
        this.engine.setTimeScale(v)
    }
    startEngine() {
        this.engine.start()
    }
    stopEngine() {
        this.engine.stop()
    }
    /// MISSION ///
    startMission(data: MissionData) {
        this.missionManager.createEntities(data);
        this.engine.start();
    }

    /// GETTERS ///
    getFlightObjects() {
        return this.engine.getFlightObjects().map(fo => new FlightObjectDTO(fo))
    }

    getHeightmapTerrain() {
        const entity = this.engine.getHeightmapTerrain();
        return entity && new HeightmapTerrainDTO(entity)
    }

    getRadars() {
        return this.engine.getRadars().map(radar => new RadarDTO(radar))
    }

    getCameras() {
        return this.engine.getCameras()
    }

    /// ///

}