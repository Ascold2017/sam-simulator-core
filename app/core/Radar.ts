import Entity from "./Entity";
import * as CANNON from "cannon-es";
import FlightObject from "./FlightObject";
import { Position } from "../types";
import HeightmapTerrain from "./HeightmapTerrain";
import RadarObject from "../radars/RadarObject";

export interface RadarConstructor {
  id: string;
  position: Position;
  minElevationAngle: number;
  maxElevationAngle: number;
  detectionRange: number;
  heightmapTerrain: HeightmapTerrain
}
class Radar extends Entity {
  minElevationAngle: number;
  maxElevationAngle: number;
  detectionRange: number;
  protected flightObjects: FlightObject[] = [];
  private ground: HeightmapTerrain;
  isEnabled: boolean = false;
  protected detectedFlightObjects: RadarObject[];

  constructor(
    { id, position, minElevationAngle, maxElevationAngle, detectionRange, heightmapTerrain }:
      RadarConstructor,
  ) {
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    super(id, body);
    this.ground = heightmapTerrain;
    this.minElevationAngle = minElevationAngle;
    this.maxElevationAngle = maxElevationAngle;
    this.detectionRange = detectionRange;
    this.detectedFlightObjects = []
  }

  setFlightObjects(flightObjects: FlightObject[]) {
    // Фильтрация объектов по дальности и проверка на прямую видимость
    this.flightObjects = flightObjects.filter((flightObject) => {
      const distance = this.calculateDistance(flightObject);

      if (distance > this.detectionRange) {
        return false; // Объект вне диапазона обнаружения
      }

      // Проверка прямой видимости
      return this.hasLineOfSight(flightObject);
    });
  }

  protected scan(deltaTime: number) {
    // FOR OVERRIDE
  }

  getState() {
    return {
      detectedFlightObjects: this.detectedFlightObjects
    }
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
    this.scan(deltaTime);
  }

  // Метод для вычисления расстояния до объекта
  private calculateDistance(flightObject: FlightObject): number {
    const radarPosition = this.body.position;
    const objectPosition = flightObject.body.position;

    return radarPosition.distanceTo(objectPosition);
  }

  // Метод для проверки прямой видимости объекта
  private hasLineOfSight(flightObject: FlightObject): boolean {
    const from = this.body.position;
    const to = flightObject.body.position;

    // Выполняем трассировку
    const result = new CANNON.RaycastResult();
    const ray = new CANNON.Ray(from, to);

    // Проверяем, пересекает ли луч какие-либо объекты на пути к цели
    ray.intersectBodies(this.getAllPotentialObstacles(), result);

    // Если результат трассировки показывает пересечение, значит видимость закрыта
    return !result.hasHit;
  }

  // Метод для получения всех потенциальных препятствий
  private getAllPotentialObstacles(): CANNON.Body[] {
    return [this.ground.body];
  }
}

export default Radar;
