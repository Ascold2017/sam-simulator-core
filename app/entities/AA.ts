import Entity, { EntityEvents, EntityState } from "./Entity";
import * as CANNON from "cannon-es";
import Missile, { MissileProps, MissileState } from "./Missile";
import { World } from "./World";
import TargetNPC from "./TargetNPC";

type AAMissileProps = Omit<MissileProps, "id" | "startPosition" | "targetId" | "guidanceMethod">;
export interface AAProps {
  id: string;
  position: { x: number; y: number; z: number };
  radarProps: {
    range: number;
    captureAngle: number;
  };
  reloadTime: number;
  missileCount: number;
  missileChannelCount: number;
  missileProps: AAMissileProps;
}

export interface AAState extends EntityState {
  ammoCount: number;
  readyToFire: boolean;
  aimRay: [number, number, number];
  capturedTargetId: string | null;
  launchedMissileIds: string[];
  detectedTargetIds: string[];
}

export interface AAEvents extends EntityEvents {
  destroy: EntityState;
  launch_missile: MissileState;
  missile_overloaded: MissileState;
  missile_over_distance: MissileState;
  target_captured: AAState;
  target_resetted: AAState;
}

export class AA extends Entity<AAEvents> {
  private radarProps: AAProps["radarProps"];
  private missileProps: AAMissileProps;
  private missileCount: number;
  private missileChannelCount: number;
  private launched: Missile[] = [];
  private aimRay = new CANNON.Vec3(1, 1, 1);
  private detectedTargetIds: string[] = [];
  private capturedTargetId: string | null = null;
  private gameWorld: World;
  private reloadTime: number;
  private lastTimeFired = Date.now();

  constructor(props: AAProps, gameWorld: World) {
    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(10),
      position: new CANNON.Vec3(
        props.position.x,
        props.position.y,
        props.position.z
      ),
    });

    super(props.id, body);

    this.radarProps = props.radarProps;
    this.missileProps = props.missileProps;
    this.missileCount = props.missileCount;
    this.missileChannelCount = props.missileChannelCount;
    this.type = "aa";
    this.gameWorld = gameWorld;
    this.reloadTime = props.reloadTime;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    this.launched.forEach((missile) => {
      missile.update(deltaTime);
    });
    this.updateRadar();
  }

  fire(guidanceMethod: 'default' | '3p' | '1/2') {
    if (!this.capturedTargetId || this.missileCount <= 0) return;
    const now = Date.now();
    if (now - this.lastTimeFired < this.reloadTime * 1000) return;
    if (!this.body.world || this.missileCount <= 0) return;
    const missile = new Missile(
      {
        id: `${this.id}-missile-${this.launched.length + 1}`,
        startPosition: {
          x: this.body.position.x,
          y: this.body.position.y,
          z: this.body.position.z,
        },
        targetId: this.capturedTargetId,
        guidanceMethod,
        ...this.missileProps,
      },
      this.gameWorld
    );

    missile.eventEmitter.on("destroy", () => {
      this.launched = this.launched.filter(
        (missile) => missile.id !== missile.id
      );
      this.missileCount++;
    });

    missile.eventEmitter.on("overloaded", (state) => {
      this.eventEmitter.emit("missile_overloaded", state);
    });

    missile.eventEmitter.on("over_distance", (state) => {
      this.eventEmitter.emit("missile_over_distance", state);
    });

    this.eventEmitter.emit("launch_missile", missile.getState());

    this.launched.push(missile);
    this.gameWorld.addEntity(missile);
    this.missileCount--;
    this.missileChannelCount--;
    this.lastTimeFired = now;
  }

  captureTarget() {
    // Угол раствора сектора (в радианах)
    const halfCaptureAngle = this.radarProps.captureAngle / 2;

    // Позиция зенитки
    const aaPosition = this.body.position;

    // Проверяем каждую обнаруженную цель
    for (const targetId of this.detectedTargetIds) {
      const target = this.gameWorld.getEntityById(targetId) as TargetNPC;
      if (!target) continue;

      // Вектор от зенитки к цели
      const directionToTarget = target.body.position.vsub(aaPosition);
      directionToTarget.normalize();

      // Угол между aimRay и вектором на цель
      const aimRayNormalized = this.aimRay.clone();
      const angleToTarget = Math.acos(directionToTarget.dot(aimRayNormalized));

      // Если цель находится в секторе захвата (менее половины captureAngle)
      if (angleToTarget <= halfCaptureAngle) {
        // Захватываем цель
        this.capturedTargetId = target.id;
        console.log(`Target captured: ${target.id}`);
        this.eventEmitter.emit("target_captured", this.getState());
        break; // Захватываем первую подходящую цель
      }
    }
  }

  resetTarget() {
    this.capturedTargetId = null;
    this.eventEmitter.emit("target_resetted", this.getState());
  }

  updateAimRay(aimRay: [number, number, number]) {
    this.aimRay = new CANNON.Vec3(aimRay[0], aimRay[1], aimRay[2]);
    this.aimRay.normalize();
  }

  private updateRadar() {
    this.detectedTargetIds = [];
    this.gameWorld.getEntitiesByType("target-npc").forEach((t) => {
      const target = t as TargetNPC;
      const distance = this.body.position.distanceTo(target.body.position);
      if (distance < this.radarProps.range) {
        const ray = new CANNON.Ray(
          this.body.position,
          target.body.position.clone().vsub(this.body.position)
        );

        // Выполняем raycast, проверяя пересечение с объектами в мире
        const hit = ray.intersectWorld(this.body.world!, {
          skipBackfaces: true, // Пропускаем задние стороны объектов
          collisionFilterMask: ~target.body.collisionFilterGroup, // Игнорируем саму цель
        });

        // Если ничего не мешает, добавляем цель в список обнаруженных
        if (!hit) {
          this.detectedTargetIds.push(target.id);
        }
      }
    });

    if (
      this.capturedTargetId &&
      !this.detectedTargetIds.includes(this.capturedTargetId)
    ) {
      this.resetTarget();
    }
  }

  getState(): AAState {
    return {
      ...super.getState(),
      ammoCount: this.missileCount,
      aimRay: this.aimRay.toArray(),
      readyToFire: Date.now() - this.lastTimeFired > this.reloadTime * 1000,
      launchedMissileIds: this.launched.map((missile) => missile.id),
      detectedTargetIds: this.detectedTargetIds,
      capturedTargetId: this.capturedTargetId,
    };
  }
}
