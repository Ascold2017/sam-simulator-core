import * as CANNON from "cannon-es";
import Entity from "./Entity";
import { createCanvas, loadImage } from "canvas";

export interface HeightmapTerrainProps {
  base64Image: string; // Карта высот в формате base64
  width: number; // Ширина террейна (в метрах)
  height: number; // Длина террейна (в метрах)
  minHeight: number; // Минимальная высота террейна
  maxHeight: number; // Максимальная высота террейна
}

class HeightmapTerrain extends Entity {
  private isInitialized = false;
  constructor(props: HeightmapTerrainProps) {
    super("terrain", HeightmapTerrain.getDefaultHeightfield());

    // ОБЯЗАТЕЛЬНО ПОВОРАЧИВАЕМ И СМЕЩАЕМ В ЦЕНТР!!!
   
    this.body.position.set(
      -props.width / 2,
      0,
      props.height / 2
    );

    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

    this.loadHeightmapTerrain(props);
  }

  private static getDefaultHeightfield() {
    const data = [
      [0, 0],
      [0, 0],
    ];
    const elementSize = 1;
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      shape: new CANNON.Heightfield(data, {
        elementSize,
      }),
    });
    

    return body;
  }

  private async loadHeightmapTerrain(props: HeightmapTerrainProps) {
    const heightData = await this.getHeightData(props);

    const elementSize = Math.round(props.width / heightData.length);
    console.log(elementSize)

    // Обновляем тело террейна
    const newShape = new CANNON.Heightfield(heightData, { elementSize });
    this.body.shapes = []; // Удаляем старые шейпы
    this.body.addShape(newShape);

   

    this.isInitialized = true;
    console.log('initialized')
  }

  // Метод для получения массива высот с карты высот
  private async getHeightData({
    base64Image,
    minHeight,
    maxHeight,
  }: HeightmapTerrainProps): Promise<number[][]> {
    const image = await loadImage(base64Image);
    console.log(image.width)
    // Создаем canvas для получения данных пикселей
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Получаем данные пикселей изображения
    const imageData = ctx.getImageData(0, 0, image.width, image.height).data;
    const heightData: number[][] = [];

    // Преобразуем данные пикселей в высоты
    for (let y = 0; y < image.height ; y++) {
      const row: number[] = [];
      for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4;
        const brightness = imageData[index]; // Используем красный канал
        const normalizedHeight = brightness / 255; // Нормализуем яркость
        const terrainHeight =
          normalizedHeight * (maxHeight - minHeight); // Переводим в диапазон высот
        row.push(terrainHeight);
      }
      heightData.push(row.reverse());
    }

    return heightData.reverse();
  }

  getState() {
    return {
      ...super.getState(),
      type: 'heightmap',
      isInitialized: this.isInitialized
    }
  }
}

export default HeightmapTerrain;
