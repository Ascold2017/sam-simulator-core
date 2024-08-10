import Radar, { RadarConstructor } from "../core/Radar";
import RadarObject from "./RadarObject";

interface SearchRadarConstructor extends RadarConstructor {
  sweepSpeed: number
}
class SearchRadar extends Radar {
  private sweepAngle: number = 0;
  private sweepSpeed: number;
  private detectedFlightObjects: RadarObject[] = [];

  constructor({ sweepSpeed, ...radarParams }: SearchRadarConstructor) {
    super(radarParams);
    this.sweepSpeed = sweepSpeed * Math.PI * 2; // Преобразуем в радианы в секунду
  }

  getState() {
    return {
      detectedFlightObjects: this.detectedFlightObjects,
      sweepAngle: this.sweepAngle,
    };
  }

  scan(deltaTime: number) {
    if (!this.isEnabled) {
      this.resetSweep();
      return;
    }

    this.updateSweep(deltaTime);

    // Добавляем новые объекты, которые попадают в зону видимости текущего угла развертки
    const allRadarObjects = this.flightObjects.map((fo) =>
      new RadarObject(fo, this)
    );

    const newRadarObjects = this.detectedFlightObjects.filter((ro) =>
      !this.isWithinSweep(ro.azimuth)
    );

    allRadarObjects.forEach((ro) => {
      if (this.isWithinSweep(ro.azimuth) && this.isWithinElevation(ro.elevation)) {
        if (!newRadarObjects.some((obj) => obj.id === ro.id)) {
          newRadarObjects.push(ro);
        }
      }
    });
    
    this.detectedFlightObjects = newRadarObjects;
  }

  private updateSweep(deltaTime: number) {
    this.sweepAngle += this.sweepSpeed * deltaTime;

    if (this.sweepAngle >= Math.PI * 2) {
      this.sweepAngle -= Math.PI * 2; // Обнуление угла после полного оборота
    }
  }

  private resetSweep() {
    this.sweepAngle = 0;
    this.detectedFlightObjects = [];
  }

  private isWithinSweep(angleToObject: number): boolean {
    return Math.abs(angleToObject - this.sweepAngle) < (Math.PI / 60)
  }

  private isWithinElevation(elevationAngle: number): boolean {
    return elevationAngle >= this.minElevationAngle &&
      elevationAngle <= this.maxElevationAngle;
  }
}

export default SearchRadar;
