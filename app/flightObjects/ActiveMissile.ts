import FlightObject from '../core/FlightObject';
import * as CANNON from "cannon-es";
import TargetObject from './TargetObject';

class ActiveMissile extends FlightObject {
  target: TargetObject | null = null;
  searchAngle: number;

  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3, searchAngle: number) {
    super(id, body, velocity);
    this.searchAngle = searchAngle;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    if (this.target) {
      // Logic to move towards target
    } else {
      // Logic to search for target
    }
  }

  setTarget(target: TargetObject) {
    this.target = target;
  }

  
}

export default ActiveMissile;
