import * as CANNON from "cannon-es";
import {
  CreateWeaponChannelPayload,
  Position,
  WeaponChannel,
} from "../types";
import Engine from "../core/Engine";
import Missile from "../flightObjects/Missile";
import { v4 as uuidv4 } from "uuid";

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
    // TODO search and set targetId
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
      this.updateMissile(channelId, missile);
    };

    this.weaponChannels.set(channelId, {
      ...weaponChannel,
      missileId,
    });

    this.engine.addEntity(missile);
  }

  private updateMissile(channelId: string, missile: Missile) {
    const weaponChannel = this.weaponChannels.get(channelId);

    if (!weaponChannel) {
      missile.destroy();
      return;
    }
    const missilePosition = missile.body.position;

    // Подъем на 100 метров, после чего ракета направляется к точке перехвата
    if (!missile.isLaunched) {
      // TODO fix
      if (missilePosition.y < 100) {
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
  }
}

export default WeaponManager;
