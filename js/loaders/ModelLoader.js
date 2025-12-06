/**
 * Model Loader
 * Handles loading and caching of GLB/GLTF models
 */
class ModelLoader {
    constructor(config) {
        this.config = config;
        this.loader = new THREE.GLTFLoader();
        this.cache = new Map();
        this.loading = new Map();
    }

    /**
     * Preload all configured models
     */
    async preloadModels() {
        const models = this.config.models.items;
        const promises = [];

        for (const [id, modelConfig] of Object.entries(models)) {
            const path = this.config.models.basePath + modelConfig.file;
            promises.push(this.loadModel(id, path));
        }

        try {
            await Promise.all(promises);
            console.log('✅ All models preloaded');
        } catch (error) {
            console.warn('⚠️ Some models failed to load:', error);
        }
    }

    /**
     * Load a single model
     */
    loadModel(id, path) {
        // Return cached model
        if (this.cache.has(id)) {
            return Promise.resolve(this.cache.get(id));
        }

        // Return existing loading promise
        if (this.loading.has(id)) {
            return this.loading.get(id);
        }

        // Create new loading promise
        const promise = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    this.cache.set(id, gltf.scene);
                    this.loading.delete(id);
                    console.log(`📦 Model loaded: ${id}`);
                    resolve(gltf.scene);
                },
                (progress) => {
                    // Progress callback (optional)
                },
                (error) => {
                    this.loading.delete(id);
                    console.warn(`❌ Failed to load model: ${id}`, error);
                    reject(error);
                }
            );
        });

        this.loading.set(id, promise);
        return promise;
    }

    /**
     * Get a cloned model from cache
     */
    getModel(id) {
        const cached = this.cache.get(id);
        if (cached) {
            return cached.clone();
        }
        return null;
    }

    /**
     * Check if model is loaded
     */
    isLoaded(id) {
        return this.cache.has(id);
    }

    /**
     * Check if model is currently loading
     */
    isLoading(id) {
        return this.loading.has(id);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get model config
     */
    getModelConfig(id) {
        return this.config.models.items[id] || null;
    }
}
