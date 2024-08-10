import Radar, { RadarConstructor } from '../core/Radar';
import RadarObject from './RadarObject'; // Импорт класса RadarObject

interface SectorRadarConstructor extends RadarConstructor {
  viewAngle: number;
  minElevationAngle: number;
  maxElevationAngle: number;
}

class SectorRadar extends Radar {
  elevationAngle: number;
  azimuthAngle: number;
  private detectedFlightObjects: RadarObject[];
  viewAngle: number;

  constructor({ viewAngle, ...radarParams }: SectorRadarConstructor) {
    super(radarParams);
    this.azimuthAngle = 0;
    this.elevationAngle = 0;
    this.viewAngle = viewAngle;
    this.detectedFlightObjects = [];
  }

  // Метод для установки текущих углов азимута и возвышения
  setAngle(azimuth: number, elevation: number) {
    this.azimuthAngle = azimuth;
    
    // Ограничиваем угол возвышения в пределах minElevationAngle и maxElevationAngle
    if (elevation < this.minElevationAngle) {
      this.elevationAngle = this.minElevationAngle;
    } else if (elevation > this.maxElevationAngle) {
      this.elevationAngle = this.maxElevationAngle;
    } else {
      this.elevationAngle = elevation;
    }
  }

  // Метод для сканирования объектов
  scan(deltaTime: number) {
    if (!this.isEnabled) {
      // Если радар отключен, очищаем обнаруженные объекты и не сканируем
      this.detectedFlightObjects = [];
      return;
    }

    const detectedObjects: RadarObject[] = [];

    // Проходим по всем объектам, чтобы определить, попадают ли они в сектор радара
    for (const flightObject of this.flightObjects) {

      const radarObj = new RadarObject(flightObject, this);
      // Проверяем, попадает ли объект в сектор сканирования
      if (this.isInSector(radarObj.azimuth, radarObj.elevation)) {
        detectedObjects.push(radarObj);
      }
    }

    // Обновляем список обнаруженных объектов
    this.detectedFlightObjects = detectedObjects;
  }

  // Проверка, попадает ли объект в сектор сканирования
  private isInSector(azimuthToObject: number, elevationToObject: number): boolean {
    const azimuthDiff = Math.abs(this.azimuthAngle - azimuthToObject);
    const elevationDiff = Math.abs(this.elevationAngle - elevationToObject);

    return azimuthDiff <= this.viewAngle / 2 && elevationDiff <= this.viewAngle / 2;
  }

  // Публичный метод для получения состояния радара
  getState() {
    return {
      detectedFlightObjects: this.detectedFlightObjects,
      azimuthAngle: this.azimuthAngle,
      elevationAngle: this.elevationAngle,
    };
  }
}

export default SectorRadar;
