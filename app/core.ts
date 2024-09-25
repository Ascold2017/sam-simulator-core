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
import { AA, type AAProps } from "./entities/AA";

// Константа для частоты обновления (40 раз в секунду)
const UPDATE_FREQUENCY = 1 / 40;

export interface CoreParams {
  heightmapTerrain: HeightmapTerrainProps;
  targetNPCs: TargetNPCParams[];
}

export interface CoreEventMap {
  update_world_state: EntityState[];
  kill_npc: TargetNPCState;
  destroy_npc: TargetNPCState;
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
        this.eventEmitter.emit("kill_npc", d)
      );
      npcEntity.eventEmitter.on("destroy", (d) =>
        this.eventEmitter.emit("destroy_npc", d)
      );
      this.gameWorld.addEntity(npcEntity);
    }
  }

  addAA(props: AAProps) {
    const aa = new AA(props, this.gameWorld);

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
}
