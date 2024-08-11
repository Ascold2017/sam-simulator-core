import Engine from "../core/Engine";
import Radar from "../core/Radar";
import SearchRadar from "../radars/SearchRadar";
import SectorRadar from "../radars/SectorRadar";

type RadarUpdateCallback = (radarState: ReturnType<SectorRadar['getState'] | SearchRadar['getState']>) => void;

class RadarManager {
  private engine: Engine;
  private radarUpdateCallbacks: Map<string, RadarUpdateCallback[]> = new Map();

  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.addEventListener("update", () => this.updateRadars());
  }

  subscribeToRadarUpdates(radarId: string, callback: RadarUpdateCallback) {
    if (!this.radarUpdateCallbacks.has(radarId)) {
      this.radarUpdateCallbacks.set(radarId, []);
    }
    this.radarUpdateCallbacks.get(radarId)?.push(callback);
  }

  toggleRadarById(radarId: string, isEnabled: boolean) {
    const radar = this.getRadarById(radarId);
    if (radar) {
      radar.isEnabled = isEnabled;
    }
  }

  setAngleSectorRadarById(radarId: string, azimuth: number, elevation: number) {
    const radar = this.getRadarById(radarId);
    if (radar && radar instanceof SectorRadar) {
      radar.setAngle(azimuth, elevation)
    }
  }

  private updateRadars() {
    this.engine.getRadars().forEach((radar) => {
      radar.setFlightObjects(this.engine.getFlightObjects());
      this.notifyRadarSubscribers(radar as SearchRadar | SectorRadar);
    });
  }

  private getRadarById(radarId: string): Radar | undefined {
    return this.engine.getRadars().find((entity) => entity.id === radarId);
  }

  private notifyRadarSubscribers(radar: SearchRadar | SectorRadar) {
    const callbacks = this.radarUpdateCallbacks.get(radar.id);
    if (callbacks) {
      callbacks.forEach((callback) => callback(radar.getState()));
    }
  }
}

export default RadarManager;
