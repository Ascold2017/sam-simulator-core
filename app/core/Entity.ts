import * as CANNON from 'cannon';

class Entity {
  id: string
  body: CANNON.Body;

  constructor(id: string, body: CANNON.Body) {
    this.id = id;
    this.body = body;
  }

  update(deltaTime: number) {
    // Implement specific logic for entity update
  }
}

export default Entity;
