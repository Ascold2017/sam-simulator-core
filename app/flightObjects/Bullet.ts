import FlightObject from '../core/FlightObject';
import * as CANNON from 'cannon';

class ActiveMissile extends FlightObject {
  searchAngle: number;

  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3, searchAngle: number) {
    super(id, body, velocity);
    this.searchAngle = searchAngle;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    
  }

}

export default ActiveMissile;
