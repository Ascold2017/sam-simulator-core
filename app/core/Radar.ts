import Entity from './Entity';
import * as CANNON from 'cannon';

class Radar extends Entity {
  minElevationAngle: number;
  maxElevationAngle: number;

  constructor(id: string, body: CANNON.Body, minElevationAngle: number, maxElevationAngle: number) {
    super(id, body);
    this.minElevationAngle = minElevationAngle;
    this.maxElevationAngle = maxElevationAngle;
  }

  scan() {
    // Logic for scanning
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.scan()
  }
}

export default Radar;
