/**
 * Item Manager
 * Manages item definitions, categories and data
 */
class ItemManager {
    constructor(config) {
        this.config = config;
        this.categories = new Map();
        this.items = new Map();
        
        this.initializeItems();
    }

    /**
     * Initialize default items
     */
    initializeItems() {
        // Plants category
        this.addCategory('plants', {
            label: 'Plants',
            icon: '🌸',
            order: 0
        });

        this.addItem('plants', {
            id: 'tomato',
            name: 'Tomato',
            icon: '🍅',
            image: 'assets/images/tomato.png',
            color: 0xff6b6b,
            modelType: 'glb'
        });

        this.addItem('plants', {
            id: 'corn',
            name: 'Corn',
            icon: '🌽',
            image: 'assets/images/corn.png',
            color: 0xffc107,
            modelType: 'glb'
        });

        this.addItem('plants', {
            id: 'strawberry',
            name: 'Strawberry',
            icon: '🍓',
            image: 'assets/images/strawberry.png',
            color: 0xff4757,
            modelType: 'glb'
        });

        // Furniture category
        this.addCategory('furniture', {
            label: 'Furniture',
            icon: '🪑',
            order: 1
        });

        this.addItem('furniture', {
            id: 'table',
            name: 'Table',
            icon: '🪵',
            color: 0xa1887f,
            modelType: 'procedural'
        });

        this.addItem('furniture', {
            id: 'fountain',
            name: 'Fountain',
            icon: '⛲',
            color: 0x90caf9,
            modelType: 'procedural'
        });

        // Decor category
        this.addCategory('decor', {
            label: 'Decor',
            icon: '✨',
            order: 2
        });

        this.addItem('decor', {
            id: 'lantern',
            name: 'Lantern',
            icon: '🏮',
            color: 0xffab91,
            modelType: 'procedural',
            hasLight: true
        });

        this.addItem('decor', {
            id: 'rock',
            name: 'Rock',
            icon: '🪨',
            color: 0x9e9e9e,
            modelType: 'procedural'
        });
    }

    /**
     * Add a category
     */
    addCategory(id, data) {
        this.categories.set(id, {
            id,
            ...data,
            items: []
        });
    }

    /**
     * Add an item to a category
     */
    addItem(categoryId, itemData) {
        const category = this.categories.get(categoryId);
        if (!category) {
            console.warn(`Category "${categoryId}" not found`);
            return;
        }

        const item = {
            ...itemData,
            categoryId
        };

        this.items.set(item.id, item);
        category.items.push(item);
    }

    /**
     * Get all categories
     */
    getCategories() {
        return Array.from(this.categories.values())
            .sort((a, b) => a.order - b.order);
    }

    /**
     * Get category by id
     */
    getCategory(id) {
        return this.categories.get(id);
    }

    /**
     * Get category IDs
     */
    getCategoryIds() {
        return Array.from(this.categories.keys());
    }

    /**
     * Get items by category
     */
    getItemsByCategory(categoryId) {
        const category = this.categories.get(categoryId);
        return category ? [...category.items] : [];
    }

    /**
     * Get item by id
     */
    getItem(id) {
        return this.items.get(id);
    }

    /**
     * Get all items
     */
    getAllItems() {
        return Array.from(this.items.values());
    }

    /**
     * Check if item uses GLB model
     */
    isGLBModel(itemId) {
        const item = this.items.get(itemId);
        return item?.modelType === 'glb';
    }

    /**
     * Get model path for item
     */
    getModelPath(itemId) {
        if (!this.isGLBModel(itemId)) return null;
        return this.config.getModelPath(itemId);
    }
}
