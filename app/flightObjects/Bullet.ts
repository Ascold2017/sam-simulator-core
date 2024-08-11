import FlightObject from '../core/FlightObject';
import * as CANNON from "cannon-es";

class Bullet extends FlightObject {

  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3) {
    super(id, body, velocity);
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    
  }

}

export default Bullet;
