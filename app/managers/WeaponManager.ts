import * as CANNON from "cannon-es";
import { Position } from "../types";
import Engine from "../core/Engine";
import ActiveMissile from "../flightObjects/ActiveMissile";
import FlightObject from "../core/FlightObject";

class WeaponManager {
  private engine: Engine;
  private targetDataMap: Map<
    string,
    { position: CANNON.Vec3; velocity: CANNON.Vec3 }
  > = new Map();

  constructor(engine: Engine) {
    this.engine = engine;
  }

  launchActiveMissile(targetId: string, speed: number, position: Position) {
    // 1. Находим flightObject по targetId
    const target = this.engine.getFlightObjects().find((obj) =>
      obj.id === targetId
    );
    if (!target) {
      console.log(`Target with ID ${targetId} not found.`);
      return;
    }

    // 2. Обновляем данные о цели
    this.updateTargetData(targetId);

    // 3. Создаем ракету ActiveMissile
    const missile = new ActiveMissile({
      id: `missile_${Date.now()}`,
      startPosition: position,
      searchAngle: (15 * Math.PI) / 180, // 15 градусов в радианы
      killRadius: 30,
      maxDetectionRange: 500,
    });

    missile.targetData = this.targetDataMap.get(targetId)!;

    // 4. Устанавливаем updateCallback для управления полетом ракеты
    missile.updateCallback = (deltaTime: number) => {
      this.updateMissile(missile, speed);
    };

    // Добавляем ракету в движок
    this.engine.addEntity(missile);
  }

  private updateMissile(missile: ActiveMissile, missileSpeed: number) {
    const missilePosition = missile.body.position;

    // Подъем на 100 метров, после чего ракета направляется к точке перехвата
    if (!missile.isLaunched) {
      if (missilePosition.z < 100) {
        missile.velocity.set(0, 0, 100); // Вертикальный подъем
        return;
      }
      missile.isLaunched = true;
    }

    // Если ракета достигла высоты, направляем ее к точке перехвата
    if (missile.isLaunched && !missile.isSearching) {
      if (missile.targetData) {
        const interceptPoint = missile.calculateInterceptPoint(missileSpeed);
        if (interceptPoint) {
          const directionToIntercept = interceptPoint.vsub(missilePosition);
          directionToIntercept.normalize();
          missile.velocity = directionToIntercept.scale(missileSpeed);
        }
      }
    }

    // Проверяем, нужно ли начать поиск цели
    const distanceToIntercept = missilePosition.distanceTo(
      missile.targetData!.position,
    );
    if (
      distanceToIntercept < missile.maxDetectionRange && !missile.isSearching
    ) {
      missile.isSearching = true;

      // Поиск цели в зоне поиска
      const targets = this.engine.getFlightObjects();
      const foundTarget = targets.find((target) => {
        const directionToTarget = target.body.position.vsub(missilePosition);
        directionToTarget.normalize();
        const missileVelocityLength = missile.velocity.length();
        const angleToTarget = Math.acos(
          missile.velocity.dot(directionToTarget) / missileVelocityLength,
        );

        return angleToTarget < missile.searchAngle;
      });

      // Если цель найдена, направляем ракету на цель
      if (foundTarget) {
        missile.capturedTargetId = foundTarget.id;
      }
    }

    if (missile.isSearching && missile.capturedTargetId) {
      // Поиск цели в зоне поиска
      const targets = this.engine.getFlightObjects();
      const foundTarget = targets.find((t) =>
        t.id === missile.capturedTargetId
      );
      if (!foundTarget) {
        missile.kill();
        return;
      }

      // Уничтожаем цель, если она в зоне поражения
      if (
        missilePosition.distanceTo(foundTarget.body.position) <
          missile.killRadius
      ) {
        foundTarget.kill();
        missile.destroy();
        return;
      }
      // Летим к цели
      const directionToTarget = foundTarget.body.position.vsub(missilePosition);
      directionToTarget.normalize();
      missile.velocity = directionToTarget.scale(missileSpeed);
    }
  }

  public updateTargetData(targetId: string) {
    const target = this.engine.getFlightObjects().find((obj) =>
      obj.id === targetId
    );
    if (target) {
      this.targetDataMap.set(targetId, {
        position: target.body.position.clone(),
        velocity: target.velocity.clone(),
      });
    }
  }
}

export default WeaponManager;
