import * as CANNON from "cannon";
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
      (entity) =>(entity).id === id,
    ) as TargetObject;
  }

  private moveAlongRoute(target: TargetObject, waypoints: Waypoint[]) {
    if (waypoints.length < 2) return;

    let currentIndex = 0;
    const nextWaypoint = () => {
      currentIndex++;
      if (currentIndex < waypoints.length) {
        console.log(currentIndex)
        this.moveToWaypoint(
          target,
          waypoints[currentIndex - 1],
          waypoints[currentIndex],
          nextWaypoint,
        );
      } else {
        target.destroy()
      }
    };

    this.moveToWaypoint(target, waypoints[0], waypoints[1], nextWaypoint);
  }

  private moveToWaypoint(target: TargetObject, from: Waypoint, to: Waypoint, callback?: Function) {
    const direction = new CANNON.Vec3(
      to.position.x - from.position.x,
      to.position.y - from.position.y,
      to.position.z - from.position.z
    );
    const distance = direction.norm();
    const duration = distance / to.speed;
    let elapsed = 0;

    const updateCallback = (deltaTime: number) => {
      elapsed += deltaTime;
      if (target.isKilled) {
        target.velocity.set(0, 0, 0); // Останавливаем движение при убийстве цели
        return;
      }

      if (elapsed >= duration) {
        target.velocity.set(0, 0, 0); // Останавливаем движение после достижения точки
        if (callback) callback();
      } else {
        const moveStep = direction.scale(to.speed * deltaTime);
        target.velocity.copy(moveStep);
      }
    };

    target.updateCallback = updateCallback;
  }
}

export default TargetManager;
