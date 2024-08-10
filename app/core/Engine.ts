import * as CANNON from "cannon-es";
import Entity from "./Entity";
import FlightObject from "./FlightObject";
import Radar from "./Radar";
import Camera from "./Camera";
import HeightmapTerrain from "./HeightmapTerrain";

// Константа для частоты обновления (40 раз в секунду)
const UPDATE_FREQUENCY = 1 / 40;

class Engine {
  private world: CANNON.World;
  private entities: Entity[] = [];
  private eventListeners: { [key: string]: Function[] } = {};
  private lastUpdateTime: number = Date.now();
  private isRunning: boolean = false;
  timeScale: number = 1; // Начальное значение timeScale

  constructor() {
    this.world = new CANNON.World();
  }

  getEntities() {
    return this.entities;
  }

  getFlightObjects() {
    return this.entities.filter((e) => e instanceof FlightObject);
  }

  getRadars() {
    return this.entities.filter((e) => e instanceof Radar);
  }

  getCameras() {
    return this.entities.filter((e) => e instanceof Camera);
  }

  getHeightmapTerrain() {
    return this.entities.find(e => e instanceof HeightmapTerrain);
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
    this.world.addBody(entity.body);
  }

  removeEntity(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
      this.world.removeBody(entity.body);
    }
  }

  update(deltaTime: number) {
    this.world.step(deltaTime * this.timeScale);
    this.entities = this.entities.filter((e) => !e.isDestroyed);
    for (const entity of this.entities) {
      entity.update(deltaTime * this.timeScale);
    }
    this.dispatchEvent("update", deltaTime * this.timeScale);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.run();
    }
  }

  stop() {
    this.isRunning = false;
  }

  setTimeScale(scale: number) {
    this.timeScale = scale;
  }

  private run() {
    if (!this.isRunning) return;

    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    if (deltaTime >= UPDATE_FREQUENCY) {
      this.update(deltaTime);
      this.lastUpdateTime = now;
    }

    setTimeout(() => this.run(), UPDATE_FREQUENCY * 1000);
  }

  addEventListener(event: string, listener: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  dispatchEvent(event: string, data?: any) {
    const listeners = this.eventListeners[event];
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }
}

export default Engine;
