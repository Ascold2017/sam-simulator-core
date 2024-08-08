import FlightObject from '../core/FlightObject';
import * as CANNON from 'cannon';

class TargetObject extends FlightObject {
  
  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3) {
    super(id, body, velocity);
  }

  updateCallback(deltaTime: number): void {}

  // Additional logic for target movement can be added here
  update(deltaTime: number): void {
    super.update(deltaTime)
    this.updateCallback(deltaTime)
  }
}

export default TargetObject;
