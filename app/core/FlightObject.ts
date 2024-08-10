import Entity from './Entity';
import * as CANNON from "cannon-es";


class FlightObject extends Entity {
  velocity: CANNON.Vec3;
  isKilled: boolean;

  constructor(id: string, body: CANNON.Body, velocity: CANNON.Vec3) {
    super(id, body);
    this.velocity = velocity;
    this.isKilled = false;
    this.body.addEventListener('collide', () => this.onCollide())
  }

  update(deltaTime: number) {
    super.update(deltaTime)
    
    if (this.isKilled) {
      // Применяем гравитацию
      const gravityCompensation = new CANNON.Vec3(0, 0, -this.body.mass * 9.81);
      this.body.applyForce(gravityCompensation, this.body.position);
    } else {
      this.body.velocity = this.velocity.scale(deltaTime);
    }
    
  }

  kill() {
    this.isKilled = true;
  }

  private onCollide() {
    console.log('collide', this.id)
    this.destroy();
  }
}

export default FlightObject;
