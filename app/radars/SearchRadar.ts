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
  
    const sweepStart = this.sweepAngle - (Math.PI / 60); // 3° в радианах = π/60
    const sweepEnd = this.sweepAngle + (Math.PI / 60);
  
    // Удаляем объекты, которые больше не находятся в зоне видимости текущего угла развертки
    const newRadarObjects = this.detectedFlightObjects.filter((dfo) => {
      const azimuth = dfo.azimuth;
      return !this.isWithinSweep(azimuth, sweepStart, sweepEnd);
    });
  
    // Добавляем новые объекты, которые попадают в зону видимости текущего угла развертки
    const allRadarObjects = this.flightObjects.map(fo => new RadarObject(fo.id, fo.body, fo.velocity, this));
    
    allRadarObjects.forEach((ro) => {
      if (
        this.isWithinSweep(ro.azimuth, sweepStart, sweepEnd) &&
        this.isWithinElevation(ro.elevation) &&
        !this.detectedFlightObjects.some((obj) => obj.id === ro.id)
      ) {
        newRadarObjects.push(ro);
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

  private isWithinSweep(angleToObject: number, sweepStart: number, sweepEnd: number): boolean {
    // Нормализуем углы в диапазон [0, 2π]
    const normalizedAngle = this.normalizeAngleTo2Pi(angleToObject);
    const normalizedSweepStart = this.normalizeAngleTo2Pi(sweepStart);
    const normalizedSweepEnd = this.normalizeAngleTo2Pi(sweepEnd);
  
    if (normalizedSweepStart > normalizedSweepEnd) {
      return (
        normalizedAngle >= normalizedSweepStart || normalizedAngle <= normalizedSweepEnd
      );
    } else {
      return normalizedAngle >= normalizedSweepStart && normalizedAngle <= normalizedSweepEnd;
    }
  }
  
  private isWithinElevation(elevationAngle: number): boolean {
    return elevationAngle >= this.minElevationAngle && elevationAngle <= this.maxElevationAngle;
  }

  private normalizeAngleTo2Pi(angle: number): number {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }

}

export default SearchRadar;
