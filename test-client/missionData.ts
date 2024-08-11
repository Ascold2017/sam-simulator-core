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
          { position: { x: 0, y: 0, z: 100 }, speed: 200 },
          { position: { x: 200, y: -100, z: 100 }, speed: 170 },
          { position: { x: 400, y: 100, z: 100 }, speed: 170 },
          { position: { x: 600, y: -200, z: 100 }, speed: 170 },
          { position: { x: 800, y: 0, z: 100 }, speed: 170 },
          { position: { x: 1000, y: -300, z: 100 }, speed: 170 },
          { position: { x: 1200, y: 300, z: 100 }, speed: 170 },
          { position: { x: 1500, y: 0, z: 100 }, speed: 170 },
          { position: { x: 2000, y: 1000, z: 100 }, speed: 150 },
        ],
      },
      /*
      {
        id: "target-2",
        rcs: 0.6,
        temperature: 55,
        size: 2.5,
        waypoints: [
          { position: { x: -1000, y: -500, z: 150 }, speed: 180 },
          { position: { x: -800, y: -300, z: 150 }, speed: 180 },
          { position: { x: -600, y: -100, z: 150 }, speed: 180 },
          { position: { x: -400, y: 100, z: 150 }, speed: 180 },
          { position: { x: -200, y: 300, z: 150 }, speed: 180 },
          { position: { x: 0, y: 500, z: 150 }, speed: 180 },
        ],
      },
      {
        id: "target-3",
        rcs: 0.7,
        temperature: 45,
        size: 3,
        waypoints: [
          { position: { x: 500, y: 0, z: 200 }, speed: 160 },
          { position: { x: 1000, y: 300, z: 200 }, speed: 160 },
          { position: { x: 1500, y: 600, z: 200 }, speed: 160 },
          { position: { x: 2000, y: 900, z: 200 }, speed: 160 },
          { position: { x: 2500, y: 1200, z: 200 }, speed: 160 },
        ],
      },
      {
        id: "target-4",
        rcs: 0.8,
        temperature: 60,
        size: 3.5,
        waypoints: [
          { position: { x: -500, y: -100, z: 250 }, speed: 190 },
          { position: { x: -300, y: 0, z: 250 }, speed: 190 },
          { position: { x: -100, y: 100, z: 250 }, speed: 190 },
          { position: { x: 100, y: 200, z: 250 }, speed: 190 },
          { position: { x: 300, y: 300, z: 250 }, speed: 190 },
          { position: { x: 500, y: 400, z: 250 }, speed: 190 },
        ],
      },
      {
        id: "target-5",
        rcs: 0.9,
        temperature: 70,
        size: 4,
        waypoints: [
          { position: { x: 100, y: 100, z: 300 }, speed: 200 },
          { position: { x: 300, y: 200, z: 300 }, speed: 200 },
          { position: { x: 500, y: 300, z: 300 }, speed: 200 },
          { position: { x: 700, y: 400, z: 300 }, speed: 200 },
          { position: { x: 900, y: 500, z: 300 }, speed: 200 },
          { position: { x: 1100, y: 600, z: 300 }, speed: 200 },
        ],
      },
      {
        id: "target-6",
        rcs: 1.0,
        temperature: 65,
        size: 4.5,
        waypoints: [
          { position: { x: -800, y: -200, z: 350 }, speed: 210 },
          { position: { x: -600, y: 0, z: 350 }, speed: 210 },
          { position: { x: -400, y: 200, z: 350 }, speed: 210 },
          { position: { x: -200, y: 400, z: 350 }, speed: 210 },
          { position: { x: 0, y: 600, z: 350 }, speed: 210 },
          { position: { x: 200, y: 800, z: 350 }, speed: 210 },
        ],
      },
      {
        id: "target-7",
        rcs: 1.1,
        temperature: 75,
        size: 5,
        waypoints: [
          { position: { x: 0, y: 0, z: 400 }, speed: 220 },
          { position: { x: 200, y: 200, z: 400 }, speed: 220 },
          { position: { x: 400, y: 400, z: 400 }, speed: 220 },
          { position: { x: 600, y: 600, z: 400 }, speed: 220 },
          { position: { x: 800, y: 800, z: 400 }, speed: 220 },
          { position: { x: 1000, y: 1000, z: 400 }, speed: 220 },
        ],
      },
      {
        id: "target-8",
        rcs: 1.2,
        temperature: 80,
        size: 5.5,
        waypoints: [
          { position: { x: -100, y: -100, z: 450 }, speed: 230 },
          { position: { x: 100, y: 100, z: 450 }, speed: 230 },
          { position: { x: 300, y: 300, z: 450 }, speed: 230 },
          { position: { x: 500, y: 500, z: 450 }, speed: 230 },
          { position: { x: 700, y: 700, z: 450 }, speed: 230 },
          { position: { x: 900, y: 900, z: 450 }, speed: 230 },
        ],
      },
      {
        id: "target-9",
        rcs: 1.3,
        temperature: 85,
        size: 6,
        waypoints: [
          { position: { x: 0, y: -100, z: 500 }, speed: 240 },
          { position: { x: 200, y: -200, z: 500 }, speed: 240 },
          { position: { x: 400, y: -300, z: 500 }, speed: 240 },
          { position: { x: 600, y: -400, z: 500 }, speed: 240 },
          { position: { x: 800, y: -500, z: 500 }, speed: 240 },
          { position: { x: 1000, y: -600, z: 500 }, speed: 240 },
        ],
      },
      {
        id: "target-10",
        rcs: 1.4,
        temperature: 90,
        size: 6.5,
        waypoints: [
          { position: { x: 500, y: 500, z: 550 }, speed: 250 },
          { position: { x: 700, y: 700, z: 550 }, speed: 250 },
          { position: { x: 900, y: 900, z: 550 }, speed: 250 },
          { position: { x: 1100, y: 1100, z: 550 }, speed: 250 },
          { position: { x: 1300, y: 1300, z: 550 }, speed: 250 },
          { position: { x: 1500, y: 1500, z: 550 }, speed: 250 },
        ],
      },
      */
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