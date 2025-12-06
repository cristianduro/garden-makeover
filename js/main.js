/**
 * Application Entry Point
 * Initializes the game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const game = Game.getInstance();
        await game.init();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
