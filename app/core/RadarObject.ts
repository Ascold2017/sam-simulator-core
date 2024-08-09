import * as CANNON from 'cannon-es';
import FlightObject from './FlightObject';
import Radar from './Radar';

class RadarObject extends FlightObject {
  private radar: Radar;

  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3, radar: Radar) {
    super(id, body, velocity);
    this.radar = radar;
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
    const relativeVelocity = this.velocity.vsub(this.radar.body.velocity);
    const directionToObject = this.directionToRadar();
    directionToObject.normalize();
    return relativeVelocity.dot(directionToObject);
  }

  private directionToRadar(): CANNON.Vec3 {
    return new CANNON.Vec3(
      this.body.position.x - this.radar.body.position.x,
      this.body.position.y - this.radar.body.position.y,
      this.body.position.z - this.radar.body.position.z
    );
  }

  private normalizeAngleTo2Pi(angle: number): number {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }
}

export default RadarObject;
