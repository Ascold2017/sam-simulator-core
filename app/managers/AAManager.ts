import Engine from "../core/Engine";
import { AAData, Position } from "../types";
import WeaponManager from "./WeaponManager";
import * as CANNON from "cannon-es";


export interface AAObject {
    id: string;
    position: CANNON.Vec3,
    type: 'missile' | 'gun',
    ammoVelocity: number;
    ammoMaxRange: number;
    captureAngle: number;
    channelId: string;
}

export default class AAManager {

    private engine: Engine;
    private weaponManager: WeaponManager;
    aas: AAObject[] = []

    constructor(engine: Engine) {
        this.engine = engine;
        this.weaponManager = new WeaponManager(engine)
    }

    public addAA(aaObject: AAData) {
        const weaponChannelId = this.weaponManager.createWeaponChannel({
            position: aaObject.position,
            captureAngle: aaObject.captureAngle,
            weaponParams: {
                maxRange: aaObject.ammoMaxRange,
                speed: aaObject.ammoVelocity,
                killRadius: aaObject.ammoKillRadius
            }
        })
        this.aas.push({
            ...aaObject,
            type: aaObject.type as 'missile' | 'gun',
            position: new CANNON.Vec3(aaObject.position.x, aaObject.position.y, aaObject.position.z),
            channelId: weaponChannelId
        })
        
    }

    public removeAA(aaId: string) {
        this.aas = this.aas.filter(aa => aa.id !== aaId);
    }

    private getAAById(id: string) {
        return this.aas.find(aa => aa.id === id) as AAObject;
    }

    updateAADirection(aaId: string, direction: Position) {
        const aa = this.getAAById(aaId);
        if (!aa) return false;
        this.weaponManager.updateWeaponChannel(aa.channelId, direction);
        return true
    }

    fire(aaId: string) {
        const aa = this.getAAById(aaId);
        if (!aa) return false;

        this.weaponManager.launchMissile(aa.channelId);
        return true
    }


    reset() {
        this.aas = []
    }

}