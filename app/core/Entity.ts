import * as CANNON from "cannon-es";

class Entity {
  id: string
  body: CANNON.Body;
  isDestroyed: boolean;

  constructor(id: string, body: CANNON.Body) {
    this.id = id;
    this.body = body;
    this.isDestroyed = false;
  }

  update(deltaTime: number) {
    // FOR OVERRIDE
  }

  destroy() {
    // Mark as destroyed. Engine will remove this entity at nearby update
    this.isDestroyed = true;
  }
}

export default Entity;
