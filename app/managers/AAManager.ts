import { AAObject } from "../core/AAObject";
import Engine from "../core/Engine";
import WeaponManager from "./WeaponManager";

export default class AAManager {

    private engine: Engine;
    private weaponManager: WeaponManager;
    private capturedTargetIds: Set<string> = new Set()

    constructor(engine: Engine) {
        this.engine = engine;
        this.weaponManager = new WeaponManager(engine)
    }

    private getAAById(id: string) {
        return this.engine.getAAs().find(
            (entity) => entity.id === id,
        ) as AAObject;
    }

    private isWithinViewAngle(targetAzimuth: number, targetElevation: number, azimuth: number, elevation: number, viewAngle: number): boolean {
        // Проверяем, находится ли цель в пределах углового обзора
        const deltaAzimuth = Math.abs(targetAzimuth - azimuth);
        const deltaElevation = Math.abs(targetElevation - elevation);
        return deltaAzimuth <= viewAngle / 2 && deltaElevation <= viewAngle / 2;
    }

    captureFlightObjectOnDirection(aaId: string, azimuth: number, elevation: number) {
        const flightObjects = this.engine.getFlightObjects();
        const aa = this.getAAById(aaId);
        if (!aa) return;

        const viewAngle = Math.PI / 6;

        for (const flightObject of flightObjects) {
            const directionToTarget = {
                x: flightObject.body.position.x - aa.body.position.x,
                y: flightObject.body.position.y - aa.body.position.y,
                z: flightObject.body.position.z - aa.body.position.z,
            };

            const distance = Math.sqrt(
                directionToTarget.x ** 2 +
                directionToTarget.y ** 2 +
                directionToTarget.z ** 2
            );

            // Рассчитываем азимут и угол возвышения до цели
            const targetAzimuth = Math.atan2(directionToTarget.y, directionToTarget.x);
            const targetElevation = Math.asin(directionToTarget.z / distance);
            console.log(targetAzimuth, azimuth)
            if (this.isWithinViewAngle(targetAzimuth, targetElevation, azimuth, elevation, viewAngle)) {
                this.capturedTargetIds.add(flightObject.id);
                return true;
            }
        }
        return false
    }

    fire(aaId: string, azimuth: number, elevation: number) {
        const aa = this.getAAById(aaId);
        let targetId: string | null = null;

        for (const capturedId of this.capturedTargetIds) {
            const flightObject = this.engine.getFlightObjects().find(
                (obj) => obj.id === capturedId,
            );

            if (flightObject) {
                const directionToTarget = {
                    x: flightObject.body.position.x - aa.body.position.x,
                    y: flightObject.body.position.y - aa.body.position.y,
                    z: flightObject.body.position.z - aa.body.position.z,
                };

                const distance = Math.sqrt(
                    directionToTarget.x ** 2 +
                    directionToTarget.y ** 2 +
                    directionToTarget.z ** 2
                );

                // Рассчитываем азимут и угол возвышения до цели
                const targetAzimuth = Math.atan2(directionToTarget.y, directionToTarget.x);
                const targetElevation = Math.asin(directionToTarget.z / distance);

                if (this.isWithinViewAngle(targetAzimuth, targetElevation, azimuth, elevation, 0.01)) {
                    targetId = flightObject.id;
                    break;
                }
            }
        }

        if (targetId) {
            // Пример использования launchActiveMissile
            this.weaponManager.launchActiveMissile(targetId, aa.ammoVelocity, aa.body.position, aa.ammoMaxRange);
            return true;
        }

        return false

    }


}