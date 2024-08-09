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

    const allRadarObjects = this.flightObjects.map(fo => new RadarObject(fo.id, fo.body, fo.velocity, this));

    const newRadarObjects = this.detectedFlightObjects.filter((dfo) =>
      this.isRadarObjectDetected(dfo)
    );

    allRadarObjects.forEach((ro) => {
      if (this.isRadarObjectDetected(ro)) {
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

  private isRadarObjectDetected(radarObject: RadarObject): boolean {
    const distance = radarObject.distance;
    if (distance > this.detectionRange) {
      return false;
    }

    const elevationAngle = radarObject.elevation;
    const azimuthAngle = radarObject.azimuth;

    // Проверяем, находится ли объект в секторе текущей развертки и в допустимом диапазоне возвышения
    return (
      this.minElevationAngle <= elevationAngle &&
      elevationAngle <= this.maxElevationAngle &&
      this.isWithinSweep(azimuthAngle)
    );
  }

  private isWithinSweep(angleToObject: number): boolean {
    const sweepStart = this.sweepAngle - Math.PI / 16; // 11.25° диапазон (настраиваемый)
    const sweepEnd = this.sweepAngle + Math.PI / 16;

    if (sweepStart < 0) {
      return (
        angleToObject >= sweepStart + 2 * Math.PI || angleToObject <= sweepEnd
      );
    } else if (sweepEnd > 2 * Math.PI) {
      return (
        angleToObject >= sweepStart || angleToObject <= sweepEnd - 2 * Math.PI
      );
    } else {
      return angleToObject >= sweepStart && angleToObject <= sweepEnd;
    }
  }
}

export default SearchRadar;
