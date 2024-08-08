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
    return this.engine.entities.find(
      (entity) =>
        entity instanceof TargetObject && (entity as TargetObject).id === id,
    ) as TargetObject | undefined;
  }

  private moveAlongRoute(target: TargetObject, waypoints: Waypoint[]) {
    if (waypoints.length < 2) return;

    let currentIndex = 0;
    const nextWaypoint = () => {
      currentIndex++;
      if (currentIndex < waypoints.length) {
        console.log('here')
        this.moveToWaypoint(
          target,
          waypoints[currentIndex - 1],
          waypoints[currentIndex],
          nextWaypoint,
        );
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
    direction.normalize(); // Нормализуем направление после вычисления дистанции
    const duration = distance / from.speed;
    let elapsed = 0;

    const updateTarget = (deltaTime: number) => {
      elapsed += deltaTime;
      if (elapsed >= duration) {
        target.body.position.set(to.position.x, to.position.y, to.position.z);
        if (callback) callback();
      } else {
       
        const moveStep = direction.scale(from.speed * deltaTime);
        target.body.position.vadd(moveStep, target.body.position);
      }
    };

    target.update = updateTarget;
  }
}

export default TargetManager;
