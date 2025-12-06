/**
 * Main Game Controller
 * Orchestrates all game systems and manages game lifecycle
 */
class Game {
    constructor() {
        this.config = null;
        this.state = null;
        this.sceneManager = null;
        this.uiManager = null;
        this.inputManager = null;
        this.itemManager = null;
        this.initialized = false;
        
        // Audio
        this.themeMusic = null;
        this.placeSound = null;
        this.deleteSound = null;
    }

    /**
     * Initialize the game
     */
    async init() {
        if (this.initialized) return;

        // Initialize core systems
        this.config = new GameConfig();
        this.state = new GameState();
        this.itemManager = new ItemManager(this.config);
        
        // Initialize audio
        this.initAudio();
        
        // Initialize rendering systems
        this.sceneManager = new SceneManager(this.config, this.state);
        await this.sceneManager.init();
        
        this.uiManager = new UIManager(this.config, this.state, this.itemManager);
        await this.uiManager.init();
        
        // Initialize input handling
        this.inputManager = new InputManager(this.sceneManager, this.uiManager, this.state);
        this.inputManager.init();
        
        // Connect systems
        this.connectSystems();
        
        // Start game loop
        this.startGameLoop();
        
        this.initialized = true;
        console.log('🌱 GardenMakeover initialized');
    }

    /**
     * Initialize audio system
     */
    initAudio() {
        this.isMuted = false;
        
        // Background music
        this.themeMusic = new Audio('assets/sounds/theme.mp3');
        this.themeMusic.loop = true;
        this.themeMusic.volume = 0.3;
        
        // Sound effects
        this.placeSound = new Audio('assets/sounds/place.mp3');
        this.placeSound.volume = 0.5;
        
        this.deleteSound = new Audio('assets/sounds/delete.mp3');
        this.deleteSound.volume = 0.5;
    }

    /**
     * Toggle mute all sounds
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.themeMusic) {
            this.themeMusic.muted = this.isMuted;
        }
        if (this.placeSound) {
            this.placeSound.muted = this.isMuted;
        }
        if (this.deleteSound) {
            this.deleteSound.muted = this.isMuted;
        }
    }

    /**
     * Start background music
     */
    startMusic() {
        if (this.themeMusic) {
            this.themeMusic.play().catch(() => {});
        }
    }

    /**
     * Play placement sound
     */
    playPlaceSound() {
        if (this.placeSound) {
            this.placeSound.currentTime = 0;
            this.placeSound.play().catch(() => {});
        }
    }

    /**
     * Play delete sound
     */
    playDeleteSound() {
        if (this.deleteSound) {
            this.deleteSound.currentTime = 0;
            this.deleteSound.play().catch(() => {});
        }
    }

    /**
     * Connect system events
     */
    connectSystems() {
        // Item placement events
        this.inputManager.on('placeItem', (position) => {
            this.handleItemPlacement(position);
        });

        // UI events
        this.uiManager.on('itemSelected', (item) => {
            this.state.setSelectedItem(item);
        });

        this.uiManager.on('categorySelected', (categoryId) => {
            this.state.setSelectedCategory(categoryId);
        });

        this.uiManager.on('toggleDayNight', () => {
            this.sceneManager.toggleDayNight();
            this.uiManager.updateDayNightUI(this.state.isDay);
        });

        this.uiManager.on('tutorialDismissed', () => {
            this.state.setTutorialShown(true);
            this.startMusic();
        });

        // Input events - delete item
        this.inputManager.on('deleteItem', () => {
            this.handleItemDeletion();
        });

        // Resize events
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle item deletion
     */
    handleItemDeletion() {
        this.playDeleteSound();
        this.uiManager.updateItemCounter(this.state.placedItems.length);
        this.uiManager.showHint('Item removed! 🗑️');
    }

    /**
     * Handle item placement
     */
    handleItemPlacement(position) {
        if (this.state.isOrbiting) return;
        
        const bounds = this.config.gameplay.bounds;
        const scale = this.state.sceneScale;

        // Check bounds
        if (Math.abs(position.x) >= bounds.x * scale || Math.abs(position.z) >= bounds.z * scale) {
            this.uiManager.showHint(this.config.ui.hints.placeOnGrass);
            return;
        }

        // Check if item selected
        if (!this.state.selectedItem) {
            this.uiManager.showHint(this.config.ui.hints.selectItem);
            return;
        }

        // Check item limit
        if (!this.state.canPlaceItem()) {
            this.uiManager.showHint(this.config.ui.hints.maxItemsReached);
            this.uiManager.showMaxItemsPopup();
            return;
        }

        // Place the item
        const object = this.sceneManager.placeItem(this.state.selectedItem, position);
        this.state.addPlacedItem(this.state.selectedItem, object);
        
        // Play sound
        this.playPlaceSound();
        
        // Update UI
        this.uiManager.updateItemCounter(this.state.placedItems.length);
        this.uiManager.createPlacementParticles(position, this.state.selectedItem);
        
        // Show encouragement
        const messages = this.config.ui.encouragements;
        this.uiManager.showHint(messages[Math.floor(Math.random() * messages.length)]);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const oldScale = this.state.sceneScale;
        const newScale = this.calculateSceneScale();

        // Update renderers
        this.sceneManager.handleResize();
        this.uiManager.handleResize();

        // If scale changed significantly, rebuild scene
        if (Math.abs(newScale - oldScale) > 0.01) {
            this.state.setSceneScale(newScale);
            this.sceneManager.rebuildForScale(newScale, oldScale);
        }
    }

    /**
     * Calculate scene scale based on device
     */
    calculateSceneScale() {
        const isMobile = Math.min(window.innerWidth, window.innerHeight) < 500;
        const isPortrait = window.innerHeight > window.innerWidth;
        return isMobile ? (isPortrait ? 0.4 : 1.0) : 1;
    }

    /**
     * Start the game loop
     */
    startGameLoop() {
        const loop = () => {
            this.sceneManager.update();
            requestAnimationFrame(loop);
        };
        loop();
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!Game.instance) {
            Game.instance = new Game();
        }
        return Game.instance;
    }
}

// Static instance
Game.instance = null;
