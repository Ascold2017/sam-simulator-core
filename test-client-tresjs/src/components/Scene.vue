<template>
    <TresCanvas window-size>
        <!-- Камера -->
        <TresPerspectiveCamera :position="[0, 300, -500]" :fov="75" :near="0.1" :far="10000" />
        <!-- Орбитальные контроллеры -->
        <orbit-controls :enable-damping="true" :damping-factor="0.05" />


        <!-- Освещение -->
        <TresAmbientLight :intensity="0.6" />
        <TresDirectionalLight :position="[50, 500, 50]" />

        <!-- Сетка и оси -->
        <TresGridHelper :args="[1000]" />
        <TresAxesHelper :args="[100]" />

        <!-- Объекты из движка -->
        <TresGroup ref="engineObjects">
            <TresMesh v-for="flightObject in flightObjects" :key="flightObject.id"  :position="[flightObject.position.x, flightObject.position.y, flightObject.position.z]">
                <primitive :object="getGeometryForFlightObject(flightObject.type)" :material="getMaterialForFlightObject(flightObject.type)" />
                
            </TresMesh>
        </TresGroup>

        <!-- Террейн -->
        <TresMesh ref="terrain" :rotation="[-Math.PI / 2, 0, 0]" v-if="terrainGeometry">
            <primitive :object="terrainGeometry" />
            <TresMeshStandardMaterial :color="0x0000ff" :side="THREE.BackSide"/>
        </TresMesh>

    </TresCanvas>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { missionData } from '@/assets/missionData'
import { TresCanvas } from '@tresjs/core'
import { ref, onMounted } from 'vue';
import { Core, type FlightObjectDTO } from '../../../app/index'
import { OrbitControls } from '@tresjs/cientos'
import { Mesh, BufferGeometry, Material, PlaneGeometry, SphereGeometry, CylinderGeometry, BoxGeometry, MeshStandardMaterial } from 'three';

const flightObjects = ref<FlightObjectDTO[]>([]);
const terrainGeometry = ref<BufferGeometry | null>(null);

// Здесь симулируем инициализацию объектов из Core
const core = new Core();
flightObjects.value = core.getFlightObjects(); // Здесь мы получаем объекты полета

// Функция для получения геометрии в зависимости от типа объекта
const getGeometryForFlightObject = (type: string): BufferGeometry => {
    switch (type) {
        case 'target':
            return new SphereGeometry(5, 32, 32);
        case 'active-missile':
            return new CylinderGeometry(2, 2, 10, 32);
        case 'bullet':
            return new SphereGeometry(2, 32, 32);
        default:
            return new BoxGeometry(5, 5, 5);
    }
};

// Функция для получения материала в зависимости от типа объекта
const getMaterialForFlightObject = (type: string): Material => {
    switch (type) {
        case 'target':
            return new MeshStandardMaterial({ color: 0xff0000 });
        case 'active-missile':
            return new MeshStandardMaterial({ color: 0x00ff00 });
        case 'bullet':
            return new MeshStandardMaterial({ color: 0xffff00 });
        default:
            return new MeshStandardMaterial({ color: 0xffffff });
    }
};


// Функция для создания террейна
const createHeightmapTerrain = (terrainData: { elementSize: number, data: number[][] }) => {
    const { elementSize, data } = terrainData;

    // Создаем плоскость с сеткой по количеству точек в данных высот
    const width = (data.length - 1) * elementSize;
    const height = (data[0].length - 1) * elementSize;
    const geometry = new PlaneGeometry(width, height, data.length - 1, data[0].length - 1);

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const vertexIndex = i * data[i].length + j;
            const heightValue = data[i][j];

            // Устанавливаем высоту (Z) для каждой вершины
            geometry.attributes.position.setZ(vertexIndex, heightValue);
            // Устанавливаем позиции X и Y с учетом elementSize
            const x = (j - (data[i].length - 1) / 2) * elementSize;
            const y = (i - (data.length - 1) / 2) * elementSize;
            geometry.attributes.position.setX(vertexIndex, x);
            geometry.attributes.position.setY(vertexIndex, y);
        }
    }


    geometry.computeVertexNormals(); // Пересчитываем нормали для корректного освещения

    return geometry;
};

onMounted(() => {
    core.startMission(missionData)
    const terrain = core.getHeightmapTerrain();
    if (terrain) {
        terrainGeometry.value = createHeightmapTerrain(terrain);
    }
    core.updateListener = () => {
        flightObjects.value = core.getFlightObjects()
    }
})
</script>

<style scoped>
canvas {
    display: block;
}
</style>