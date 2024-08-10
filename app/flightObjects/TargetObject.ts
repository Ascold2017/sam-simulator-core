import FlightObject from "../core/FlightObject";
import * as CANNON from "cannon-es";
import { Position } from "../types";

interface TargetObjectConstructor {
  id: string;
  initialPosition: Position;
  size: number;
}
class TargetObject extends FlightObject {
  constructor({ id, initialPosition, size }: TargetObjectConstructor) {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z,
      ),
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Sphere(size),
    });

    super(id, body, new CANNON.Vec3(0, 0, 0));
  }

  updateCallback(deltaTime: number): void {
    // FOR OVERRIDE
  }

  // Additional logic for target movement can be added here
  update(deltaTime: number): void {
    super.update(deltaTime);
    if (!this.isKilled) this.updateCallback(deltaTime);
  }
}

export default TargetObject;
