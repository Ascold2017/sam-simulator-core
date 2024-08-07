import Entity from './Entity';
import * as CANNON from 'cannon';

class FlightObject extends Entity {
  velocity: CANNON.Vec3;

  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3) {
    super(id, body);
    this.velocity = velocity;
  }

  update(deltaTime: number) {
    this.body.position.vadd(this.velocity.scale(deltaTime), this.body.position);
  }
}

export default FlightObject;
