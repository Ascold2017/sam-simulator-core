import FlightObject from "../core/FlightObject";
import * as CANNON from "cannon-es";
import { Position } from "../types";

interface TargetObjectConstructor {
  id: string;
  initialPosition: Position;
  size: number;
  rcs: number
}
class TargetObject extends FlightObject {
  rcs: number;
  constructor({ id, initialPosition, size, rcs }: TargetObjectConstructor) {
    const body = new CANNON.Body({
      mass: 20000,
      position: new CANNON.Vec3(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z,
      ),
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Sphere(size),
    });

    super(id, body, new CANNON.Vec3(0, 0, 0));
    this.rcs = rcs;
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
