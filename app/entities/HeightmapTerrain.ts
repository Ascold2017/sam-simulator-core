import * as CANNON from "cannon-es";
import Entity from "./Entity";
export interface HeightmapTerrainProps {
  data: number[][];
  width: number; // Ширина террейна (в метрах)
  height: number; // Длина террейна (в метрах)
}

class HeightmapTerrain extends Entity {
  constructor(props: HeightmapTerrainProps) {
    const elementSize = props.width / (props.data.length -1);
    const adjustedData = props.data.reverse().map(row => row);
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      shape: new CANNON.Heightfield(adjustedData, { elementSize: elementSize }),
    });
    // @ts-ignore
    body.isHeightmapTerrain = true;
    super("terrain", body);

    // ОБЯЗАТЕЛЬНО ПОВОРАЧИВАЕМ И СМЕЩАЕМ В ЦЕНТР!!!
    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.body.position.set(
      -props.width / 2 + elementSize / 2,
      0,
      props.height / 2,
    );

    this.type = "heightmap";
  }


  getState() {
    return {
      ...super.getState(),
    }
  }
}

export default HeightmapTerrain;
