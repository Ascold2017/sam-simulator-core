import Entity, { EntityState, type EntityEvents } from "./Entity";
import * as CANNON from "cannon-es";

export interface FlightObjectState extends EntityState {
  velocity: [number, number, number];
  isKilled: boolean;
}

export interface FlightObjectEvents extends EntityEvents {
  kill: FlightObjectState;
  destroy: FlightObjectState;
}

class FlightObject<
  TEvents extends FlightObjectEvents = FlightObjectEvents
> extends Entity<TEvents> {
  velocity: CANNON.Vec3;
  isKilled: boolean;
  private previousVelocity: CANNON.Vec3 = new CANNON.Vec3(); // Предыдущая скорость
  overload: number = 0;

  constructor(
    id: string,
    body: CANNON.Body,
    velocity: CANNON.Vec3,
    entityId?: number
  ) {
    // @ts-ignore
    body.isFlightObject = true;
    super(id, body, entityId);
    this.velocity = velocity;
    this.isKilled = false;
    this.type = "flight-object";
    this.body.addEventListener("collide", (e: any) => this.onCollide(e));
  }

  update(deltaTime: number) {
    super.update(deltaTime);

    // Вычисляем ускорение: (текущая скорость - предыдущая скорость) / deltaTime
    const currentVelocity = this.velocity.clone();
    const acceleration = currentVelocity.vsub(this.previousVelocity);
    this.overload = acceleration.length() / 9.81;

    // Сохраняем текущую скорость как предыдущую для следующего кадра
    this.previousVelocity.copy(currentVelocity);

    if (this.isKilled) {
      // Применяем гравитацию
      const gravityCompensation = new CANNON.Vec3(0, -this.body.mass * 9.81, 0);
      this.body.applyForce(gravityCompensation, this.body.position);
    } else {
      this.body.velocity = this.velocity;
    }

    if (this.body.position.y <= 0) {
      this.destroy();
    }
    this.updateRotationAccordingToVelocity();
  }

  kill() {
    this.isKilled = true;
    this.eventEmitter.emit("kill", this.getState());
  }

  protected onCollide(e: any) {
    const targetBody = e.body; // объект, с которым произошло столкновение
    if (targetBody && targetBody.shapes.length > 0) {
      // Проверяем, является ли объект землей (Heightfield)
      const isHeightfield = targetBody.shapes.some(
        (shape: any) => shape instanceof CANNON.Heightfield
      );

      if (isHeightfield) {
        console.log("FlightObject collided with the ground:", this.id);
        this.destroy();
        return;
      }
    }
  }

  private updateRotationAccordingToVelocity() {
    const forward = new CANNON.Vec3(1, 0, 0); // Вектор, обозначающий ось "вперёд" для объекта
    const velocityDirection = this.velocity.clone();
    velocityDirection.normalize(); // Нормализованный вектор скорости

    // Вычисление косинуса угла между "forward" и направлением скорости
    const cosTheta = forward.dot(velocityDirection); // Скалярное произведение
    // Вычисление угла между осью "вперёд" и направлением скорости
    const angle = Math.acos(cosTheta);

    if (angle > 0) {
      // Вычисляем ось поворота (перпендикуляр между forward и velocityDirection)
      const axis = forward.cross(velocityDirection);
      axis.normalize();

      // Создаём кватернион, представляющий поворот вокруг оси
      const quaternion = new CANNON.Quaternion();
      quaternion.setFromAxisAngle(axis, angle);

      // Применяем этот кватернион к телу
      this.body.quaternion = quaternion;
    }
  }

  destroy(): void {
    super.destroy();
    this.velocity = new CANNON.Vec3(0, 0, 0);
    this.body.removeEventListener("collide", this.onCollide.bind(this));
  }

  getState(): FlightObjectState {
    return {
      ...super.getState(),
      velocity: this.body.velocity.toArray(),
      isKilled: this.isKilled,
    };
  }
}

export default FlightObject;
