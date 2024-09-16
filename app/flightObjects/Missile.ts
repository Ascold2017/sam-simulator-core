import FlightObject from "../core/FlightObject";
import * as CANNON from "cannon-es";
import { Position } from "../types";

interface MissileConstructor {
  id: string;
  startPosition: Position;
  speed: number;
  killRadius: number;
  maxRange: number;
}

class Missile extends FlightObject {
  isLaunched: boolean = false;
  speed: number;
  killRadius: number;
  maxRange: number;
  startPosition: Position;
  traveledDistance: number = 0;

  constructor({
    id,
    startPosition,
    killRadius,
    maxRange,
    speed,
  }: MissileConstructor) {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(
        startPosition.x,
        startPosition.y,
        startPosition.z
      ),
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Cylinder(1, 1, 6),
    });

    super(id, body, new CANNON.Vec3(0, 0, 0));
    this.killRadius = killRadius;
    this.maxRange = maxRange;
    this.speed = speed;
    this.startPosition = startPosition;
  }

  updateCallback(deltaTime: number): void {
    // FOR OVERRIDE
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    if (!this.isKilled) this.updateCallback(deltaTime);
  }
}

export default Missile;
