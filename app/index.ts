import Engine from "./core/Engine";
import { FlightObjectDTO } from "./dto/FlightObject.dto";
import { HeightmapTerrainDTO } from "./dto/HeightmapTerrain.dto";
import AAManager, { CapturedTarget, AAObject } from "./managers/AAManager";
import MissionManager from "./managers/MissionManager";
import TargetManager from "./managers/TargetManager";
import { AAData, MissionData } from "./types";

export * from './types'

export type { FlightObjectDTO, HeightmapTerrainDTO, CapturedTarget, AAObject };
export class Core {
    private engine: Engine;
    private missionManager: MissionManager;
    private targetManager: TargetManager;
    private aaManager: AAManager
    updateListener: Function | null = null
    constructor() {
        this.engine = new Engine();
        this.missionManager = new MissionManager(this.engine)
        this.targetManager = new TargetManager(this.engine);
        this.aaManager = new AAManager(this.engine)
        this.engine.addEventListener('update', () => {
            this.updateListener && this.updateListener()
        })
    }

    /// ENGINE ///
    get engineIsStarted() {
        return !!this.engine.isRunning
    }
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

    stopMission() {
        this.missionManager.clearEntities()
        this.aaManager.reset();
        this.engine.stop()
    }

    /// GETTERS ///
    getFlightObjects() {
        return this.engine.getFlightObjects().map(fo => new FlightObjectDTO(fo))
    }

    getHeightmapTerrain() {
        const entity = this.engine.getHeightmapTerrain();
        return entity && new HeightmapTerrainDTO(entity)
    }

    getAAs() {
        return this.aaManager.aas
    }

    addAA(aaData: AAData) {
        this.aaManager.addAA(aaData)
    }

    removeAA(aaId: string) {
        this.aaManager.removeAA(aaId)
    }

    getCapturedTargets() {
        return this.aaManager.capturedTargetIds.slice(0)
    }


    /// AA ///
    captureTargetOnDirection(aaId: string, azimuth: number, elevation: number) {
        return this.aaManager.captureFlightObjectOnDirection(aaId, azimuth, elevation)
    }

    fire(aaId: string, azimuth: number, elevation: number) {
        return this.aaManager.fire(aaId, azimuth, elevation)
    }

}