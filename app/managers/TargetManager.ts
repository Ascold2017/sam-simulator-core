import * as CANNON from "cannon-es";
import Engine from "../core/Engine";
import TargetObject from "../flightObjects/TargetObject";
import { RouteData, Waypoint } from "../types";

class TargetManager {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  updateRoute(route: RouteData) {
    const target = this.getTargetById(route.targetId);
    if (target) {
      this.moveAlongRoute(target, route.waypoints);
    }
  }

  private getTargetById(id: string): TargetObject | undefined {
    return this.engine.getFlightObjects().find(
      (entity) => entity.id === id,
    ) as TargetObject;
  }

  private moveAlongRoute(target: TargetObject, waypoints: Waypoint[]) {
    if (waypoints.length < 1) return;

    let currentIndex = 0;
    const nextWaypoint = () => {
      currentIndex++;
      if (currentIndex < waypoints.length) {
        this.moveToWaypoint(
          target,
          waypoints[currentIndex],
          nextWaypoint,
        );
      } else {
        target.destroy();
      }
    };

    this.moveToWaypoint(target, waypoints[0], nextWaypoint);
  }

  private moveToWaypoint(
    target: TargetObject,
    destination: Waypoint,
    callback?: Function,
  ) {
    const destPosition = new CANNON.Vec3(
      destination.position.x,
      destination.position.y,
      destination.position.z,
    );

    const updateCallback = (deltaTime: number) => {
      // calculate direction to destination point
      const direction = destPosition.vsub(target.body.position);
      direction.normalize();
      if (target.body.position.distanceTo(destPosition) < 1) {
        // if we destinated position - call next waypoint
        if (callback) callback();
      } else {
        // set velocity
        target.body.velocity = direction.scale(destination.speed);
      }
    };

    target.updateCallback = updateCallback;
  }
}

export default TargetManager;
