/**
 * Input Manager
 * Handles all user input (mouse, keyboard, touch)
 */
class InputManager extends EventEmitter {
    constructor(sceneManager, uiManager, state) {
        super();
        this.sceneManager = sceneManager;
        this.uiManager = uiManager;
        this.state = state;
        
        this.pixiCanvas = null;
        this.threeCanvas = null;
        this.isDraggingCamera = false;
        this.hoveredObject = null;
    }

    /**
     * Initialize input handling
     */
    init() {
        this.pixiCanvas = document.getElementById('pixi-canvas');
        this.threeCanvas = document.getElementById('three-canvas');
        
        this.setupKeyboardEvents();
        this.setupMouseEvents();
        this.setupCanvasEvents();
    }

    /**
     * Setup keyboard events
     */
    setupKeyboardEvents() {
        // CTRL key for orbit mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Control') {
                this.enableOrbitMode();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Control') {
                this.disableOrbitMode();
            }
        });

        // Handle window blur (reset orbit mode)
        window.addEventListener('blur', () => {
            this.disableOrbitMode();
        });
    }

    /**
     * Setup mouse events for wheel zoom and cursor
     */
    setupMouseEvents() {
        // Pass wheel events to Three.js for zoom
        this.pixiCanvas.addEventListener('wheel', (e) => {
            this.threeCanvas.dispatchEvent(new WheelEvent('wheel', {
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ,
                deltaMode: e.deltaMode,
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true
            }));
            e.preventDefault();
        }, { passive: false });
        
        // Change to closed hand when dragging (right click for orbit, left for pan)
        document.addEventListener('mousedown', (e) => {
            if (this.state.isOrbiting && (e.button === 0 || e.button === 2)) {
                this.isDraggingCamera = true;
                document.body.classList.remove('cursor-grab');
                document.body.classList.add('cursor-grabbing');
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (this.state.isOrbiting && this.isDraggingCamera && (e.button === 0 || e.button === 2)) {
                this.isDraggingCamera = false;
                document.body.classList.remove('cursor-grabbing');
                document.body.classList.add('cursor-grab');
            }
        });
        
        // Prevent context menu when orbiting
        document.addEventListener('contextmenu', (e) => {
            if (this.state.isOrbiting) {
                e.preventDefault();
            }
        });
        
        // Mouse move for hover detection
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }

    /**
     * Setup canvas click events
     */
    setupCanvasEvents() {
        // Three.js canvas click for item placement or deletion
        this.threeCanvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    }

    /**
     * Handle mouse move for hover detection
     */
    handleMouseMove(event) {
        if (this.state.isOrbiting) {
            // Clear highlight when orbiting
            if (this.hoveredObject) {
                this.sceneManager.unhighlightObject(this.hoveredObject);
                this.hoveredObject = null;
            }
            document.body.classList.remove('cursor-delete');
            return;
        }
        
        // Check for object under mouse (always, not just when item selected)
        const objectUnderMouse = this.sceneManager.getObjectAtPosition(event.clientX, event.clientY);
        
        // Update cursor based on hover state
        if (objectUnderMouse) {
            document.body.classList.add('cursor-delete');
        } else {
            document.body.classList.remove('cursor-delete');
        }
        
        // Only highlight if user has an item selected
        if (!this.state.selectedItem) {
            if (this.hoveredObject) {
                this.sceneManager.unhighlightObject(this.hoveredObject);
                this.hoveredObject = null;
            }
            return;
        }
        
        // If hovering over a different object
        if (objectUnderMouse !== this.hoveredObject) {
            // Unhighlight previous
            if (this.hoveredObject) {
                this.sceneManager.unhighlightObject(this.hoveredObject);
            }
            
            // Highlight new
            if (objectUnderMouse) {
                this.sceneManager.highlightObject(objectUnderMouse);
            }
            
            this.hoveredObject = objectUnderMouse;
        }
    }

    /**
     * Enable orbit mode (CTRL pressed)
     */
    enableOrbitMode() {
        this.pixiCanvas.style.pointerEvents = 'none';
        this.state.setOrbiting(true);
        // Show open hand cursor
        document.body.classList.add('cursor-grab');
        document.body.classList.remove('cursor-grabbing');
    }

    /**
     * Disable orbit mode (CTRL released)
     */
    disableOrbitMode() {
        this.pixiCanvas.style.pointerEvents = 'auto';
        document.body.classList.remove('cursor-grab', 'cursor-grabbing');
        this.isDraggingCamera = false;
        
        // Delay to prevent accidental item placement
        setTimeout(() => {
            this.state.setOrbiting(false);
        }, 100);
    }

    /**
     * Handle canvas click for item placement or deletion
     */
    handleCanvasClick(event) {
        if (this.state.isOrbiting) return;
        
        // Check if clicking on an existing object
        const objectUnderMouse = this.sceneManager.getObjectAtPosition(event.clientX, event.clientY);
        
        if (objectUnderMouse) {
            // Delete the object
            this.sceneManager.unhighlightObject(objectUnderMouse);
            this.hoveredObject = null;
            this.sceneManager.deleteObject(objectUnderMouse);
            this.emit('deleteItem', objectUnderMouse);
            return;
        }
        
        // Otherwise, place new item
        const worldPos = this.sceneManager.getWorldPosition(event.clientX, event.clientY);
        
        if (worldPos) {
            this.emit('placeItem', worldPos);
        }
    }

    /**
     * Check if click is on UI element
     */
    isClickOnUI(x, y) {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const isLandscape = W > H;
        const panelH = isLandscape ? 105 : 145;

        // Bottom panel
        if (y > H - panelH - 8) return true;
        
        // Header area
        if (y < 50 && x < 160) return true;
        
        // Day/night button
        if (y < 50 && x > W - 75) return true;
        
        // Item counter
        if (y > 42 && y < 82 && x > W - 95) return true;

        return false;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.removeAllListeners();
    }
}
