import { AAObject } from "../core/AAObject";
import Engine from "../core/Engine";
import WeaponManager from "./WeaponManager";

export default class AAManager {

    private engine: Engine;
    private weaponManager: WeaponManager;

    constructor(engine: Engine) {
        this.engine = engine;
        this.weaponManager = new WeaponManager(engine)
    }

    private getAAById(id: string) {
        return this.engine.getAAs().find(
            (entity) => entity.id === id,
        ) as AAObject;
    }

    captureFlightObjectOnDirection(aaId: string, azimuth: number, elevation: number) {

    }

    fire(aaId: string, azimuth: number, elevation: number) {}


}