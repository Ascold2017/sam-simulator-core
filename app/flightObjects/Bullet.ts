import FlightObject from "../core/FlightObject";
import * as CANNON from "cannon-es";
import { Position } from "../types";

interface BulletConstructor {
  id: string;
  startPosition: Position;
  velocity: CANNON.Vec3;
}
class Bullet extends FlightObject {
  constructor({ id, startPosition, velocity }: BulletConstructor) {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(
        startPosition.x,
        startPosition.y,
        startPosition.z,
      ),
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Sphere(1),
    });

    super(id, body, velocity);
  }

  update(deltaTime: number) {
    super.update(deltaTime);
  }
}

export default Bullet;
