import * as CANNON from 'cannon';

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
    // Implement specific logic for entity update
  }

  destroy() {
    this.isDestroyed = true;
  }
}

export default Entity;
