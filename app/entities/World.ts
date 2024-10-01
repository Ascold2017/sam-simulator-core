import * as CANNON from "cannon-es";
import Entity from "./Entity";
import SphereEntity from "./Sphere";

export class World {
  private cannonWorld: CANNON.World;
  private entities: Entity[] = [];

  constructor() {
    this.cannonWorld = new CANNON.World();
  }

  getState() {
    return this.entities.map((entity) => entity.getState());
  }

  getEntityById(id: string) {
    return this.entities.find((entity) => entity.id === id);
  }

  getEntitiesByType(type: string) {
    return this.entities.filter((entity) => entity.type === type && !entity.isDestroyed);
  }

  updateWorld(deltaTime: number) {
    this.cannonWorld.step(deltaTime);
    for (const entity of this.entities.filter(e => !e.isDestroyed)) {
      entity.update(deltaTime);
    }
  }

  addEntity(entity: Entity<any>) {
    this.entities.push(entity);
    this.cannonWorld.addBody(entity.body);
  }

  removeEntity(entityId: string) {
    const entity = this.entities.find((entity) => entity.id === entityId);
    if (entity) {
      this.cannonWorld.removeBody(entity.body);
      this.entities = this.entities.filter((entity) => entity.id !== entityId);
    }
  }

  addCollisionTest() {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const x = i * 400 - 4000;
        const z = j * 400 - 4000;
        const y = 1000; // Высота над террейном
        const position = new CANNON.Vec3(x, y, z);

        // Создаём сферу и добавляем её в мир
        const sphere = new SphereEntity(position);
        this.addEntity(sphere);
      }
    }
  }
}


