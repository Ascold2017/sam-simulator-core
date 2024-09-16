import * as CANNON from "cannon-es";
import {
  CreateWeaponChannelPayload,
  Position,
  WeaponChannel,
} from "../types";
import Engine from "../core/Engine";
import Missile from "../flightObjects/Missile";
import { v4 as uuidv4 } from "uuid";
import FlightObject from "../core/FlightObject";
import TargetObject from "../flightObjects/TargetObject";

class WeaponManager {
  private engine: Engine;
  private weaponChannels: Map<string, WeaponChannel> = new Map();

  constructor(engine: Engine) {
    this.engine = engine;
  }

  getWeaponChannel(channelId: string) { 
    return this.weaponChannels.get(channelId);
  }

  createWeaponChannel(data: CreateWeaponChannelPayload) {
    const channelId = uuidv4();
    const weaponChannel: WeaponChannel = {
      missileId: undefined,
      targetId: undefined,
      rayDirection: new CANNON.Vec3(0, 0, 0),
      position: new CANNON.Vec3(
        data.position.x,
        data.position.y,
        data.position.z
      ),
      captureAngle: data.captureAngle,
      weaponParams: data.weaponParams,
    };
    this.weaponChannels.set(channelId, weaponChannel);

    return channelId;
  }

  updateWeaponChannel(channelId: string, direction: Position) {
    const weaponChannel = this.weaponChannels.get(channelId);
    if (!weaponChannel) return;
    weaponChannel.rayDirection = new CANNON.Vec3(
      direction.x,
      direction.y,
      direction.z
    );
    const flightObjects = this.engine.getFlightObjects();

    const target = flightObjects.filter(fo => fo instanceof TargetObject).find(fo => {
      
      const targetPosition = fo.body.position; // CANNON.Vec3
      const weaponPosition = weaponChannel.position; // CANNON.Vec3
  
      // Вектор на цель
      const directionToTarget = targetPosition.vsub(weaponPosition);
      
      // Нормализуем вектор направления луча и направления на цель
      const normalizedRayDirection = weaponChannel.rayDirection.clone()
      normalizedRayDirection.normalize();
      const normalizedDirectionToTarget = directionToTarget.clone();
      normalizedDirectionToTarget.normalize();
  
      // Угол между направлением луча и направлением на цель
      const dotProduct = normalizedRayDirection.dot(normalizedDirectionToTarget);
      const angleToTarget = Math.acos(dotProduct); // В радианах
  
      // Проверка, что цель находится в пределах угла захвата
      return angleToTarget < weaponChannel.captureAngle;
    })
    weaponChannel.targetId = target?.id;
    return weaponChannel.targetId;
  }

  launchMissile(channelId: string) {
    const weaponChannel = this.weaponChannels.get(channelId);
    if (!weaponChannel || (weaponChannel && weaponChannel.missileId)) return;
    const missileId = `missile_${Date.now()}`;
    const missile = new Missile({
      id: missileId,
      startPosition: weaponChannel.position,
      ...weaponChannel.weaponParams,
    });

    missile.updateCallback = (deltaTime: number) => {
      this.updateMissile(channelId, missile, deltaTime);
    };

    this.weaponChannels.set(channelId, {
      ...weaponChannel,
      missileId,
    });

    this.engine.addEntity(missile);
  }

  private updateMissile(channelId: string, missile: Missile, deltaTime: number) {
    const weaponChannel = this.weaponChannels.get(channelId);

    if (!weaponChannel) {
      missile.destroy();
      return;
    }
    const missilePosition = missile.body.position;

    // Подъем на 100 метров, после чего ракета направляется к точке перехвата
    if (!missile.isLaunched) {
      if (missilePosition.y < missile.startPosition.y + 100) {
        missile.velocity.set(0, 100, 0); // Вертикальный подъем
        return;
      }
      missile.isLaunched = true;
    }

    // Если ракета достигла высоты, направляем ее к точке перехвата
    if (missile.isLaunched) {
      if (weaponChannel.targetId) {
        // Поиск цели в зоне поиска
        const targets = this.engine.getFlightObjects();
        const foundTarget = targets.find(
          (t) => t.id === weaponChannel.targetId
        );
        if (!foundTarget) {
          console.log('target not found', weaponChannel.targetId);
          missile.destroy();
          this.weaponChannels.set(channelId, {
            ...weaponChannel,
            missileId: undefined,
            targetId: undefined,
          });
          return;
        }

        // Уничтожаем цель, если она в зоне поражения
        if (
          missilePosition.distanceTo(foundTarget.body.position) <
          missile.killRadius
        ) {
          console.log('kill target', weaponChannel.targetId);
          foundTarget.kill();
          missile.destroy();
          this.weaponChannels.set(channelId, {
            ...weaponChannel,
            missileId: undefined,
            targetId: undefined,
          });
          return;
        }
        // Летим к цели
        const directionToTarget =
          foundTarget.body.position.vsub(missilePosition);
        directionToTarget.normalize();
        missile.velocity = directionToTarget.scale(missile.speed);
      } else {
        const direction = weaponChannel.rayDirection;
        direction.normalize();
        missile.velocity = direction.scale(missile.speed);
      }
    }

    missile.traveledDistance += missile.velocity.length() * deltaTime;
    if (missile.traveledDistance > missile.maxRange) {
      console.log('missile out of range');
      missile.destroy();
      this.weaponChannels.set(channelId, {
        ...weaponChannel,
        missileId: undefined,
      })
    }
  }
}

export default WeaponManager;
