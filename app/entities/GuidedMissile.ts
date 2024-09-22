import * as CANNON from "cannon-es";
import FlightObject, {
  FlightObjectEvents,
  FlightObjectState,
} from "./FlightObject";

export interface GuidedMissileProps {
  id: string;
  startPosition: { x: number; y: number; z: number };
  maxVelocity: number;
  minRange: number;
  maxRange: number;
  activeRange: number;
  killRadius: number;
  maxOverload: number;
}

export interface GuidedMissileState extends FlightObjectState {
  type: "guided-missile";
  distanceTraveled: number;
  exploded: boolean;
}

export interface GuidedMissileEvents extends FlightObjectEvents {
  destroy: GuidedMissileState;
  kill: GuidedMissileState;
  explode: GuidedMissileState;
}

export default class GuidedMissile extends FlightObject<GuidedMissileEvents> {
  private maxVelocity: number;
  private minRange: number;
  private maxRange: number;
  private activeRange: number;
  private maxOverload: number;
  private killRadius: number;
  private distanceTraveled: number = 0;
  private exploded: boolean = false;
  private fuseEnabled: boolean = false;
  aimRay = new CANNON.Vec3(0, 0, 0);

  constructor(props: GuidedMissileProps) {
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
    this.activeRange = props.activeRange;
    this.maxOverload = props.maxOverload;
    this.killRadius = props.killRadius;

    this.body.addEventListener("collide", (e: any) => this.onCollide(e));
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
    const aimRay = this.aimRay.clone();
    const velocity = this.body.velocity.clone();
    // Направление к цели (aimRay)
    const directionToAim = aimRay.vsub(this.body.position);
    directionToAim.normalize();

    const currentDirection = velocity;
    currentDirection.normalize();

    // Ограничение маневра максимальной перегрузкой (maxOverload)
    const steeringForce = directionToAim
      .vsub(currentDirection)
      .scale(this.maxOverload * deltaTime);
    this.body.velocity = this.body.velocity.vadd(steeringForce);

    // Ограничиваем скорость ракет максимальной скоростью
    if (this.body.velocity.length() > this.maxVelocity) {
      this.body.velocity.normalize();
      this.body.velocity.scale(this.maxVelocity);
    }
  }

  private onCollide(event: any) {
    if (!this.fuseEnabled) return; // Игнорируем столкновения до активации

    const targetBody = event.body; // Объект, с которым произошло столкновение

    console.log("Missile collided with:", targetBody);
    // Проверяем, если столкновение произошло с объектом типа FlightObject
    if (targetBody.userData && targetBody.userData instanceof FlightObject) {
      const target = targetBody.userData as FlightObject;

      // Проверяем радиус поражения
      const distanceToTarget = this.body.position.distanceTo(
        target.body.position
      );
      if (distanceToTarget <= this.killRadius) {
        target.kill(); // Уничтожаем цель
        this.explode(); // Взрываем ракету
      }
    }
  }

  // Взрыв ракеты
  private explode() {
    console.log(`Missile ${this.id} exploded!`);
    this.exploded = true;
    this.eventEmitter.emit("explode", this.getState());
    this.destroy(); // Вызов destroy для удаления ракеты
  }

  getState(): GuidedMissileState {
    return {
      ...super.getState(),
      type: "guided-missile",
      distanceTraveled: this.distanceTraveled,
      exploded: this.exploded,
    };
  }
}
