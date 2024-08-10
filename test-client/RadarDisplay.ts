import * as THREE from "three";
import SearchRadar from "../app/radars/SearchRadar";
import { Camera } from "three";

export class RadarDisplay {
    private display: THREE.Mesh;
    private overlay: THREE.Mesh;
    private context: CanvasRenderingContext2D;

    constructor(
        private radar: SearchRadar,
        private scene: THREE.Scene,
        private camera: Camera,
    ) {
        this.display = this.createDisplay();
        this.context = this.createRadarCanvas();
        this.overlay = this.createOverlay();

        this.scene.add(this.display);
        this.scene.add(this.overlay);
    }

    update() {
        // Обновление положения дисплея и его наложения
        this.display.lookAt(this.camera.position);
        this.overlay.lookAt(this.camera.position);

        // Обновление целей на дисплее
        this.updateRadarOverlay();
    }

    private createDisplay(): THREE.Mesh {
        const displaySize = 100; // Размер дисплея
        const displayGeometry = new THREE.PlaneGeometry(displaySize, displaySize);
        const displayMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Черный фон

        const display = new THREE.Mesh(displayGeometry, displayMaterial);

        // Позиционирование дисплея
        display.position.set(0, 0, 50); // Примерное положение
        display.lookAt(this.camera.position); // Направляем дисплей в камеру

        return display;
    }

    private createRadarCanvas(): CanvasRenderingContext2D {
        const size = 256; // Размер canvas
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");

        if (context) {
            this.drawRadarGrid(context, size);
            this.drawAzimuthLabels(context, size);
        }

        return context as CanvasRenderingContext2D;
    }

    private drawRadarGrid(context: CanvasRenderingContext2D, size: number) {
        const maxDistance = this.radar.detectionRange;
        const centerX = size / 2;
        const centerY = size / 2;

        // Нарисуем черный фон
        context.fillStyle = "black";
        context.fillRect(0, 0, size, size);

        // Круговая разметка с шагом 1000 метров
        context.strokeStyle = "green";
        context.lineWidth = 0.1;
        const stepDistance = 1000; // Шаг 1000 метров

        for (let distance = stepDistance; distance <= maxDistance; distance += stepDistance) {
            const radius = (distance / maxDistance) * (size / 2 - 10);
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.stroke();
            context.closePath();
        }

        // Азимутальная разметка с шагом 10 градусов
        const stepAngle = 10 * (Math.PI / 180); // Шаг 10 градусов

        for (let angle = 0; angle < Math.PI * 2; angle += stepAngle) {
            const x = centerX + Math.cos(angle) * (size / 2 - 10);
            const y = centerY - Math.sin(angle) * (size / 2 - 10);
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(x, y);
            context.stroke();
            context.closePath();
        }
    }

    private drawAzimuthLabels(context: CanvasRenderingContext2D, size: number) {
        const centerX = size / 2;
        const centerY = size / 2;
        const labelRadius = size / 2 - 20; // Радиус для размещения меток

        context.fillStyle = "white";
        context.font = "12px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";

        // Циферблат с азимутами каждые 30 градусов
        for (let angle = 0; angle < 360; angle += 30) {
           // Корректируем угол для правильного направления
        const rad = (angle * (Math.PI / 180)); // Переводим градусы в радианы и смещаем на -90 градусов для начала справа

        const x = centerX + labelRadius * Math.cos(rad);
        const y = centerY + labelRadius * Math.sin(rad);

        // Отображаем значение азимута
        context.fillText(((360 - angle) % 360).toString(), x, y);
        }
    }

    private createOverlay(): THREE.Mesh {
        const texture = new THREE.CanvasTexture(this.context.canvas);

        const overlayMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const overlay = new THREE.Mesh(this.display.geometry.clone(), overlayMaterial);
        overlay.position.copy(this.display.position);
        overlay.lookAt(this.camera.position);

        return overlay;
    }

    private updateRadarOverlay() {
        const size = this.context.canvas.width;

        // Очищаем canvas
        this.context.clearRect(0, 0, size, size);
        this.drawRadarGrid(this.context, size);
        this.drawAzimuthLabels(this.context, size);

        // Отображение целей
        this.radar.getState().detectedFlightObjects.forEach((obj) => {
            const azimuth = obj.azimuth;
            const distance = obj.distance;

            // Вычисляем координаты X и Y на дисплее
            const x = size / 2 + (distance / this.radar.detectionRange) * (size / 2 - 10) * Math.cos(azimuth);
            const y = size / 2 - (distance / this.radar.detectionRange) * (size / 2 - 10) * Math.sin(azimuth);

            this.context.fillStyle = "red";
            this.context.beginPath();
            this.context.arc(x, y, 3, 0, Math.PI * 2);
            this.context.fill();
            this.context.closePath();
        });

        (this.overlay.material! as THREE.MeshBasicMaterial).map.needsUpdate = true;
    }
}
