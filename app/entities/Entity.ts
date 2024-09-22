import * as CANNON from "cannon-es";
import TypedEmitter from "../utils/TypedEmitter";

export interface EntityEvents {
  destroy: EntityState; // Событие "destroy" с состоянием объекта
}

export interface EntityState {
  id: string;
  position:[number, number, number];
  quaternion: [number, number, number, number];
  isDestroyed: boolean;
  type: string;
}

class Entity<TEvents extends EntityEvents = EntityEvents> {
  id: string;
  body: CANNON.Body;
  isDestroyed: boolean;
  readonly eventEmitter = new TypedEmitter<TEvents>();;

  constructor(id: string, body: CANNON.Body) {
    this.id = id;
    this.body = body;
    this.isDestroyed = false;
  }

  update(deltaTime: number) {
    // FOR OVERRIDE
  }

  destroy() {
    this.isDestroyed = true;
    this.body.mass = 0;
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.sleep();

    const state = this.getState();
    this.eventEmitter.emit("destroy", state);
  }

  getState(): EntityState {
    return {
      id: this.id,
      position: this.body.position.toArray(),
      quaternion: this.body.quaternion.toArray(),
      isDestroyed: this.isDestroyed,
      type: "entity",
    };
  }
}

export default Entity;