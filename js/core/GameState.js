/**
 * Game State Management
 * Centralized state with reactive updates
 */
class GameState extends EventEmitter {
    constructor() {
        super();
        
        this._state = {
            // Game state
            isDay: true,
            tutorialShown: false,
            isOrbiting: false,
            sceneScale: 1,
            
            // Selection state
            selectedItem: null,
            selectedCategory: 'plants',
            
            // Placed items
            placedItems: [],
            placedObjects: [],
            
            // Animated objects
            animatedObjects: [],
            
            // Point lights (for night mode)
            pointLights: []
        };
    }

    // Getters
    get isDay() { return this._state.isDay; }
    get tutorialShown() { return this._state.tutorialShown; }
    get isOrbiting() { return this._state.isOrbiting; }
    get sceneScale() { return this._state.sceneScale; }
    get selectedItem() { return this._state.selectedItem; }
    get selectedCategory() { return this._state.selectedCategory; }
    get placedItems() { return [...this._state.placedItems]; }
    get placedObjects() { return [...this._state.placedObjects]; }
    get animatedObjects() { return [...this._state.animatedObjects]; }
    get pointLights() { return [...this._state.pointLights]; }
    get itemCount() { return this._state.placedItems.length; }

    // Setters with events
    setIsDay(value) {
        this._state.isDay = value;
        this.emit('dayNightChanged', value);
    }

    setTutorialShown(value) {
        this._state.tutorialShown = value;
        this.emit('tutorialStateChanged', value);
    }

    setOrbiting(value) {
        this._state.isOrbiting = value;
        this.emit('orbitingChanged', value);
    }

    setSceneScale(value) {
        const oldScale = this._state.sceneScale;
        this._state.sceneScale = value;
        this.emit('scaleChanged', { oldScale, newScale: value });
    }

    setSelectedItem(item) {
        this._state.selectedItem = item;
        this.emit('itemSelected', item);
    }

    setSelectedCategory(categoryId) {
        this._state.selectedCategory = categoryId;
        this.emit('categorySelected', categoryId);
    }

    // Item management
    addPlacedItem(item, object) {
        this._state.placedItems.push(item);
        this._state.placedObjects.push(object);
        this.emit('itemPlaced', { item, object, count: this.itemCount });
    }

    removePlacedItem(index) {
        if (index >= 0 && index < this._state.placedItems.length) {
            const item = this._state.placedItems.splice(index, 1)[0];
            const object = this._state.placedObjects.splice(index, 1)[0];
            this.emit('itemRemoved', { item, object, count: this.itemCount });
            return { item, object };
        }
        return null;
    }

    removePlacedObject(object) {
        const index = this._state.placedObjects.indexOf(object);
        if (index > -1) {
            this._state.placedItems.splice(index, 1);
            this._state.placedObjects.splice(index, 1);
            this.emit('itemRemoved', { object, count: this.itemCount });
            return true;
        }
        return false;
    }

    canPlaceItem() {
        return this._state.placedItems.length < 15; // Max items from config
    }

    // Animated objects
    registerAnimatedObject(object) {
        this._state.animatedObjects.push(object);
    }

    unregisterAnimatedObject(object) {
        const index = this._state.animatedObjects.indexOf(object);
        if (index > -1) {
            this._state.animatedObjects.splice(index, 1);
        }
    }

    // Point lights
    registerPointLight(light) {
        this._state.pointLights.push(light);
    }

    unregisterPointLight(light) {
        const index = this._state.pointLights.indexOf(light);
        if (index > -1) {
            this._state.pointLights.splice(index, 1);
        }
    }

    // Reset state
    reset() {
        this._state.placedItems = [];
        this._state.placedObjects = [];
        this._state.animatedObjects = [];
        this._state.pointLights = [];
        this._state.selectedItem = null;
        this.emit('stateReset');
    }

    // Serialize state (for save/load)
    serialize() {
        return {
            isDay: this._state.isDay,
            placedItems: this._state.placedItems.map(item => ({
                id: item.id,
                position: item.position
            }))
        };
    }
}
