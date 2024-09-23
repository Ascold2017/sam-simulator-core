import * as CANNON from "cannon-es";
import FlightObject, { FlightObjectState, type FlightObjectEvents } from "./FlightObject";

export interface TargetNPCParams {
  id: string;
  rcs: number;
  temperature: number;
  size: number;
  waypoints: {
    speed: number;
    position: { x: number; y: number; z: number };
  }[];
}

export interface TargetNPCEvents extends FlightObjectEvents {
  kill: TargetNPCState;
  destroy: TargetNPCState;
}

export interface TargetNPCState extends FlightObjectState {
  type: "target-npc";
  rcs: number;
  temperature: number;
  size: number;
}

export default class TargetNPC extends FlightObject<TargetNPCEvents> {
  private waypoints: TargetNPCParams["waypoints"];
  private rcs: number;
  private temperature: number;
  private size: number;
  private currentWaypointIndex: number = 0;
  private reachedEnd: boolean = false;

  constructor(props: TargetNPCParams) {
    super(props.id, TargetNPC.getBody(props), new CANNON.Vec3(0, 0, 0));

    this.waypoints = props.waypoints;
    this.rcs = props.rcs;
    this.temperature = props.temperature;
    this.size = props.size;

    // Устанавливаем начальный вектор скорости
    this.updateVelocity();
  }

  private static getBody(props: TargetNPCParams) {
    const initialPosition = props.waypoints[0].position;

    const body =  new CANNON.Body({
      mass: 5000,
      shape: new CANNON.Sphere(props.size),
      position: new CANNON.Vec3(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z
      ),
      type: CANNON.Body.DYNAMIC,
    });

    // @ts-ignore
    body.isTargetNPC = true;
    return body;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    if (this.reachedEnd || this.isKilled || this.isDestroyed) return;

    // Проверяем, достигнута ли текущая точка
    const currentWaypoint = this.waypoints[this.currentWaypointIndex];
    const nextWaypoint = this.waypoints[this.currentWaypointIndex + 1];
    const distanceToWaypoint = this.body.position.distanceTo(
      new CANNON.Vec3(
        nextWaypoint.position.x,
        nextWaypoint.position.y,
        nextWaypoint.position.z
      )
    );
    // Если достигли точки, переходим к следующей
    if (distanceToWaypoint < currentWaypoint.speed) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.waypoints.length - 1) {
        this.reachedEnd = true;
        return; // Достигли конца маршрута
      }

      this.updateVelocity(); // Обновляем вектор скорости для следующей точки
    }
  }

  private updateVelocity() {
    const currentWaypoint = this.waypoints[this.currentWaypointIndex];
    const nextWaypoint = this.waypoints[this.currentWaypointIndex + 1];

    if (!nextWaypoint) return;

    // Вычисляем направление к следующей точке
    const direction = new CANNON.Vec3(
      nextWaypoint.position.x - currentWaypoint.position.x,
      nextWaypoint.position.y - currentWaypoint.position.y,
      nextWaypoint.position.z - currentWaypoint.position.z
    );

    direction.normalize();

    // Устанавливаем скорость, основанную на направлении и заданной скорости
    const speed = currentWaypoint.speed;
    this.velocity.set(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );
  }

  getState(): TargetNPCState {
    return {
      ...super.getState(),
      type: "target-npc",
      rcs: this.rcs,
      temperature: this.temperature,
      size: this.size,
    };
  }
}
