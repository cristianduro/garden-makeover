/**
 * Object Factory
 * Creates 3D objects for items (GLB models or procedural)
 */
class ObjectFactory {
    constructor(config, state, modelLoader) {
        this.config = config;
        this.state = state;
        this.modelLoader = modelLoader;
    }

    /**
     * Create object for item
     */
    createObject(item) {
        const modelConfig = this.config.getModelConfig(item.id);
        
        // Try GLB model first
        if (modelConfig && this.modelLoader.isLoaded(item.id)) {
            return this.createGLBObject(item.id, modelConfig);
        }
        
        // Fallback to procedural
        return this.createProceduralObject(item);
    }

    /**
     * Create GLB model object
     */
    createGLBObject(id, modelConfig) {
        const group = new THREE.Group();
        const model = this.modelLoader.getModel(id);
        
        if (model) {
            model.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
            model.position.y = 0;
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            group.add(model);
        }
        
        return group;
    }

    /**
     * Create procedural object based on item id
     */
    createProceduralObject(item) {
        const creators = {
            table: () => this.createTable(),
            fountain: () => this.createFountain(),
            lantern: () => this.createLantern(),
            rock: () => this.createRock(),
            gnome: () => this.createGnome(),
            butterfly: () => this.createButterfly()
        };

        const creator = creators[item.id];
        if (creator) {
            return creator();
        }
        
        // Default fallback
        return this.createGenericObject(item.color);
    }

    /**
     * Create table
     */
    createTable() {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0xa1887f });
        
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16), woodMat);
        top.position.y = 0.7;
        top.castShadow = true;
        group.add(top);
        
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.65, 8), woodMat);
        leg.position.y = 0.35;
        leg.castShadow = true;
        group.add(leg);
        
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), woodMat);
        base.position.y = 0.025;
        base.castShadow = true;
        group.add(base);
        
        return group;
    }

    /**
     * Create fountain
     */
    createFountain() {
        const group = new THREE.Group();
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
        const waterMat = new THREE.MeshLambertMaterial({ 
            color: 0x4fc3f7, 
            transparent: true, 
            opacity: 0.7 
        });
        
        const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.3, 16), stoneMat);
        pool.position.y = 0.15;
        pool.castShadow = true;
        group.add(pool);
        
        const water = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16), waterMat);
        water.position.y = 0.25;
        group.add(water);
        
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8), stoneMat);
        pillar.position.y = 0.7;
        pillar.castShadow = true;
        group.add(pillar);
        
        const bowl = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            stoneMat
        );
        bowl.position.y = 1.1;
        bowl.rotation.x = Math.PI;
        group.add(bowl);
        
        return group;
    }

    /**
     * Create lantern with light
     */
    createLantern() {
        const group = new THREE.Group();
        
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.1, 8),
            new THREE.MeshLambertMaterial({ color: 0x5d4037 })
        );
        base.position.y = 0.05;
        group.add(base);
        
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1, 8),
            new THREE.MeshLambertMaterial({ color: 0x3e2723 })
        );
        pole.position.y = 0.55;
        pole.castShadow = true;
        group.add(pole);
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.35, 0.25),
            new THREE.MeshLambertMaterial({ color: 0xffab91, transparent: true, opacity: 0.8 })
        );
        body.position.y = 1.2;
        group.add(body);
        
        // Add point light
        const light = new THREE.PointLight(0xffab91, 0.5, 3);
        light.position.y = 1.2;
        group.add(light);
        this.state.registerPointLight(light);
        
        const top = new THREE.Mesh(
            new THREE.ConeGeometry(0.18, 0.15, 4),
            new THREE.MeshLambertMaterial({ color: 0x3e2723 })
        );
        top.position.y = 1.45;
        top.rotation.y = Math.PI / 4;
        group.add(top);
        
        return group;
    }

    /**
     * Create rock
     */
    createRock() {
        const group = new THREE.Group();
        
        const geometry = new THREE.DodecahedronGeometry(0.4, 1);
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            positions.setX(i, positions.getX(i) * (0.8 + Math.random() * 0.4));
            positions.setY(i, positions.getY(i) * (0.6 + Math.random() * 0.3));
            positions.setZ(i, positions.getZ(i) * (0.8 + Math.random() * 0.4));
        }
        geometry.computeVertexNormals();
        
        const rock = new THREE.Mesh(
            geometry,
            new THREE.MeshLambertMaterial({ color: 0x757575 })
        );
        rock.position.y = 0.25;
        rock.castShadow = true;
        group.add(rock);
        
        return group;
    }

    /**
     * Create gnome
     */
    createGnome() {
        const group = new THREE.Group();
        
        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.2, 0.4, 4, 8),
            new THREE.MeshLambertMaterial({ color: 0x1565c0 })
        );
        body.position.y = 0.4;
        body.castShadow = true;
        group.add(body);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xffccbc })
        );
        head.position.y = 0.8;
        head.castShadow = true;
        group.add(head);
        
        const hat = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 0.5, 8),
            new THREE.MeshLambertMaterial({ color: 0xef5350 })
        );
        hat.position.y = 1.15;
        hat.castShadow = true;
        group.add(hat);
        
        const beard = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.3, 6),
            new THREE.MeshLambertMaterial({ color: 0xeeeeee })
        );
        beard.position.set(0, 0.65, 0.1);
        beard.rotation.x = Math.PI;
        group.add(beard);
        
        return group;
    }

    /**
     * Create butterfly (animated)
     */
    createButterfly() {
        const group = new THREE.Group();
        
        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.03, 0.15, 4, 8),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        body.position.y = 1;
        body.rotation.x = Math.PI / 2;
        group.add(body);
        
        const wingMat = new THREE.MeshLambertMaterial({
            color: 0x7c4dff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        [-1, 1].forEach(side => {
            const wing = new THREE.Mesh(new THREE.CircleGeometry(0.2, 8), wingMat);
            wing.position.set(side * 0.15, 1, 0);
            wing.rotation.y = side * 0.3;
            group.add(wing);
        });
        
        group.userData.animate = true;
        this.state.registerAnimatedObject(group);
        
        return group;
    }

    /**
     * Create generic fallback object
     */
    createGenericObject(color) {
        const group = new THREE.Group();
        
        const item = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshLambertMaterial({ color })
        );
        item.position.y = 0.25;
        item.castShadow = true;
        group.add(item);
        
        return group;
    }

    /**
     * Create simple flower (fallback for GLB)
     */
    createFlower(color) {
        const group = new THREE.Group();
        
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
            new THREE.MeshLambertMaterial({ color: 0x2e7d32 })
        );
        stem.position.y = 0.4;
        group.add(stem);
        
        for (let i = 0; i < 6; i++) {
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.MeshLambertMaterial({ color })
            );
            petal.scale.set(1, 0.3, 1);
            petal.position.set(
                Math.cos(i * Math.PI / 3) * 0.2,
                0.85,
                Math.sin(i * Math.PI / 3) * 0.2
            );
            group.add(petal);
        }
        
        const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xffeb3b })
        );
        center.position.y = 0.85;
        group.add(center);
        
        return group;
    }
}
