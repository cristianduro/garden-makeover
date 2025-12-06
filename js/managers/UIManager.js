/**
 * UI Manager
 * Manages all Pixi.js UI components
 */
class UIManager extends EventEmitter {
    constructor(config, state, itemManager) {
        super();
        this.config = config;
        this.state = state;
        this.itemManager = itemManager;
        
        this.app = null;
        this.canvas = null;
        
        this.sparklesContainer = null;
        this.uiContainer = null;
        this.particlesContainer = null;
        
        this.components = {
            tutorial: null,
            bottomPanel: null,
            hintToast: null,
            itemCounter: null,
            dayNightBtn: null,
            maxItemsPopup: null
        };
        
        this.sparkles = [];
        this.timeIcon = null;
        this.timeText = null;
        this.itemCounterText = null;
    }

    async init() {
        this.canvas = document.getElementById('pixi-canvas');
        
        this.app = new PIXI.Application({
            view: this.canvas,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundAlpha: 0,
            resolution: Math.min(window.devicePixelRatio, 2),
            autoDensity: true
        });
        
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        
        this.sparklesContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        this.particlesContainer = new PIXI.Container();
        
        this.app.stage.addChild(this.sparklesContainer);
        this.app.stage.addChild(this.uiContainer);
        this.app.stage.addChild(this.particlesContainer);
        
        this.initSparkles();
        this.showTutorial();
        
        this.app.stage.on('pointerdown', (e) => this.handleStageClick(e));
        this.app.ticker.add(() => this.updateAnimation());
        window.addEventListener('resize', () => this.handleResize());
    }

    // ==================== Helpers ====================
    
    isLandscape() { return this.app.screen.width > this.app.screen.height; }
    isMobile() { return Math.min(this.app.screen.width, this.app.screen.height) < 500; }
    isDesktop() { return Math.min(this.app.screen.width, this.app.screen.height) >= 700; }

    createRect(w, h, r, color, alpha = 1) {
        const g = new PIXI.Graphics();
        g.beginFill(color, alpha);
        g.drawRoundedRect(0, 0, w, h, r);
        g.endFill();
        return g;
    }

    createText(text, style = {}) {
        return new PIXI.Text(text, {
            fontFamily: 'Nunito, Arial, sans-serif',
            fontSize: 14,
            fill: this.config.ui.colors.black,
            fontWeight: '600',
            ...style
        });
    }

    createTitleText(text, style = {}) {
        return new PIXI.Text(text, {
            fontFamily: 'Fredoka, Arial, sans-serif',
            fontSize: 14,
            fill: this.config.ui.colors.black,
            fontWeight: '600',
            ...style
        });
    }

    // ==================== Sparkles ====================

    initSparkles() {
        const cfg = this.config.ui.sparkles;
        const count = this.isMobile() ? 8 : cfg.count;
        
        for (let i = 0; i < count; i++) {
            const sparkle = new PIXI.Graphics();
            sparkle.beginFill(0xffffff, 0.6);
            sparkle.drawCircle(0, 0, 2);
            sparkle.endFill();
            
            sparkle.x = Math.random() * this.app.screen.width;
            sparkle.y = Math.random() * this.app.screen.height * 0.5;
            sparkle.alpha = Math.random() * 0.5;
            
            sparkle.userData = {
                speed: cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed),
                amplitude: cfg.minAmplitude + Math.random() * (cfg.maxAmplitude - cfg.minAmplitude),
                offset: Math.random() * Math.PI * 2,
                baseX: sparkle.x
            };
            
            this.sparklesContainer.addChild(sparkle);
            this.sparkles.push(sparkle);
        }
    }

    // ==================== Tutorial ====================

    showTutorial() {
        const W = this.app.screen.width;
        const H = this.app.screen.height;
        const land = this.isLandscape();
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const colors = this.config.ui.colors;
        
        this.components.tutorial = new PIXI.Container();
        this.components.tutorial.eventMode = 'static';
        
        // Background
        const bg = new PIXI.Graphics();
        bg.beginFill(colors.overlay, 0.9);
        bg.drawRect(0, 0, W, H);
        bg.endFill();
        bg.eventMode = 'static';
        this.components.tutorial.addChild(bg);
        
        // Card
        const cW = land ? (desk ? 650 : (mob ? 380 : 480)) : (desk ? 500 : (mob ? W - 24 : 400));
        const cH = land ? (desk ? 400 : (mob ? 220 : 280)) : (desk ? 520 : (mob ? 400 : 420));
        const cX = (W - cW) / 2;
        const cY = (H - cH) / 2;
        
        const card = this.createRect(cW, cH, desk ? 28 : (mob ? 16 : 20), colors.white);
        card.position.set(cX, cY);
        this.components.tutorial.addChild(card);
        
        // Title
        const tS = land ? (desk ? 36 : (mob ? 20 : 26)) : (desk ? 38 : (mob ? 22 : 30));
        const title = this.createTitleText('🌻 GardenMakeover', { fontSize: tS, fill: colors.primary, fontWeight: '700' });
        title.anchor.set(0.5, 0);
        title.position.set(W / 2, cY + (desk ? 24 : (mob ? 14 : 18)));
        this.components.tutorial.addChild(title);
        
        // Subtitle
        const subS = land ? (desk ? 18 : (mob ? 11 : 14)) : (desk ? 20 : (mob ? 12 : 16));
        const sub = this.createText('Design your dream garden!', { fontSize: subS, fill: colors.gray, fontWeight: '500' });
        sub.anchor.set(0.5, 0);
        sub.position.set(W / 2, title.y + tS + (desk ? 8 : 4));
        this.components.tutorial.addChild(sub);
        
        // Instructions
        const stS = land ? (desk ? 15 : (mob ? 9 : 12)) : (desk ? 16 : (mob ? 11 : 13));
        const headS = land ? (desk ? 17 : (mob ? 11 : 14)) : (desk ? 18 : (mob ? 13 : 15));
        const lineH = land ? (desk ? 24 : (mob ? 15 : 19)) : (desk ? 28 : (mob ? 20 : 24));
        let startY = sub.y + subS + (desk ? 24 : (mob ? 14 : 18));
        
        if (land) {
            const colGap = desk ? 60 : (mob ? 30 : 40);
            const col1X = W / 2 - colGap;
            const col2X = W / 2 + colGap;
            
            const howToPlay = [
                { text: '🎮 HOW TO PLAY', head: true },
                { text: '1. Select category below', head: false },
                { text: '2. Choose an item', head: false },
                { text: '3. Click grass to place', head: false },
                { text: '4. Click item to delete', head: false },
                { text: '5. Max 15 items', head: false }
            ];
            
            const camera = [
                { text: '📷 CAMERA', head: true },
                { text: '• Zoom: Mouse wheel', head: false },
                { text: '• Orbit: CTRL + Right click', head: false },
                { text: '• Pan: CTRL + Left click', head: false },
                { text: '• Day/Night: Top button', head: false },
                { text: '', head: false }
            ];
            
            howToPlay.forEach((line, i) => {
                const t = line.head 
                    ? this.createTitleText(line.text, { fontSize: headS, fill: colors.primary, fontWeight: '700' })
                    : this.createText(line.text, { fontSize: stS, fill: colors.black, fontWeight: '500' });
                t.anchor.set(1, 0);
                t.position.set(col1X - 10, startY + i * lineH);
                this.components.tutorial.addChild(t);
            });
            
            camera.forEach((line, i) => {
                const t = line.head 
                    ? this.createTitleText(line.text, { fontSize: headS, fill: colors.primary, fontWeight: '700' })
                    : this.createText(line.text, { fontSize: stS, fill: colors.black, fontWeight: '500' });
                t.anchor.set(0, 0);
                t.position.set(col2X + 10, startY + i * lineH);
                this.components.tutorial.addChild(t);
            });
        } else {
            const allSteps = [
                { text: '🎮 HOW TO PLAY', head: true },
                { text: '1. Select category from panel', head: false },
                { text: '2. Choose an item to place', head: false },
                { text: '3. Click grass to place item', head: false },
                { text: '4. Click item to delete it', head: false },
                { text: '', head: false },
                { text: '📷 CAMERA CONTROLS', head: true },
                { text: '• Zoom: Mouse wheel', head: false },
                { text: '• Orbit: CTRL + Right drag', head: false },
                { text: '• Pan: CTRL + Left drag', head: false },
                { text: '', head: false },
                { text: '☀️ Day/Night: Top button', head: false }
            ];
            
            let yOffset = 0;
            allSteps.forEach((step) => {
                if (step.text === '') {
                    yOffset += lineH * 0.4;
                    return;
                }
                const t = step.head 
                    ? this.createTitleText(step.text, { fontSize: headS, fill: colors.primary, fontWeight: '700' })
                    : this.createText(step.text, { fontSize: stS, fill: colors.black, fontWeight: '500' });
                t.anchor.set(0.5, 0);
                t.position.set(W / 2, startY + yOffset);
                this.components.tutorial.addChild(t);
                yOffset += lineH;
            });
        }
        
        // Button
        const bW = land ? (desk ? 180 : (mob ? 120 : 140)) : (desk ? 200 : (mob ? 140 : 160));
        const bH = land ? (desk ? 54 : (mob ? 36 : 44)) : (desk ? 58 : (mob ? 42 : 48));
        const btn = new PIXI.Container();
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.addChild(this.createRect(bW, bH, desk ? 26 : (mob ? 18 : 22), colors.primary));
        
        const bLSize = land ? (desk ? 20 : (mob ? 13 : 16)) : (desk ? 22 : (mob ? 15 : 18));
        const bL = this.createTitleText("🌱 Let's Go!", { fontSize: bLSize, fill: colors.white, fontWeight: '700' });
        bL.anchor.set(0.5);
        bL.position.set(bW / 2, bH / 2);
        btn.addChild(bL);
        btn.position.set((W - bW) / 2, cY + cH - bH - (desk ? 20 : (mob ? 12 : 16)));
        btn.on('pointerdown', () => this.dismissTutorial());
        this.components.tutorial.addChild(btn);
        
        this.uiContainer.addChild(this.components.tutorial);
    }

    dismissTutorial() {
        gsap.to(this.components.tutorial, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                this.components.tutorial.visible = false;
                this.state.setTutorialShown(true);
                this.emit('tutorialDismissed');
                this.createMainUI();
                setTimeout(() => this.showHint('Select item & tap! 🌱'), 400);
            }
        });
    }

    // ==================== Main UI ====================

    createMainUI() {
        this.createDayNightButton();
        this.createBottomPanel();
        this.createHintToast();
        this.createItemCounter();
    }

    createDayNightButton() {
        const W = this.app.screen.width;
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const land = this.isLandscape();
        const colors = this.config.ui.colors;
        
        // Bigger sizes for portrait orientation
        const bW = land 
            ? (mob ? 54 : (desk ? 90 : 68))
            : (mob ? 70 : (desk ? 100 : 80));
        const bH = land 
            ? (mob ? 30 : (desk ? 46 : 36))
            : (mob ? 38 : (desk ? 52 : 44));
        
        const btn = new PIXI.Container();
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.addChild(this.createRect(bW, bH, desk ? 18 : 14, colors.primary));
        
        const iconSize = land 
            ? (mob ? 12 : (desk ? 20 : 14))
            : (mob ? 16 : (desk ? 22 : 18));
        const ti = this.createText('☀️', { fontSize: iconSize });
        ti.position.set(10, (bH - iconSize) / 2);
        btn.addChild(ti);
        this.timeIcon = ti;
        
        const textSize = land 
            ? (mob ? 9 : (desk ? 14 : 10))
            : (mob ? 12 : (desk ? 16 : 14));
        const tt = this.createText('Day', { fontSize: textSize, fill: colors.white, fontWeight: '700' });
        tt.position.set(land ? (mob ? 24 : (desk ? 36 : 28)) : (mob ? 32 : (desk ? 40 : 36)), (bH - textSize) / 2);
        btn.addChild(tt);
        this.timeText = tt;
        
        btn.position.set(W - bW - 15, 12);
        btn.on('pointerdown', () => this.emit('toggleDayNight'));
        
        this.components.dayNightBtn = btn;
        this.uiContainer.addChild(btn);
    }

    createItemCounter() {
        const W = this.app.screen.width;
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const land = this.isLandscape();
        const colors = this.config.ui.colors;
        
        // Bigger sizes for portrait orientation
        const w = land 
            ? (mob ? 72 : (desk ? 110 : 88))
            : (mob ? 82 : (desk ? 120 : 100));
        const h = land 
            ? (mob ? 24 : (desk ? 36 : 28))
            : (mob ? 32 : (desk ? 42 : 36));
        
        const c = new PIXI.Container();
        c.addChild(this.createRect(w, h, desk ? 14 : 10, colors.white, 0.95));
        
        const fs = land 
            ? (mob ? 9 : (desk ? 13 : 11))
            : (mob ? 13 : (desk ? 16 : 14));
        
        // Use single text element to avoid overlap
        const counterText = this.createText('0/15', { fontSize: fs, fill: colors.primary, fontWeight: '700' });
        counterText.anchor.set(0.5, 0.5);
        counterText.position.set(w / 2, h / 2);
        c.addChild(counterText);
        this.itemCounterText = counterText;
        
        // Position below day/night button
        const yPos = land 
            ? (mob ? 46 : (desk ? 64 : 52))
            : (mob ? 56 : (desk ? 70 : 62));
        c.position.set(W - w - 15, yPos);
        
        this.components.itemCounter = c;
        this.uiContainer.addChild(c);
        
        // Create mute button below counter
        this.createMuteButton(W - w - 15, yPos + h + 6, w, h);
    }

    createMuteButton(x, y, w, h) {
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const land = this.isLandscape();
        const colors = this.config.ui.colors;
        
        const btn = new PIXI.Container();
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        
        const bg = this.createRect(w, h, desk ? 14 : 10, colors.white, 0.95);
        btn.addChild(bg);
        
        const iconSize = land 
            ? (mob ? 12 : (desk ? 18 : 14))
            : (mob ? 16 : (desk ? 20 : 18));
        
        const icon = this.createText('🔊', { fontSize: iconSize });
        icon.anchor.set(0.5, 0.5);
        icon.position.set(w / 2, h / 2);
        btn.addChild(icon);
        this.muteIcon = icon;
        
        btn.position.set(x, y);
        btn.on('pointerdown', () => {
            const game = Game.getInstance();
            game.toggleMute();
            this.updateMuteIcon(game.isMuted);
        });
        
        this.components.muteBtn = btn;
        this.uiContainer.addChild(btn);
    }

    updateMuteIcon(isMuted) {
        if (this.muteIcon) {
            this.muteIcon.text = isMuted ? '🔇' : '🔊';
        }
    }

    createHintToast() {
        const W = this.app.screen.width;
        const H = this.app.screen.height;
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const land = this.isLandscape();
        const colors = this.config.ui.colors;
        
        const tW = mob ? 200 : (desk ? 340 : 260);
        const tH = mob ? 32 : (desk ? 50 : 38);
        
        const container = new PIXI.Container();
        container.addChild(this.createRect(tW, tH, desk ? 20 : 14, colors.black, 0.8));
        
        const text = this.createText('', { fontSize: mob ? 11 : (desk ? 16 : 12), fill: colors.white, fontWeight: '500' });
        text.anchor.set(0.5);
        text.position.set(tW / 2, tH / 2);
        container.addChild(text);
        
        const panelH = land ? (desk ? 140 : 100) : (desk ? 200 : 140);
        container.position.set((W - tW) / 2, H - panelH - tH - 20);
        container.alpha = 0;
        
        this.components.hintToast = { container, text };
        this.uiContainer.addChild(container);
    }

    createBottomPanel() {
        const W = this.app.screen.width;
        const H = this.app.screen.height;
        const land = this.isLandscape();
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const colors = this.config.ui.colors;
        
        const panelH = land ? (desk ? 140 : 100) : (desk ? 200 : 140);
        
        const panel = new PIXI.Container();
        panel.addChild(this.createRect(W, panelH + 20, 0, colors.white, 0.95));
        panel.position.set(0, H - panelH);
        
        // Category tabs
        const categories = this.itemManager.getCategories();
        const tabW = land ? (desk ? 110 : (mob ? 72 : 95)) : (desk ? 130 : (mob ? 80 : 95));
        const tabH = land ? (desk ? 36 : (mob ? 26 : 30)) : (desk ? 42 : (mob ? 30 : 32));
        const gap = mob ? 6 : (desk ? 12 : 8);
        const startX = (W - (categories.length * tabW + (categories.length - 1) * gap)) / 2;
        
        categories.forEach((cat, i) => {
            const tab = new PIXI.Container();
            tab.eventMode = 'static';
            tab.cursor = 'pointer';
            
            const isSelected = cat.id === this.state.selectedCategory;
            const bg = this.createRect(tabW, tabH, desk ? 16 : 10, isSelected ? colors.primary : colors.lightGray);
            tab.addChild(bg);
            
            const fontSize = land ? (desk ? 14 : (mob ? 10 : 11)) : (desk ? 16 : (mob ? 10 : 11));
            const label = this.createText(`${cat.icon} ${cat.label}`, { 
                fontSize, 
                fill: isSelected ? colors.white : colors.black,
                fontWeight: '600'
            });
            label.anchor.set(0.5);
            label.position.set(tabW / 2, tabH / 2);
            tab.addChild(label);
            
            tab.position.set(startX + i * (tabW + gap), 8);
            tab.on('pointerdown', () => {
                this.state.setSelectedCategory(cat.id);
                this.emit('categorySelected', cat.id);
                this.rebuildBottomPanel();
            });
            
            panel.addChild(tab);
        });
        
        // Item grid
        const items = this.itemManager.getItemsByCategory(this.state.selectedCategory);
        const btnW = land ? (desk ? 80 : (mob ? 50 : 65)) : (desk ? 90 : (mob ? 54 : 65));
        const btnH = land ? (desk ? 90 : (mob ? 58 : 70)) : (desk ? 115 : (mob ? 70 : 80));
        const btnGap = mob ? 6 : (desk ? 14 : 10);
        const btnStartX = (W - (items.length * btnW + (items.length - 1) * btnGap)) / 2;
        const btnStartY = land ? (desk ? 52 : (mob ? 38 : 44)) : (desk ? 58 : (mob ? 44 : 48));
        
        items.forEach((item, i) => {
            const btn = new PIXI.Container();
            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            
            const isSelected = this.state.selectedItem?.id === item.id;
            const bg = this.createRect(btnW, btnH, desk ? 14 : 10, isSelected ? colors.primary : colors.lightGray, isSelected ? 0.3 : 1);
            btn.addChild(bg);
            
            const iconSize = land ? (desk ? 32 : (mob ? 20 : 26)) : (desk ? 40 : (mob ? 22 : 26));
            
            // Use image if available, otherwise use emoji
            if (item.image) {
                const sprite = PIXI.Sprite.from(item.image);
                sprite.anchor.set(0.5);
                sprite.width = iconSize;
                sprite.height = iconSize;
                sprite.position.set(btnW / 2, btnH * 0.35);
                btn.addChild(sprite);
            } else {
                const icon = this.createText(item.icon, { fontSize: iconSize });
                icon.anchor.set(0.5);
                icon.position.set(btnW / 2, btnH * 0.35);
                btn.addChild(icon);
            }
            
            const nameSize = land ? (desk ? 12 : (mob ? 8 : 9)) : (desk ? 14 : (mob ? 8 : 9));
            const name = this.createText(item.name, { fontSize: nameSize, fill: colors.gray, fontWeight: '500' });
            name.anchor.set(0.5);
            name.position.set(btnW / 2, btnH * 0.75);
            btn.addChild(name);
            
            if (isSelected) {
                const border = new PIXI.Graphics();
                border.lineStyle(2, colors.primary);
                border.drawRoundedRect(0, 0, btnW, btnH, desk ? 14 : 10);
                btn.addChild(border);
            }
            
            btn.position.set(btnStartX + i * (btnW + btnGap), btnStartY);
            btn.on('pointerdown', () => {
                this.state.setSelectedItem(item);
                this.emit('itemSelected', item);
                this.rebuildBottomPanel();
            });
            
            panel.addChild(btn);
        });
        
        this.components.bottomPanel = panel;
        this.uiContainer.addChild(panel);
    }

    rebuildBottomPanel() {
        if (this.components.bottomPanel) {
            this.uiContainer.removeChild(this.components.bottomPanel);
            this.components.bottomPanel.destroy({ children: true });
        }
        this.createBottomPanel();
    }

    // ==================== Public Methods ====================

    showHint(message) {
        if (!this.components.hintToast) return;
        
        const { container, text } = this.components.hintToast;
        text.text = message;
        
        gsap.killTweensOf(container);
        gsap.to(container, { alpha: 1, duration: 0.2 });
        gsap.to(container, { alpha: 0, duration: 0.3, delay: 2 });
    }

    updateItemCounter(count) {
        if (this.itemCounterText) {
            this.itemCounterText.text = `${count}/15`;
        }
    }

    updateDayNightUI(isDay) {
        if (this.timeIcon) this.timeIcon.text = isDay ? '☀️' : '🌙';
        if (this.timeText) this.timeText.text = isDay ? 'Day' : 'Night';
    }

    showMaxItemsPopup() {
        if (this.components.maxItemsPopup?.visible) return;
        
        const W = this.app.screen.width;
        const H = this.app.screen.height;
        const land = this.isLandscape();
        const mob = this.isMobile();
        const desk = this.isDesktop();
        const colors = this.config.ui.colors;
        
        // For mobile portrait, use larger sizes
        const mobPortrait = mob && !land;
        
        this.components.maxItemsPopup = new PIXI.Container();
        this.components.maxItemsPopup.eventMode = 'static';
        
        // Background overlay
        const bg = new PIXI.Graphics();
        bg.beginFill(colors.overlay, 0.9);
        bg.drawRect(0, 0, W, H);
        bg.endFill();
        bg.eventMode = 'static';
        this.components.maxItemsPopup.addChild(bg);
        
        // Card - increased height
        const cW = land ? (desk ? 520 : (mob ? 340 : 420)) : (desk ? 440 : (mob ? W - 28 : 380));
        const cH = land ? (desk ? 380 : (mob ? 260 : 320)) : (desk ? 480 : (mob ? 420 : 440));
        const cX = (W - cW) / 2;
        const cY = (H - cH) / 2;
        
        const card = this.createRect(cW, cH, desk ? 28 : (mob ? 16 : 20), colors.white);
        card.position.set(cX, cY);
        this.components.maxItemsPopup.addChild(card);
        
        // Crown/Star icon
        const iconS = land ? (desk ? 60 : (mob ? 36 : 48)) : (desk ? 70 : (mobPortrait ? 52 : 54));
        const icon = this.createText('👑', { fontSize: iconS });
        icon.anchor.set(0.5);
        icon.position.set(W / 2, cY + (desk ? 50 : (mobPortrait ? 40 : (mob ? 32 : 40))));
        this.components.maxItemsPopup.addChild(icon);
        
        // Title
        const tS = land ? (desk ? 28 : (mob ? 18 : 22)) : (desk ? 32 : (mobPortrait ? 26 : 26));
        const title = this.createTitleText('Limit Reached!', { fontSize: tS, fill: colors.primary, fontWeight: '700' });
        title.anchor.set(0.5);
        title.position.set(W / 2, icon.y + iconS / 2 + (desk ? 24 : (mobPortrait ? 20 : (mob ? 14 : 18))));
        this.components.maxItemsPopup.addChild(title);
        
        // Message lines - larger for mobile portrait
        const msgS = land ? (desk ? 16 : (mob ? 11 : 13)) : (desk ? 18 : (mobPortrait ? 16 : 14));
        const lineH = land ? (desk ? 26 : (mob ? 18 : 22)) : (desk ? 30 : (mobPortrait ? 28 : 26));
        const messages = [
            "You've placed 15 items! 🎉",
            '',
            'Unlock the Full Version for:',
            '✨ 100+ placeable objects',
            '🏡 Multiple garden themes',
            '💾 Save & share gardens'
        ];
        
        let msgY = title.y + tS + (desk ? 20 : (mobPortrait ? 18 : (mob ? 12 : 16)));
        messages.forEach((msg) => {
            if (msg === '') {
                msgY += lineH * 0.3;
                return;
            }
            const isFeature = msg.startsWith('✨') || msg.startsWith('🏡') || msg.startsWith('💾');
            const t = this.createText(msg, { 
                fontSize: msgS, 
                fill: isFeature ? colors.black : colors.gray, 
                fontWeight: isFeature ? '600' : '500' 
            });
            t.anchor.set(0.5);
            t.position.set(W / 2, msgY);
            this.components.maxItemsPopup.addChild(t);
            msgY += lineH;
        });
        
        // Buttons container
        const btnY = cY + cH - (desk ? 70 : (mobPortrait ? 60 : (mob ? 50 : 60)));
        const btnGap = mob ? 10 : (desk ? 20 : 14);
        
        // Buy button - larger for mobile portrait
        const buyW = land ? (desk ? 160 : (mob ? 110 : 130)) : (desk ? 180 : (mobPortrait ? 130 : 140));
        const buyH = land ? (desk ? 48 : (mob ? 34 : 40)) : (desk ? 52 : (mobPortrait ? 44 : 44));
        
        const buyBtn = new PIXI.Container();
        buyBtn.eventMode = 'static';
        buyBtn.cursor = 'pointer';
        buyBtn.addChild(this.createRect(buyW, buyH, desk ? 24 : (mob ? 16 : 20), 0xFFD700)); // Gold color
        
        const buyText = this.createTitleText('🛒 Buy Now', { 
            fontSize: land ? (desk ? 16 : (mob ? 11 : 13)) : (desk ? 18 : (mobPortrait ? 15 : 14)), 
            fill: colors.black, 
            fontWeight: '700' 
        });
        buyText.anchor.set(0.5);
        buyText.position.set(buyW / 2, buyH / 2);
        buyBtn.addChild(buyText);
        buyBtn.position.set(W / 2 - buyW - btnGap / 2, btnY);
        buyBtn.on('pointerdown', () => {
            // Simulate buy action
            this.showHint('Coming soon! Thanks for your interest! 💖');
            this.hideMaxItemsPopup();
        });
        this.components.maxItemsPopup.addChild(buyBtn);
        
        // Close button - larger for mobile portrait
        const closeW = land ? (desk ? 120 : (mob ? 80 : 100)) : (desk ? 140 : (mobPortrait ? 100 : 110));
        const closeH = buyH;
        
        const closeBtn = new PIXI.Container();
        closeBtn.eventMode = 'static';
        closeBtn.cursor = 'pointer';
        closeBtn.addChild(this.createRect(closeW, closeH, desk ? 24 : (mob ? 16 : 20), colors.lightGray));
        
        const closeText = this.createText('Maybe Later', { 
            fontSize: land ? (desk ? 14 : (mob ? 10 : 12)) : (desk ? 16 : (mobPortrait ? 13 : 13)), 
            fill: colors.gray, 
            fontWeight: '600' 
        });
        closeText.anchor.set(0.5);
        closeText.position.set(closeW / 2, closeH / 2);
        closeBtn.addChild(closeText);
        closeBtn.position.set(W / 2 + btnGap / 2, btnY);
        closeBtn.on('pointerdown', () => this.hideMaxItemsPopup());
        this.components.maxItemsPopup.addChild(closeBtn);
        
        // Animate in
        this.components.maxItemsPopup.alpha = 0;
        this.uiContainer.addChild(this.components.maxItemsPopup);
        gsap.to(this.components.maxItemsPopup, { alpha: 1, duration: 0.3 });
    }

    hideMaxItemsPopup() {
        if (!this.components.maxItemsPopup) return;
        
        gsap.to(this.components.maxItemsPopup, {
            alpha: 0,
            duration: 0.25,
            onComplete: () => {
                if (this.components.maxItemsPopup) {
                    this.uiContainer.removeChild(this.components.maxItemsPopup);
                    this.components.maxItemsPopup.destroy({ children: true });
                    this.components.maxItemsPopup = null;
                }
            }
        });
    }

    createPlacementParticles(position, item) {
        const cfg = this.config.ui.particles;
        const camera = Game.getInstance().sceneManager.camera;
        
        const v = new THREE.Vector3(position.x, 0.5, position.z);
        v.project(camera);
        const screenPos = {
            x: (v.x + 1) / 2 * window.innerWidth,
            y: (-v.y + 1) / 2 * window.innerHeight
        };
        
        for (let i = 0; i < cfg.count; i++) {
            let p;
            if (item.image) {
                p = PIXI.Sprite.from(item.image);
                p.width = 20;
                p.height = 20;
            } else {
                p = this.createText(item.icon, { fontSize: 20 });
            }
            p.anchor.set(0.5);
            p.position.set(screenPos.x + (Math.random() - 0.5) * cfg.spread, screenPos.y);
            this.particlesContainer.addChild(p);
            
            gsap.to(p, {
                y: p.y - 80 - Math.random() * 40,
                alpha: 0,
                duration: 0.8,
                delay: i * 0.08,
                ease: 'power2.out',
                onComplete: () => this.particlesContainer.removeChild(p)
            });
        }
    }

    handleStageClick(e) {
        if (this.components.tutorial?.visible) return;
        
        const x = e.global.x;
        const y = e.global.y;
        const W = this.app.screen.width;
        const H = this.app.screen.height;
        const panelH = this.isLandscape() ? 105 : 145;
        
        if (y > H - panelH - 8) return;
        if (y < 50 && x < 160) return;
        if (y < 50 && x > W - 75) return;
        if (y > 42 && y < 82 && x > W - 95) return;
        
        document.getElementById('three-canvas').dispatchEvent(
            new MouseEvent('click', { clientX: x, clientY: y, bubbles: true })
        );
    }

    handleResize() {
        if (!this.app) return;
        
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.hitArea = this.app.screen;
        
        this.sparkles.forEach(s => {
            s.userData.baseX = Math.random() * this.app.screen.width;
            s.x = s.userData.baseX;
        });
        
        // Store if max items popup is showing
        const maxItemsPopupVisible = this.components.maxItemsPopup?.visible;
        
        if (this.components.tutorial?.visible) {
            this.uiContainer.removeChild(this.components.tutorial);
            this.showTutorial();
        }
        
        if (this.state.tutorialShown) {
            // Remove max items popup temporarily if exists
            if (this.components.maxItemsPopup) {
                this.uiContainer.removeChild(this.components.maxItemsPopup);
            }
            
            this.uiContainer.removeChildren();
            this.createMainUI();
            this.updateItemCounter(this.state.itemCount);
            this.updateDayNightUI(this.state.isDay);
            
            // Re-add max items popup if it was showing
            if (maxItemsPopupVisible && this.components.maxItemsPopup) {
                // Recreate popup for new dimensions
                const oldPopup = this.components.maxItemsPopup;
                oldPopup.destroy({ children: true });
                this.components.maxItemsPopup = null;
                this.showMaxItemsPopup();
            }
        }
    }

    updateAnimation() {
        const t = Date.now() * 0.001;
        
        this.sparkles.forEach(s => {
            const u = s.userData;
            s.x = u.baseX + Math.sin(t * u.speed + u.offset) * u.amplitude;
            s.alpha = 0.3 + Math.sin(t * 2 + u.offset) * 0.3;
            s.y -= 0.15;
            
            if (s.y < -10) {
                s.y = this.app.screen.height * 0.5;
                s.x = Math.random() * this.app.screen.width;
                u.baseX = s.x;
            }
        });
    }

    destroy() {
        this.removeAllListeners();
        if (this.app) this.app.destroy(true);
    }
}
