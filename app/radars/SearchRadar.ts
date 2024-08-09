import * as CANNON from "cannon-es";
import Radar from "../core/Radar";
import RadarObject from "../core/RadarObject";

class SearchRadar extends Radar {
  private sweepAngle: number = 0;
  private sweepSpeed: number;
  private detectedFlightObjects: RadarObject[] = [];

  constructor(
    id: string,
    body: CANNON.Body,
    minElevationAngle: number,
    maxElevationAngle: number,
    detectionRange: number,
    sweepSpeed: number = 1, // Обороты в секунду
  ) {
    super(id, body, minElevationAngle, maxElevationAngle, detectionRange);
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
      new RadarObject(fo.id, fo.body, fo.velocity, this)
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
