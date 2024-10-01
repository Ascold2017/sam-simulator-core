import * as CANNON from "cannon-es";
import FlightObject, {
  FlightObjectEvents,
  FlightObjectState,
} from "./FlightObject";
import { World } from "./World";

export type MissileGuidanceMethod = "default" | "3p" | "1/2";
export interface MissileProps {
  id: string;
  startPosition: { x: number; y: number; z: number };
  maxVelocity: number;
  minRange: number;
  maxRange: number;
  killRadius: number;
  maxOverload: number;
  targetId: string;
  guidanceMethod: MissileGuidanceMethod;
}

export interface MissileState extends FlightObjectState {
  exploded: boolean;
  guidanceMethod: MissileGuidanceMethod;
  isActiveRange: boolean;
}

export interface MissileEvents extends FlightObjectEvents {
  destroy: MissileState;
  kill: MissileState;
  explode: MissileState;
  target_lost: MissileState;
  overloaded: MissileState;
  over_distance: MissileState;
}
// @ts-ignore
export default class Missile extends FlightObject<MissileEvents> {
  private maxVelocity: number;
  private minRange: number;
  private maxRange: number;
  private activeRange: number;
  private maxOverload: number;
  private killRadius: number;
  private distanceTraveled: number = 0;
  private exploded: boolean = false;
  private fuseEnabled: boolean = false;
  private isActiveRange: boolean = true;
  private startPosition: CANNON.Vec3;
  private gameWorld: World;
  private targetId: string;
  private guidanceMethod: MissileGuidanceMethod;
  private accelearation = 1;

  constructor(props: MissileProps, gameWorld: World) {
    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(props.killRadius),
      material: new CANNON.Material({
        restitution: 0,
        friction: 1,
      }),
      position: new CANNON.Vec3(
        props.startPosition.x,
        props.startPosition.y,
        props.startPosition.z
      ),
      type: CANNON.Body.DYNAMIC,
    });

    body.collisionResponse = false;

    super(props.id, body, new CANNON.Vec3(0, 0, 0));

    this.targetId = props.targetId;
    this.maxVelocity = props.maxVelocity;
    this.minRange = props.minRange;
    this.maxRange = props.maxRange;
    this.activeRange = props.maxRange * 0.5;
    this.maxOverload = props.maxOverload;
    this.killRadius = props.killRadius;
    this.type = "missile";
    this.guidanceMethod = props.guidanceMethod;

    this.startPosition = new CANNON.Vec3(
      props.startPosition.x,
      props.startPosition.y,
      props.startPosition.z
    );
    this.gameWorld = gameWorld;
  }

  update(deltaTime: number) {
    super.update(deltaTime);

    if (this.exploded || this.isDestroyed || this.isKilled) return;

    const target = this.gameWorld.getEntityById(this.targetId) as FlightObject;

    if (!target) {
      console.log(`Missile ${this.id} lost target!`);
      this.eventEmitter.emit('target_lost', this.getState());
      this.explode();
      return;
    }
    if (this.fuseEnabled && this.overload >= this.maxOverload) {
      console.log(`Missile ${this.id} overloaded!`);
      this.eventEmitter.emit('overloaded', this.getState());
      this.explode();
      return;
    }

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
      console.log(`Missile ${this.id} out of range!`);
      this.explode();
      this.eventEmitter.emit('over_distance', this.getState());
      return;
    }

    /// После активного участка ракета замедляется
    if (this.distanceTraveled >= this.activeRange) {
      this.isActiveRange = false;
      this.accelearation *= 0.9999;
    }

    this.adjustTrajectory(target);
  }

  // Корректировка траектории полета ракеты
  private adjustTrajectory(target: FlightObject) {
    const directionToTarget = target.body.position.vsub(this.body.position);
    directionToTarget.normalize();
    this.velocity = directionToTarget.scale(this.maxVelocity * this.accelearation);
  }

  private onCollide(event: any) {
    if (!this.fuseEnabled) return;
    super.onCollide(event);
    
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

  getState(): MissileState {
    return {
      ...super.getState(),
      exploded: this.exploded,
      guidanceMethod: this.guidanceMethod,
      isActiveRange: this.isActiveRange,
    };
  }
}
