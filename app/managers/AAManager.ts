import Engine from "../core/Engine";
import { AAData } from "../types";
import WeaponManager from "./WeaponManager";
import * as CANNON from "cannon-es";

export interface CapturedTarget {
    aaId: string;
    targetId: string;
}

export interface AAObject {
    id: string;
    position: CANNON.Vec3,
    type: 'active-missile' | 'gun',
    ammoVelocity: number;
    ammoMaxRange: number;
    viewAngle: number;
}

export default class AAManager {

    private engine: Engine;
    private weaponManager: WeaponManager;
    aas: AAObject[] = []
    capturedTargetIds: CapturedTarget[] = []; // Массив объектов с идентификаторами AA и целей

    constructor(engine: Engine) {
        this.engine = engine;
        this.weaponManager = new WeaponManager(engine)
    }

    public addAA(aaObject: AAData) {
        this.aas.push({
            ...aaObject,
            type: aaObject.type as 'active-missile' | 'gun',
            position: new CANNON.Vec3(aaObject.position.x, aaObject.position.y, aaObject.position.z)
        })
    }

    public removeAA(aaId: string) {
        this.aas = this.aas.filter(aa => aa.id !== aaId);
    }

    private getAAById(id: string) {
        return this.aas.find(aa => aa.id === id) as AAObject;
    }

    private calculateViewDirection(azimuth: number, elevation: number): CANNON.Vec3 {
        // Создаем вектор направления по умолчанию (направленный вдоль оси Z)
        const direction = new CANNON.Vec3(0, 0, 1);

        // Поворот по азимуту (вокруг оси Y)
        const quaternionAzimuth = new CANNON.Quaternion();
        quaternionAzimuth.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), azimuth);

        // Поворот по углу возвышения (вокруг оси X)
        const quaternionElevation = new CANNON.Quaternion();
        quaternionElevation.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), elevation);

        // Применяем сначала азимут, затем возвышение
        quaternionAzimuth.mult(quaternionElevation).vmult(direction, direction);

        direction.normalize();
        return direction
    }

    private calculateAngleBetweenVectors(v1: CANNON.Vec3, v2: CANNON.Vec3): number {
        const dotProduct = v1.dot(v2);
        const magnitudeV1 = v1.length();
        const magnitudeV2 = v2.length();
        const cosAngle = dotProduct / (magnitudeV1 * magnitudeV2);
        return Math.acos(cosAngle) - Math.PI;
    }

    captureFlightObjectOnDirection(aaId: string, azimuth: number, elevation: number): boolean {
        const aa = this.getAAById(aaId);
        if (!aa) return false;

        const flightObjects = this.engine.getFlightObjects();
        const viewDirection = this.calculateViewDirection(azimuth, elevation);

        for (const flightObject of flightObjects) {
            if (flightObject.isDestroyed) continue; // Пропускаем уничтоженные объекты

            const directionToTarget = flightObject.body.position.vsub(aa.position)
            directionToTarget.normalize();
            const angleBetween = this.calculateAngleBetweenVectors(viewDirection, directionToTarget);
            // Проверка: если угол меньше половины угла обзора, цель захвачена
            if (Math.abs(angleBetween) < aa.viewAngle / 2) {
                // Добавляем объект в массив захваченных целей
                this.capturedTargetIds.push({ aaId, targetId: flightObject.id });
                return true;
            }
        }

        return false;
    }
    fire(aaId: string, azimuth: number, elevation: number) {
        const aa = this.getAAById(aaId);
        if (!aa) return false;

        const viewDirection = this.calculateViewDirection(azimuth, elevation);

        let closestTarget: { targetId: string, angle: number } | null = null;

        this.capturedTargetIds.forEach((entry) => {
            if (entry.aaId !== aaId) return;

            const flightObject = this.engine.getFlightObjects().find(
                (obj) => obj.id === entry.targetId
            );

            if (!flightObject || flightObject.isDestroyed) return;

            const directionToTarget = flightObject.body.position.vsub(aa.position)
            directionToTarget.normalize();
            const angleBetween = this.calculateAngleBetweenVectors(viewDirection, directionToTarget);

            if (Math.abs(angleBetween) < aa.viewAngle / 2) {
                if (!closestTarget || angleBetween < closestTarget.angle) {
                    closestTarget = { targetId: entry.targetId, angle: angleBetween };
                }
            }
        });

        if (closestTarget) {
            // @ts-ignore
            this.weaponManager.launchActiveMissile(closestTarget.targetId, aa.ammoVelocity, aa.position, aa.ammoMaxRange);
            return true;
        }
    }


    reset() {
        this.capturedTargetIds = []
        this.aas = []
    }

}