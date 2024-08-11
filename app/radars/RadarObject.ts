import * as CANNON from 'cannon-es';
import FlightObject from '../core/FlightObject';
import Radar from '../core/Radar';
import TargetObject from '../flightObjects/TargetObject';

class RadarObject {
  private flightObject: FlightObject;
  private radar: Radar;
  private minimalSignalVolume: number;
  azimuth: number;
  elevation: number;
  param: number;
  distance: number;
  radialVelocity: number;
  isDetected: boolean;
  signalVolume: number;
  rcs: number
  

  constructor(flightObject: FlightObject, radar: Radar) {
    this.flightObject = flightObject 
    this.radar = radar;
    this.rcs = this.calculateRCS();
    this.minimalSignalVolume = this.calculateMinimalSignalVolume();
    this.signalVolume = this.calculateSignalVolume();
    const directionToObject = this.directionToRadar();
    const distance = directionToObject.length();
    this.azimuth = this.normalizeAngleTo2Pi(Math.atan2(directionToObject.y, directionToObject.x));
    this.elevation = Math.asin(directionToObject.z / distance);
    this.distance = distance;
    // Параметрическое расстояние (расстояние в плоскости x-y) до радара
    this.param = Math.sqrt(directionToObject.x ** 2 + directionToObject.y ** 2);
    // Радиальная скорость относительно радара
    // directionToObject.normalize();
    this.radialVelocity = this.flightObject.velocity.dot(directionToObject);
    this.isDetected = this.signalVolume >= this.minimalSignalVolume;
  }

  get id() {
    return this.flightObject.id
  }

  private directionToRadar(): CANNON.Vec3 {
    return new CANNON.Vec3(
      this.flightObject.body.position.x - this.radar.body.position.x,
      this.flightObject.body.position.y - this.radar.body.position.y,
      this.flightObject.body.position.z - this.radar.body.position.z
    );
  }

  private normalizeAngleTo2Pi(angle: number): number {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }

  // Рассчитываем RCS объекта
  private calculateRCS(): number {
    if (this.flightObject instanceof TargetObject) {
      return this.flightObject.rcs;
    }
    return 1; // По умолчанию RCS = 1 для нецелевых объектов
  }

  // Рассчитываем объем сигнала (signalVolume)
  private calculateSignalVolume(): number {
    // В формуле используется обратно пропорциональная зависимость от квадрата расстояния
    // Чем меньше расстояние, тем больше сигнал
    return this.rcs / Math.pow(this.distance, 2);
  }

   // Метод для расчета minimalSignalVolume
   private calculateMinimalSignalVolume(): number {
    return 1 / Math.pow(this.radar.detectionRange, 2);
  }
}

export default RadarObject;
