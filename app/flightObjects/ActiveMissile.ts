import FlightObject from '../core/FlightObject';
import * as CANNON from "cannon-es";
import { Position } from '../types';

interface ActiveMissileConstructor {
  id: string;
  startPosition: Position;
  searchAngle: number;
  killRadius: number;
  maxDetectionRange: number;
}

interface TargetData {
  position: CANNON.Vec3;
  velocity: CANNON.Vec3;
}

class ActiveMissile extends FlightObject {
  targetData: TargetData | null = null;
  searchAngle: number;
  isLaunched: boolean = false;
  isSearching: boolean = false;
  capturedTargetId: string | null = null;
  killRadius: number;
  maxDetectionRange: number;

  constructor({id, startPosition, searchAngle, killRadius, maxDetectionRange }: ActiveMissileConstructor) {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(
        startPosition.x,
        startPosition.y,
        startPosition.z,
      ),
      type: CANNON.Body.DYNAMIC,
      shape: new CANNON.Cylinder(1, 1, 6),
    });

    super(id, body, new CANNON.Vec3(0, 0, 0));
    this.searchAngle = searchAngle;
    this.killRadius = killRadius;
    this.maxDetectionRange = maxDetectionRange;
  }

  updateCallback(deltaTime: number): void {
    // FOR OVERRIDE
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    if (!this.isKilled) this.updateCallback(deltaTime);
  }

  calculateInterceptPoint(missileSpeed: number): CANNON.Vec3 | null {
    if (!this.targetData) return null;

    const { position: targetPosition, velocity: targetVelocity } = this.targetData;
    const relativePosition = targetPosition.vsub(this.body.position);
    const timeToIntercept = relativePosition.length() / missileSpeed;

    return targetPosition.vadd(targetVelocity.scale(timeToIntercept));
  }
}

export default ActiveMissile;
