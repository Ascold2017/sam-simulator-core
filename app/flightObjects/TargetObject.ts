import FlightObject from '../core/FlightObject';
import * as CANNON from 'cannon';

class TargetObject extends FlightObject {
  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3) {
    super(id, body, velocity);
  }

  // Additional logic for target movement can be added here
  update(deltaTime: number): void {
    super.update(deltaTime)
  }
}

export default TargetObject;
