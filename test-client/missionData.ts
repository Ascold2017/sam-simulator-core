import { MissionData } from "../app";

export const missionData: MissionData = {
    map: {
      size: 100,
      data:  generateTerrainMap(100),
    },
    targets: [
      {
        id: "target-1",
        rcs: 0.5,
        temperature: 50,
        size: 2,
        waypoints: [
          { position: { x: 0, y: 0, z: 100 }, speed: 20 },
          { position: { x: 1500, y: 0, z: 100 }, speed: 17 },
          { position: { x: 2000, y: 1000, z: 100 }, speed: 15 },
        ],
      },
    ],
    radars: [
      {
        id: "search-radar-0",
        type: "search",
        position: { x: 5, y: 10, z: 5 },
        minElevationAngle: 0,
        maxElevationAngle: Math.PI / 4,
        maxDistance: 5000,
        sweepSpeed: 0.5,
      },
      {
        id: "sector-radar-0",
        type: "sector",
        position: { x: 5, y: 20, z: 5 },
        minElevationAngle: 0,
        maxElevationAngle: Math.PI / 6,
        maxDistance: 4000,
        viewAngle: Math.PI / 6,
      },
    ],
    cameras: [
      {
        id: "tv-camera-1",
        type: "tv",
        position: { x: 2, y: 7, z: 7 },
        minElevationAngle: -Math.PI / 6,
        maxElevationAngle: Math.PI / 6,
        azimuthAngle: Math.PI / 4,
        viewAngle: Math.PI / 3,
      },
    ],
  };

  function generateTerrainMap(size: number): number[][] {
    const map = Array.from({ length: size }, () => Array(size).fill(0));

    // Генерация равнинной местности
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            map[i][j] = Math.floor(Math.random() * 3) - 2; // Высота от -5 до +20 метров
        }
    }

    // Генерация первого гребня гор ближе к центру карты
    const mountain1StartX = Math.floor(-size * 0.6);
    const mountain1EndX = Math.floor(-size * 0.7);
    const mountain1StartY = Math.floor(-size * 0.6);
    const mountain1EndY = Math.floor(-size * 0.76);

    for (let i = mountain1StartX; i < mountain1EndX; i++) {
        for (let j = mountain1StartY; j < mountain1EndY; j++) {
            map[i][j] = Math.floor(Math.random() * 53) + 20; // Высота от 20 до 550 метров
        }
    }

    // Генерация второго гребня гор ближе к центру карты
    const mountain2StartX = Math.floor(size * 0.6);
    const mountain2EndX = Math.floor(size * 0.7);
    const mountain2StartY = Math.floor(size * 0.6);
    const mountain2EndY = Math.floor(size * 0.8);

    for (let i = mountain2StartX; i < mountain2EndX; i++) {
        for (let j = mountain2StartY; j < mountain2EndY; j++) {
            map[i][j] = Math.floor(Math.random() * 53) + 20; // Высота от 20 до 550 метров
        }
    }

    return map;
}