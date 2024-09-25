import * as CANNON from "cannon-es";
import FlightObject, {
  FlightObjectEvents,
  FlightObjectState,
} from "./FlightObject";
import { World } from "./World";
export interface MissileProps {
  id: string;
  startPosition: { x: number; y: number; z: number };
  maxVelocity: number;
  minRange: number;
  maxRange: number;
  killRadius: number;
  maxOverload: number;
}

export interface MissileState extends FlightObjectState {
  exploded: boolean;
}

export interface MissileEvents extends FlightObjectEvents {
  destroy: MissileState;
  kill: MissileState;
  explode: MissileState;
}
// @ts-ignore
export default class Missile extends FlightObject<GuidedMissileEvents> {
  private maxVelocity: number;
  private minRange: number;
  private maxRange: number;
  private activeRange: number;
  private maxOverload: number;
  private killRadius: number;
  private distanceTraveled: number = 0;
  private exploded: boolean = false;
  private fuseEnabled: boolean = false;
  private startPosition: CANNON.Vec3;
  private gameWorld: World;
  aimRay = new CANNON.Vec3(0, 0, 0);

  constructor(props: MissileProps, gameWorld: World) {
    const body = new CANNON.Body({
      mass: 100,
      shape: new CANNON.Sphere(props.killRadius),
      position: new CANNON.Vec3(
        props.startPosition.x,
        props.startPosition.y,
        props.startPosition.z
      ),
      type: CANNON.Body.DYNAMIC,
    });

    body.collisionResponse = false;

    super(props.id, body, new CANNON.Vec3(0, 0, 0));

    this.maxVelocity = props.maxVelocity;
    this.minRange = props.minRange;
    this.maxRange = props.maxRange;
    this.activeRange = props.maxRange * 0.5;
    this.maxOverload = props.maxOverload;
    this.killRadius = props.killRadius;
    this.type = "missile";
   

    this.startPosition = new CANNON.Vec3(
      props.startPosition.x,
      props.startPosition.y,
      props.startPosition.z
    );
    this.gameWorld = gameWorld;
    this.body.addEventListener("collide", this.onCollide.bind(this));
  }

  update(deltaTime: number) {
    super.update(deltaTime);

    if (this.exploded || this.isDestroyed || this.isKilled) return;

    // Рассчитываем пройденное расстояние
    this.distanceTraveled += this.body.velocity.length() * deltaTime;

    // Активируем взрыватель
    if (!this.fuseEnabled && this.distanceTraveled >= this.minRange) {
      this.body.collisionResponse = true;
      this.fuseEnabled = true;
      console.log("Fuse activated for missile:", this.id);
    }

    // Проверяем, достигла ли ракета своей максимальной дальности
    if (this.distanceTraveled >= this.maxRange) {
      this.explode();
      return;
    }

    /// После активного участка ракета замедляется
    if (this.distanceTraveled >= this.activeRange) {
      this.body.velocity.scale(0.98); // Уменьшаем скорость
    }

    this.adjustTrajectory(deltaTime);
  }

  // Корректировка траектории полета ракеты
  private adjustTrajectory(deltaTime: number) {
    this.velocity = this.aimRay.scale(this.maxVelocity);
  }

  private onCollide(event: any) {
    super.onCollide(event);
    if (!this.fuseEnabled) return;

    const targetBody = event.body;

    // Проверяем, если столкновение произошло с объектом типа FlightObject
    if (targetBody.isFlightObject) {
      const target = this.gameWorld.getEntityById(
        targetBody.entityId
      ) as FlightObject;
      console.log("Missile collided with:", target.id);
      target.kill(); // Уничтожаем цель
      this.explode(); // Взрываем ракету
    }
  }

  // Взрыв ракеты
  private explode() {
    console.log(`Missile ${this.id} exploded!`);
    this.exploded = true;
    this.eventEmitter.emit("explode", this.getState());
    this.destroy(); // Вызов destroy для удаления ракеты
   
  }

   destroy() {
    super.destroy();
    this.body.removeEventListener('collide',  this.onCollide.bind(this));
  }

  getState(): MissileState {
    return {
      ...super.getState(),
      exploded: this.exploded,
    };
  }
}
