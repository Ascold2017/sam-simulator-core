import { MissionData } from "../app";

export const missionData: MissionData = {
    map: {
      size: 100,
      data: [
        [0, 1, 2, 3, 4],
        [1, 2, 17, 20, 3],
        [2, 3, 5, 3, 2],
        [1, 2, 3, 2, 1],
        [0, 1, 50, 1, 0],
      ],
    },
    targets: [
      {
        id: "target1",
        rcs: 0.5,
        temperature: 50,
        size: 2,
        waypoints: [
          { position: { x: 0, y: 0, z: 20 }, speed: 20 },
          { position: { x: 50, y: 50, z: 16 }, speed: 17 },
          { position: { x: -20, y: -20, z: 9 }, speed: 15 },
        ],
      },
    ],
    radars: [
      {
        id: "radar1",
        type: "search",
        position: { x: 5, y: 10, z: 7 },
        minElevationAngle: 0,
        maxElevationAngle: Math.PI / 4,
        maxDistance: 10000,
        sweepSpeed: 0.5,
      },
    ],
    cameras: [
      {
        id: "camera1",
        type: "tv",
        position: { x: 2, y: 7, z: 7 },
        minElevationAngle: -Math.PI / 6,
        maxElevationAngle: Math.PI / 6,
        azimuthAngle: Math.PI / 4,
        viewAngle: Math.PI / 3,
      },
    ],
  };