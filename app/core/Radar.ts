import Entity from "./Entity";
import * as CANNON from "cannon-es";
import FlightObject from "./FlightObject";
import { Position } from "../types";

export interface RadarConstructor {
  id: string;
  position: Position;
  minElevationAngle: number;
  maxElevationAngle: number;
  detectionRange: number;
}
class Radar extends Entity {
  protected minElevationAngle: number;
  protected maxElevationAngle: number;
  protected detectionRange: number;
  protected flightObjects: FlightObject[] = [];
  isEnabled: boolean = false;

  constructor(
    { id, position, minElevationAngle, maxElevationAngle, detectionRange }:
      RadarConstructor,
  ) {
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    super(id, body);
    this.minElevationAngle = minElevationAngle;
    this.maxElevationAngle = maxElevationAngle;
    this.detectionRange = detectionRange;
  }

  setFlightObjects(flightObjects: FlightObject[]) {
    this.flightObjects = flightObjects;
  }

  protected scan(deltaTime: number) {
    // FOR OVERRIDE
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
    this.scan(deltaTime);
  }
}

export default Radar;
