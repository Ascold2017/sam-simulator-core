import Entity, { EntityEvents, EntityState } from "./Entity";
import * as CANNON from "cannon-es";
import GuidedMissile, { GuidedMissileProps, GuidedMissileState } from "./GuidedMissile";
import { World } from "./World";

export interface AAProps {
  id: string;
  position: { x: number; y: number; z: number };
  radarProps: {};
  type: 'guided-missile';
  ammoCount: number;
  ammoProps: Omit<GuidedMissileProps, 'id' | 'startPosition'>;
}

export interface AAState extends EntityState {
  type: "aa";
  ammoCount: number;
  aimRay: [number, number, number];
}

export interface AAEvents extends EntityEvents {
  destroy: EntityState;
  launch_missile: GuidedMissileState;
}

export class AA extends Entity<AAEvents> {
  private radarProps: {};
  private type: 'guided-missile';
  private ammoProps: Omit<GuidedMissileProps, 'id' | 'startPosition'>;
  private ammoCount: number;
  private launched: GuidedMissile[] = [];
  private aimRay = new CANNON.Vec3(0, 0, 0);
  private gameWorld: World;

  constructor(props: AAProps, gameWorld: World) {
    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(10),
      position: new CANNON.Vec3(
        props.position.x,
        props.position.y,
        props.position.z
      ),
    });

    super(props.id, body);

    this.radarProps = props.radarProps;
    this.type = props.type;
    this.ammoProps = props.ammoProps;
    this.ammoCount = props.ammoCount;
    this.gameWorld = gameWorld;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    this.launched.forEach((missile) => {
      missile.aimRay = this.aimRay;
      missile.update(deltaTime);
    });
  }

  fire() {
    if (!this.body.world || this.ammoCount <= 0) return;
    const missile = new GuidedMissile({
      id: `${this.id}-missile-${this.launched.length + 1}`,
      startPosition: {
        x: this.body.position.x,
        y: this.body.position.y,
        z: this.body.position.z,
      },
      ...this.ammoProps,
    });

    missile.eventEmitter.on("destroy", () => {
      this.launched = this.launched.filter((missile) => missile.id !== missile.id);
    });

    this.eventEmitter.emit("launch_missile", missile.getState())

    this.launched.push(missile);
    this.gameWorld.addEntity(missile);
    this.ammoCount--;
  }

  updateAimRay(aimRay: [number, number, number]) {
    this.aimRay = new CANNON.Vec3(aimRay[0], aimRay[1], aimRay[2]);
  }

  getState(): AAState {
    return {
      ...super.getState(),
      type: "aa",
      ammoCount: this.ammoCount,
      aimRay: this.aimRay.toArray(),
    };
  }
}
