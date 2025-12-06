/**
 * Game Configuration
 * Centralized configuration management
 */
class GameConfig {
    constructor() {
        this.scene = {
            day: {
                skyColor: 0x87ceeb,
                ambientIntensity: 0.6,
                sunIntensity: 1.0
            },
            night: {
                skyColor: 0x1a1a2e,
                ambientIntensity: 0.2,
                sunIntensity: 0.1
            },
            camera: {
                fov: 60,
                near: 0.1,
                far: 1000,
                position: { x: 0, y: 12, z: 12 },
                lookAt: { x: 0, y: 0, z: 0 }
            },
            shadows: {
                mapSize: 2048,
                cameraNear: 0.5,
                cameraFar: 50,
                cameraSize: 15
            },
            controls: {
                enableDamping: true,
                dampingFactor: 0.05,
                minDistance: 5,
                maxDistance: 25,
                maxPolarAngle: Math.PI / 2.2,
                minPolarAngle: Math.PI / 6
            }
        };

        this.gameplay = {
            maxItems: 15,
            bounds: { x: 8, z: 8 },
            animations: {
                itemPlace: 0.5,
                dayNightTransition: 1.0
            }
        };

        this.ui = {
            colors: {
                primary: 0x4caf50,
                white: 0xffffff,
                black: 0x333333,
                gray: 0x666666,
                lightGray: 0xf5f5f5,
                overlay: 0x000000
            },
            sparkles: {
                count: 20,
                minSpeed: 0.5,
                maxSpeed: 1.5,
                minAmplitude: 10,
                maxAmplitude: 30
            },
            particles: {
                count: 6,
                spread: 30
            },
            hints: {
                selectItem: 'Select an item first! 👆',
                placeOnGrass: 'Place items on the grass! 🌿',
                maxItemsReached: 'Max 15 items reached! 🌟'
            },
            encouragements: [
                'Beautiful! 🌸',
                'Great choice! ✨',
                'Looking good! 🌟',
                'Nice placement! 🎯',
                'Wonderful! 🌺',
                'Perfect! 💫'
            ]
        };

        this.models = {
            basePath: 'assets/gltf/',
            items: {
                tomato: { file: 'tomato.glb', scale: 0.5 },
                corn: { file: 'corn.glb', scale: 0.5 },
                strawberry: { file: 'strawberry.glb', scale: 0.5 }
            }
        };

        // Freeze config to prevent accidental modifications
        Object.freeze(this.scene);
        Object.freeze(this.gameplay);
        Object.freeze(this.ui);
        Object.freeze(this.models);
    }

    /**
     * Get model config by id
     */
    getModelConfig(id) {
        return this.models.items[id] || null;
    }

    /**
     * Get full model path
     */
    getModelPath(id) {
        const model = this.getModelConfig(id);
        return model ? this.models.basePath + model.file : null;
    }
}
