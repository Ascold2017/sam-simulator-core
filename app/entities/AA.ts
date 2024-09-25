import Entity, { EntityEvents, EntityState } from "./Entity";
import * as CANNON from "cannon-es";
import Missile, {
  MissileProps,
  MissileState,
} from "./Missile";
import { World } from "./World";
import TargetNPC from "./TargetNPC";

export interface AAProps {
  id: string;
  position: { x: number; y: number; z: number };
  radarProps: {
    range: number;
  };
  reloadTime: number;
  missileCount: number;
  missileProps: Omit<MissileProps, "id" | "startPosition">;
}

export interface AAState extends EntityState {
  ammoCount: number;
  readyToFire: boolean;
  aimRay: [number, number, number];
  launchedMissileIds: string[];
  detectedTargetIds: string[];
}

export interface AAEvents extends EntityEvents {
  destroy: EntityState;
  launch_missile: MissileState;
}

export class AA extends Entity<AAEvents> {
  private radarProps: AAProps["radarProps"];
  private missileProps: Omit<MissileProps, "id" | "startPosition">;
  private missileCount: number;
  private launched: Missile[] = [];
  private aimRay = new CANNON.Vec3(1, 1, 1);
  private detectedTargetIds: string[] = [];
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
    this.type = "aa";
    this.gameWorld = gameWorld;
    this.reloadTime = props.reloadTime;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    this.launched.forEach((missile) => {
      missile.aimRay = this.aimRay;
      missile.update(deltaTime);
    });
    this.updateRadar();
  }

  fire() {
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
        ...this.missileProps,
      },
      this.gameWorld
    );

    missile.eventEmitter.on("destroy", () => {
      this.launched = this.launched.filter(
        (missile) => missile.id !== missile.id
      );
    });

    this.eventEmitter.emit("launch_missile", missile.getState());

    this.launched.push(missile);
    this.gameWorld.addEntity(missile);
    this.missileCount--;
  }

  updateAimRay(aimRay: [number, number, number]) {
    this.aimRay = new CANNON.Vec3(aimRay[0], aimRay[1], aimRay[2]);
  }

  updateRadar() {
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
  }

  getState(): AAState {
    return {
      ...super.getState(),
      ammoCount: this.missileCount,
      aimRay: this.aimRay.toArray(),
      readyToFire: Date.now() - this.lastTimeFired > this.reloadTime * 1000,
      launchedMissileIds: this.launched.map((missile) => missile.id),
      detectedTargetIds: this.detectedTargetIds,
    };
  }
}
