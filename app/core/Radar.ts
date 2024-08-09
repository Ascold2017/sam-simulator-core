import Entity from './Entity';
import * as CANNON from "cannon-es";
import FlightObject from './FlightObject';

class Radar extends Entity {
  protected minElevationAngle: number;
  protected maxElevationAngle: number;
  protected detectionRange: number;
  protected flightObjects: FlightObject[] = []
  isEnabled: boolean = false;

  constructor(id: string, body: CANNON.Body, minElevationAngle: number, maxElevationAngle: number, detectionRange: number) {
    super(id, body);
    this.minElevationAngle = minElevationAngle;
    this.maxElevationAngle = maxElevationAngle;
    this.detectionRange = detectionRange;
  }

  setFlightObjects(flightObjects: FlightObject[]) {
    this.flightObjects = flightObjects
  }

  protected scan(deltaTime: number) {
    // FOR OVERRIDE
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.scan(deltaTime)
  }
}

export default Radar;
