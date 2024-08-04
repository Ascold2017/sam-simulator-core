import * as CANNON from 'cannon';
import { FlightObject } from './FlightObject';

export class PhysicsEngine {
  private world: CANNON.World;
  private objects: FlightObject[];

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -9.82); // Устанавливаем стандартную гравитацию
    this.objects = [];
  }

  addObject(object: FlightObject) {
    this.world.addBody(object.body);
    this.objects.push(object);
  }

  update(deltaTime: number) {
    this.objects = this.objects.filter(obj => obj.update(deltaTime)); // Обновляем объекты и удаляем достигшие земли
    this.world.step(deltaTime);
  }

  getObjects(): FlightObject[] {
    return this.objects;
  }
}
