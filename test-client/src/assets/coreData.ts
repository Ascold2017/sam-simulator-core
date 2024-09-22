
export const data = {
    heightmapTerrain: {
        data: [
            [0, 0],
            [0, 0]
        ],
        width: 8000,
        height: 8000
    },
    targetNPCs: [
        {
            id: 'test-1',
            rcs: 100,
            temperature: 20,
            size: 10,
            waypoints: [
                {
                    speed: 50,
                    position: { x: 0, y: 200, z: 0 }
                },
                {
                    speed: 50,
                    position: { x: 500, y: 200, z: 0 }
                },
                {
                    speed: 50,
                    position: { x: 500, y: 200, z: 500 }
                }
            ]
        }
    ]
}