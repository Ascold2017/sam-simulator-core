<template>
    <TresCanvas window-size clearColor="white">
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

        <Sphere v-for="sphere in store.spheres" :args="[sphere.radius]" :position="sphere.position"
            :quaternion="sphere.quaternion" :key="sphere.id" color="red" />

        <TresGroup v-for="npc in store.targetNPCs" :position="npc.position" :quaternion="npc.quaternion" :key="npc.id">
            <Cone :args="[npc.size / 3, npc.size, 32]" color="yellow" :rotation="[0, 0, -Math.PI / 2]" />
        </TresGroup>

        <TresGroup v-for="gm in store.guidedMissiles" :position="gm.position" :quaternion="gm.quaternion" :key="gm.id">
            <Cone :args="[2, 6, 32]" color="orange" :rotation="[0, 0, -Math.PI / 2]" />
        </TresGroup>

        <TresGroup v-for="aa in store.aas" :position="aa.position" :key="aa.id">
            <Cone :args="[2, 5, 32]" color="red" />
            <Line2 :points="[
                [0, 0, 0],
                [
                    (aa.aimRay[0]) * 1000,
                    (aa.aimRay[1]) * 1000,
                    (aa.aimRay[2]) * 1000
                ]
            ]" color="green" linewidth="10" />
        </TresGroup>

        <!-- Террейн -->
         <Suspense>
            <GLTFModel path="/mars/scene.gltf" />
        </Suspense>

    </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { OrbitControls, Cone, GLTFModel, Sphere, Line2, Plane } from '@tresjs/cientos'
import { useStore } from '@/store';

const store = useStore();

function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
        case 'w':
            store.setMyAADirection(0, 1 * (Math.PI / 180));
            return;
        case 'a':
            store.setMyAADirection(-1 * (Math.PI / 180), 0);
            return;
        case 's':
            store.setMyAADirection(0, -1 * (Math.PI / 180));
            return;
        case 'd':
            store.setMyAADirection(1 * (Math.PI / 180), 0);
            return;
        case ' ':
            store.fire();
            return;
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
})
</script>

<style scoped>
canvas {
    display: block;
}
</style>