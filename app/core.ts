import { World } from "./entities/World";
import HeightmapTerrain, {
  HeightmapTerrainProps,
} from "./entities/HeightmapTerrain";
import TargetNPC, {
  TargetNPCState,
  type TargetNPCParams,
} from "./entities/TargetNPC";
import TypedEmitter from "./utils/TypedEmitter";
import { EntityState } from "./entities/Entity";
import { AA, AAState, type AAProps } from "./entities/AA";
import { MissileState } from "./entities/Missile";

// Константа для частоты обновления (40 раз в секунду)
const UPDATE_FREQUENCY = 1 / 40;

export interface CoreParams {
  heightmapTerrain: HeightmapTerrainProps;
  targetNPCs: TargetNPCParams[];
}

export interface CoreEventMap {
  update_world_state: EntityState[];
  target_killed: TargetNPCState;
  target_destroyed: TargetNPCState;
  target_captured: AAState;
  target_resetted: AAState;
  missile_launched: MissileState;
  missile_overloaded: MissileState;
  missile_over_distance: MissileState;
}
export class Core {
  readonly eventEmitter = new TypedEmitter<CoreEventMap>();
  private gameWorld: World;
  private lastUpdateTime: number = Date.now();

  constructor(params: CoreParams) {
    this.gameWorld = new World();
    this.initEntities(params);
    setInterval(() => this.update(), UPDATE_FREQUENCY * 1000);
  }

  private update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    if (deltaTime >= UPDATE_FREQUENCY) {
      this.lastUpdateTime = now;
      this.gameWorld.updateWorld(deltaTime);
      this.eventEmitter.emit("update_world_state", this.getWorldState());
    }
  }

  getWorldState() {
    return this.gameWorld.getState();
  }

  private initEntities(params: CoreParams) {
    // ## TERRAIN ##
    const terrain = new HeightmapTerrain(params.heightmapTerrain);
    this.gameWorld.addEntity(terrain);

    // ## NPCs ##
    for (const npc of params.targetNPCs) {
      const npcEntity = new TargetNPC(npc);
      npcEntity.eventEmitter.on("kill", (d) =>
        this.eventEmitter.emit("target_killed", d)
      );
      npcEntity.eventEmitter.on("destroy", (d) =>
        this.eventEmitter.emit("target_destroyed", d)
      );
      this.gameWorld.addEntity(npcEntity);
    }
  }

  addAA(props: AAProps) {
    const aa = new AA(props, this.gameWorld);
    aa.eventEmitter.on("launch_missile", (MissileState) => {
      this.eventEmitter.emit("missile_launched", MissileState);
    });

    aa.eventEmitter.on("target_captured", (AAState) => {
      this.eventEmitter.emit("target_captured", AAState);
    });

    aa.eventEmitter.on("target_resetted", (AAState) => {
      this.eventEmitter.emit("target_resetted", AAState);
    });

    aa.eventEmitter.on("missile_overloaded", (MissileState) => {
      this.eventEmitter.emit("missile_overloaded", MissileState);
    });

    aa.eventEmitter.on("missile_over_distance", (MissileState) => {
      this.eventEmitter.emit("missile_over_distance", MissileState);
    });

    this.gameWorld.addEntity(aa);
  }

  removeAA(aaId: string) {
    this.gameWorld.removeEntity(aaId);
  }

  collisionTest() {
    this.gameWorld.addCollisionTest();
  }

  updateAAAimRay(aaId: string, aimRay: [number, number, number]) {
    const aa = this.gameWorld.getEntityById(aaId) as AA;
    aa?.updateAimRay(aimRay);
  }

  fireAA(aaId: string) {
    const aa = this.gameWorld.getEntityById(aaId) as AA;
    aa?.fire();
  }

  captureTarget(aaId: string) {
    const aa = this.gameWorld.getEntityById(aaId) as AA;
    aa?.captureTarget();
  }

  resetTarget(aaId: string) {
    const aa = this.gameWorld.getEntityById(aaId) as AA;
    aa?.resetTarget();
  }
}
