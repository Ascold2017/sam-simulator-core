import Engine from "../core/Engine";
import Radar from "../core/Radar";

type RadarUpdateCallback = (radar: Radar) => void;

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

  private updateRadars() {
    this.engine.getRadars().forEach((radar) => {
      radar.setFlightObjects(this.engine.getFlightObjects());
      this.notifyRadarSubscribers(radar);
    });
  }

  private getRadarById(radarId: string): Radar | undefined {
    return this.engine.getRadars().find((entity) => entity.id === radarId);
  }

  private notifyRadarSubscribers(radar: Radar) {
    const callbacks = this.radarUpdateCallbacks.get(radar.id);
    if (callbacks) {
      callbacks.forEach((callback) => callback(radar));
    }
  }
}

export default RadarManager;
