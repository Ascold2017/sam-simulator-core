import { GUI } from 'dat.gui';
import { Core, Position } from '../app';

export class weaponGUIManager {
    private gui: GUI;
    private currentTargetId: string | null = null;
    private missileSpeed: number = 100;
    private launchPosition: Position = { x: 0, y: 0, z: 5 };

    constructor(private core: Core) {
        this.gui = new GUI();
        this.setupWeaponManagerGUI();
    }

    private setupWeaponManagerGUI() {
        const weaponFolder = this.gui.addFolder('Weapon Manager');

        // Параметры ракеты
        weaponFolder.add(this, 'missileSpeed', 50, 500).name('Missile Speed').step(10);

        // Параметры запуска ракеты
        const positionFolder = weaponFolder.addFolder('Launch Position');
        positionFolder.add(this.launchPosition, 'x', -1000, 1000).name('X Position').step(1);
        positionFolder.add(this.launchPosition, 'y', -1000, 1000).name('Y Position').step(1);
        positionFolder.add(this.launchPosition, 'z', 0, 500).name('Z Position').step(1);

        // Выбор цели
        const targets = this.core.getFlightObjects().map(obj => obj.id);
        weaponFolder.add(this, 'currentTargetId', targets).name('Select Target');

        // Кнопка для запуска ракеты
        weaponFolder.add(this, 'launchMissile').name('Launch Missile');

        weaponFolder.open();
    }

    private launchMissile() {
        if (this.currentTargetId) {
            this.core.weaponManager.launchActiveMissile(this.currentTargetId, this.missileSpeed, this.launchPosition);
        } else {
            console.warn('No target selected.');
        }
    }

    update() {
        // Здесь можно обновлять GUI, если потребуется динамическое обновление параметров
    }
}
