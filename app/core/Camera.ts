import Entity from './Entity';
import * as CANNON from 'cannon';

class Camera extends Entity {
  minElevationAngle: number;
  maxElevationAngle: number;
  azimuthAngle: number;
  viewAngle: number;

  constructor(id: string, body: CANNON.Body, minElevationAngle: number, maxElevationAngle: number, azimuthAngle: number, viewAngle: number) {
    super(id, body);
    this.minElevationAngle = minElevationAngle;
    this.maxElevationAngle = maxElevationAngle;
    this.azimuthAngle = azimuthAngle;
    this.viewAngle = viewAngle;
  }

  look() {
    // Logic for camera view
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
    this.look()
  }
}

export default Camera;
