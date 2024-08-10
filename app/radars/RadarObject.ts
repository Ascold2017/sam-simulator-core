import * as CANNON from 'cannon-es';
import FlightObject from '../core/FlightObject';
import Radar from '../core/Radar';
import TargetObject from '../flightObjects/TargetObject';

class RadarObject {
  private flightObject: FlightObject;
  private radar: Radar;
  private minimalSignalVolume: number;
  signalVolume: number;
  rcs: number
  

  constructor(flightObject: FlightObject, radar: Radar) {
    this.flightObject = flightObject 
    this.radar = radar;
    this.rcs = this.calculateRCS();
    this.minimalSignalVolume = this.calculateMinimalSignalVolume();
    this.signalVolume = this.calculateSignalVolume();
  }

  get id() {
    return this.flightObject.id
  }

  // Азимут относительно радара
  get azimuth(): number {
    const directionToObject = this.directionToRadar();
    return this.normalizeAngleTo2Pi(Math.atan2(directionToObject.y, directionToObject.x));
  }

  // Угол возвышения относительно радара
  get elevation(): number {
    const directionToObject = this.directionToRadar();
    const distance = directionToObject.length();
    return Math.asin(directionToObject.z / distance);
  }

  // Параметрическое расстояние (расстояние в плоскости x-y) до радара
  get param(): number {
    const directionToObject = this.directionToRadar();
    return Math.sqrt(directionToObject.x ** 2 + directionToObject.y ** 2);
  }

  get distance(): number {
    const directionToObject = this.directionToRadar();
    const distance = directionToObject.length();
    return distance;
  }

  // Радиальная скорость относительно радара
  get radialVelocity(): number {
    const relativeVelocity = this.flightObject.velocity.vsub(this.radar.body.velocity);
    const directionToObject = this.directionToRadar();
    directionToObject.normalize();
    return relativeVelocity.dot(directionToObject);
  }

   // Свойство isDetected
   get isDetected(): boolean {
    return this.signalVolume >= this.minimalSignalVolume;
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
