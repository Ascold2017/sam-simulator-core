import * as CANNON from 'cannon';
import { Vec3 } from 'cannon';
import { Logger } from './Logger';

export class FlightObject {
  public id: string;
  public currentPoint: Vec3;
  public currentVelocity: number;
  public rcs: number;
  public body: CANNON.Body;
  public isKilled: boolean;
  private waypoints: Array<{ x: number, y: number, z: number, v: number }>;
  private currentWaypointIndex: number;
  private logger: Logger;

  constructor(id: string, waypoints: Array<{ x: number, y: number, z: number, v: number }>, logger: Logger) {
    this.id = id;
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.isKilled = false;
    this.rcs = 1; // Радиолокационная заметность, например
    this.logger = logger;

    const initialPosition = new CANNON.Vec3(waypoints[0].x, waypoints[0].y, waypoints[0].z);
    this.currentPoint = initialPosition;
    this.currentVelocity = 0;

    this.body = new CANNON.Body({
      mass: 1,
      position: initialPosition,
      velocity: new CANNON.Vec3(0, 0, 0),
      shape: new CANNON.Sphere(1),
    });
  }

  update(deltaTime: number): boolean {
    if (this.isKilled) {
      this.applyGravity();
      if (this.body.position.z <= 0) {
        this.handleGroundCollision();
        this.logger.record('flightObjectGroundCollision', { id: this.id });
        return false;
      }
      this.updateCurrentState();
      return true;
    }

    if (this.hasReachedCurrentWaypoint(deltaTime)) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.waypoints.length) {
        // Объект достиг последнего waypoint и должен быть удален
        this.logger.record('flightObjectReachedLastWaypoint', { id: this.id });

        return false;
      }
    }

    this.moveTowardsCurrentWaypoint(deltaTime);
    this.updateCurrentState();

    return true;
  }

  private applyGravity() {
    const gravityForce = new CANNON.Vec3(0, 0, -9.82 * this.body.mass);
    this.body.applyForce(gravityForce, this.body.position);
  }

  private handleGroundCollision() {
    this.body.position.z = 0;
    this.body.velocity.set(0, 0, 0);
  }

  private hasReachedCurrentWaypoint(deltaTime: number): boolean {
    const waypoint = this.waypoints[this.currentWaypointIndex];
    const targetPosition = new CANNON.Vec3(waypoint.x, waypoint.y, waypoint.z);
    const distance = this.body.position.distanceTo(targetPosition);

    return distance < waypoint.v * deltaTime;
  }

  private moveTowardsCurrentWaypoint(deltaTime: number) {
    const waypoint = this.waypoints[this.currentWaypointIndex];
    const direction = new CANNON.Vec3(
      waypoint.x - this.body.position.x,
      waypoint.y - this.body.position.y,
      waypoint.z - this.body.position.z
    );
    direction.normalize();

    const speed = waypoint.v;
    this.body.velocity.set(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );
  }

  private updateCurrentState() {
    this.currentPoint.copy(this.body.position);
    this.currentVelocity = this.body.velocity.norm();
  }

  kill() {
    this.isKilled = true;
    this.logger.record('flightObjectKilled', { id: this.id });
  }
}
