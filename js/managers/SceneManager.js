/**
 * Scene Manager
 * Manages Three.js scene, rendering, and 3D objects
 */
class SceneManager extends EventEmitter {
    constructor(config, state) {
        super();
        this.config = config;
        this.state = state;
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Lights
        this.ambientLight = null;
        this.sunLight = null;
        
        // Scene objects
        this.ground = null;
        this.sceneDecor = [];
        
        // Model loader
        this.modelLoader = null;
        
        // Canvas
        this.canvas = null;
    }

    /**
     * Initialize the scene
     */
    async init() {
        this.canvas = document.getElementById('three-canvas');
        
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLights();
        this.createGround();
        this.createSceneDecor();
        
        // Initialize model loader
        this.modelLoader = new ModelLoader(this.config);
        await this.modelLoader.preloadModels();
    }

    /**
     * Create Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.scene.day.skyColor);
    }

    /**
     * Create camera
     */
    createCamera() {
        const { fov, near, far, position, lookAt } = this.config.scene.camera;
        const aspect = window.innerWidth / window.innerHeight;
        
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }

    /**
     * Create renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
    }

    /**
     * Create OrbitControls
     */
    createControls() {
        const cfg = this.config.scene.controls;
        
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = cfg.enableDamping;
        this.controls.dampingFactor = cfg.dampingFactor;
        this.controls.minDistance = cfg.minDistance;
        this.controls.maxDistance = cfg.maxDistance;
        this.controls.maxPolarAngle = cfg.maxPolarAngle;
        this.controls.minPolarAngle = cfg.minPolarAngle;
        this.controls.target.set(0, 0, 0);
        this.controls.enablePan = true;
        
        // Swap mouse buttons: right to rotate, left to pan
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };
        
        this.controls.update();
    }

    /**
     * Create lights
     */
    createLights() {
        const cfg = this.config.scene.day;
        
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, cfg.ambientIntensity);
        this.scene.add(this.ambientLight);
        
        // Sun/directional light
        this.sunLight = new THREE.DirectionalLight(0xffffff, cfg.sunIntensity);
        this.sunLight.position.set(5, 10, 5);
        this.sunLight.castShadow = true;
        
        const shadowCfg = this.config.scene.shadows;
        this.sunLight.shadow.mapSize.width = shadowCfg.mapSize;
        this.sunLight.shadow.mapSize.height = shadowCfg.mapSize;
        this.sunLight.shadow.camera.near = shadowCfg.cameraNear;
        this.sunLight.shadow.camera.far = shadowCfg.cameraFar;
        this.sunLight.shadow.camera.left = -shadowCfg.cameraSize;
        this.sunLight.shadow.camera.right = shadowCfg.cameraSize;
        this.sunLight.shadow.camera.top = shadowCfg.cameraSize;
        this.sunLight.shadow.camera.bottom = -shadowCfg.cameraSize;
        
        this.scene.add(this.sunLight);
        
        // Hemisphere light
        this.scene.add(new THREE.HemisphereLight(0x87ceeb, 0x558b2f, 0.4));
    }

    /**
     * Create ground plane
     */
    createGround() {
        const scale = this.state.sceneScale;
        const groundSize = 20 * scale;
        
        const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
        const positions = groundGeo.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            positions.setZ(i, Math.sin(x * 0.5) * 0.1 + Math.cos(y * 0.5) * 0.1);
        }
        groundGeo.computeVertexNormals();
        
        const groundMat = new THREE.MeshLambertMaterial({
            color: 0x4caf50,
            side: THREE.DoubleSide
        });
        
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    /**
     * Create scene decoration (grass, fence, pathway)
     */
    createSceneDecor() {
        const scale = this.state.sceneScale;
        const isMobile = Math.min(window.innerWidth, window.innerHeight) < 500;
        
        // Grass blades
        const grassCount = isMobile ? 60 : 100;
        for (let i = 0; i < grassCount; i++) {
            const blade = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1 * scale, 0.3 * scale),
                new THREE.MeshLambertMaterial({
                    color: new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.6, 0.4),
                    side: THREE.DoubleSide
                })
            );
            blade.position.set(
                (Math.random() - 0.5) * 18 * scale,
                0.15 * scale,
                (Math.random() - 0.5) * 18 * scale
            );
            blade.rotation.y = Math.random() * Math.PI;
            blade.userData.isSceneDecor = true;
            this.scene.add(blade);
            this.sceneDecor.push(blade);
        }
        
        // Fence
        const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
        const fenceOffset = 9 * scale;
        const fenceSpacing = 3 * scale;
        
        const fencePositions = [];
        for (let i = -3; i <= 3; i++) {
            fencePositions.push([i * fenceSpacing, 0, -fenceOffset]);
            fencePositions.push([i * fenceSpacing, 0, fenceOffset]);
        }
        for (let i = -2; i <= 2; i++) {
            fencePositions.push([-fenceOffset, 0, i * fenceSpacing]);
            fencePositions.push([fenceOffset, 0, i * fenceSpacing]);
        }
        
        fencePositions.forEach(pos => {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(0.2 * scale, 1.5 * scale, 0.2 * scale),
                fenceMat
            );
            post.position.set(pos[0], 0.75 * scale, pos[2]);
            post.castShadow = true;
            post.userData.isSceneDecor = true;
            this.scene.add(post);
            this.sceneDecor.push(post);
        });
        
        // Pathway
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0xbdbdbd });
        for (let i = -5; i <= 5; i++) {
            const stone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4 * scale, 0.5 * scale, 0.1 * scale, 8),
                stoneMat
            );
            stone.position.set(
                i * 1.2 * scale + (Math.random() - 0.5) * 0.3,
                0.05 * scale,
                7 * scale + (Math.random() - 0.5) * 0.3
            );
            stone.receiveShadow = true;
            stone.userData.isSceneDecor = true;
            this.scene.add(stone);
            this.sceneDecor.push(stone);
        }
    }

    /**
     * Place an item in the scene
     */
    placeItem(item, position) {
        const scale = this.state.sceneScale;
        const objectFactory = new ObjectFactory(this.config, this.state, this.modelLoader);
        
        const object = objectFactory.createObject(item);
        object.position.set(position.x, 0, position.z);
        object.userData.itemId = item.id;
        object.scale.set(0, 0, 0);
        
        this.scene.add(object);
        
        // Animate placement
        gsap.to(object.scale, {
            x: scale,
            y: scale,
            z: scale,
            duration: this.config.gameplay.animations.itemPlace,
            ease: "elastic.out(1, 0.5)"
        });
        
        return object;
    }

    /**
     * Toggle day/night mode
     */
    toggleDayNight() {
        const isDay = !this.state.isDay;
        this.state.setIsDay(isDay);
        
        const cfg = isDay ? this.config.scene.day : this.config.scene.night;
        const duration = this.config.gameplay.animations.dayNightTransition;
        
        // Animate sky color
        gsap.to(this.scene.background, {
            r: ((cfg.skyColor >> 16) & 255) / 255,
            g: ((cfg.skyColor >> 8) & 255) / 255,
            b: (cfg.skyColor & 255) / 255,
            duration
        });
        
        // Animate lights
        gsap.to(this.ambientLight, { intensity: cfg.ambientIntensity, duration });
        gsap.to(this.sunLight, { intensity: cfg.sunIntensity, duration });
        
        // Toggle point lights
        this.state.pointLights.forEach(light => {
            gsap.to(light, { intensity: isDay ? 0.5 : 2, duration });
        });
    }

    /**
     * Get world position from screen coordinates
     */
    getWorldPosition(clientX, clientY) {
        if (!this.camera || !this.ground) return null;
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObject(this.ground);
        
        if (intersects.length > 0) {
            return {
                x: intersects[0].point.x,
                z: intersects[0].point.z
            };
        }
        return null;
    }

    /**
     * Get placed object at screen position
     */
    getObjectAtPosition(clientX, clientY) {
        if (!this.camera) return null;
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, this.camera);
        
        // Get all placed objects
        const placedObjects = this.state.placedObjects;
        if (placedObjects.length === 0) return null;
        
        const intersects = raycaster.intersectObjects(placedObjects, true);
        
        if (intersects.length > 0) {
            // Find root object (parent with itemId)
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.itemId) {
                obj = obj.parent;
            }
            if (obj.userData.itemId) {
                return obj;
            }
        }
        return null;
    }

    /**
     * Highlight object with red tint
     */
    highlightObject(object) {
        if (!object) return;
        
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                // Store original material
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material.clone();
                }
                // Apply red tint
                child.material = child.material.clone();
                child.material.color.setHex(0xff4444);
                child.material.transparent = true;
                child.material.opacity = 0.5;
            }
        });
    }

    /**
     * Remove highlight from object
     */
    unhighlightObject(object) {
        if (!object) return;
        
        object.traverse((child) => {
            if (child.isMesh && child.userData.originalMaterial) {
                child.material.dispose();
                child.material = child.userData.originalMaterial;
                delete child.userData.originalMaterial;
            }
        });
    }

    /**
     * Delete object from scene with animation
     */
    deleteObject(object) {
        if (!object) return;
        
        // Remove from state
        this.state.removePlacedObject(object);
        
        // Animate out
        gsap.to(object.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.3,
            ease: "back.in(2)",
            onComplete: () => {
                // Dispose of geometries and materials
                object.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                this.scene.remove(object);
            }
        });
        
        return true;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Rebuild scene for new scale
     */
    rebuildForScale(newScale, oldScale) {
        // Update ground
        const groundSize = 20 * newScale;
        this.ground.geometry.dispose();
        
        const newGroundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
        const positions = newGroundGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            positions.setZ(i, Math.sin(x * 0.5) * 0.1 + Math.cos(y * 0.5) * 0.1);
        }
        newGroundGeo.computeVertexNormals();
        this.ground.geometry = newGroundGeo;
        
        // Rescale placed objects
        const scaleRatio = newScale / oldScale;
        this.state.placedObjects.forEach(obj => {
            obj.position.x *= scaleRatio;
            obj.position.z *= scaleRatio;
            obj.scale.multiplyScalar(scaleRatio);
        });
        
        // Remove old decor
        this.sceneDecor.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            this.scene.remove(obj);
        });
        this.sceneDecor = [];
        
        // Recreate decor
        this.createSceneDecor();
    }

    /**
     * Update loop
     */
    update() {
        if (this.controls) {
            this.controls.update();
        }
        
        // Animate objects
        this.state.animatedObjects.forEach(obj => {
            if (obj.userData.animate) {
                obj.rotation.y += 0.02;
                obj.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get canvas element
     */
    getCanvas() {
        return this.canvas;
    }
}
