# 🌱 GardenMakeover

A 3D garden design web game where you can create your dream garden with beautiful GLB models.

## 🎮 How to Play

1. **Start**: Click "Let's Go!" on the welcome screen
2. **Select**: Choose a category and item from the bottom panel
3. **Place**: Click on the grass to place items
4. **Delete**: Click on any placed item to remove it (turns red when hovering)
5. **Design**: Create your perfect garden! (max 15 items in free version)

## 🎛️ Controls

| Action | Control |
|--------|---------|
| Place item | Click on grass |
| Delete item | Click on placed item |
| Zoom in/out | Mouse wheel |
| Orbit camera | CTRL + Right click + Drag |
| Pan camera | CTRL + Left click + Drag |
| Day/Night toggle | ☀️/🌙 button (top right) |
| Mute/Unmute | 🔊/🔇 button (below counter) |

### Cursor Feedback
- **Open hand** ✋ - When CTRL is pressed (camera mode ready)
- **Closed hand** ✊ - When dragging to orbit/pan
- **Red X** ❌ - Hovering over item to delete
- **Red highlight** - Item tints red when selected for deletion

## 🌿 Available Items

### Plants (GLB Models)
- 🍅 **Tomato** - Fresh tomato plant
- 🌽 **Corn** - Tall corn stalk
- 🍓 **Strawberry** - Sweet strawberry plant

### Furniture
- 🪵 **Table** - Round garden table
- ⛲ **Fountain** - Stone water fountain

### Decor
- 🏮 **Lantern** - Japanese-style lantern (glows at night!)
- 🪨 **Rock** - Decorative garden rock

## ✨ Features

- **3D GLB Models**: High-quality 3D models for plants
- **Day/Night Cycle**: Toggle between day and night modes
- **Delete Objects**: Click to remove placed items with animation
- **Hover Feedback**: Items highlight red when hovering to delete
- **Responsive UI**: Works on desktop, tablet, and mobile
- **Particle Effects**: Sparkles and placement animations
- **Dynamic Lighting**: Lanterns glow at night
- **Camera Controls**: Zoom, orbit, and pan with cursor feedback
- **Background Music**: Relaxing theme music (toggleable)
- **Sound Effects**: Place and delete sounds
- **Mute Toggle**: Control all audio with one button
- **Fancy Fonts**: Fredoka & Nunito Google Fonts
- **Upgrade Popup**: Shows when max items reached

## 🔊 Audio

| Sound | Trigger |
|-------|---------|
| Theme Music | Starts after tutorial (loops) |
| Place Sound | When placing an item |
| Delete Sound | When removing an item |

Use the 🔊 button to mute/unmute all sounds.

## 🚀 Running the Game

Due to loading GLB models, you need to run from a local server:

```bash
cd garden-makeover
python -m http.server 8000
```

Then open: http://localhost:8000

## 📁 Project Structure

```
garden-makeover/
├── index.html
├── README.md
├── GardenMakeover_README.pdf
├── assets/
│   ├── images/
│   │   ├── icon.png          # App logo
│   │   ├── tomato.png        # Tomato icon
│   │   ├── corn.png          # Corn icon
│   │   └── strawberry.png    # Strawberry icon
│   ├── gltf/
│   │   ├── tomato.glb        # Tomato 3D model
│   │   ├── corn.glb          # Corn 3D model
│   │   └── strawberry.glb    # Strawberry 3D model
│   └── sounds/
│       ├── theme.mp3         # Background music
│       ├── place.mp3         # Placement sound
│       └── delete.mp3        # Delete sound
└── js/
    ├── main.js
    ├── Game.js
    ├── core/
    ├── loaders/
    ├── factories/
    └── managers/
```

## 🛠️ Technologies

- **Three.js r128** - 3D rendering
- **Pixi.js 7.3.2** - 2D UI rendering
- **GSAP 3.12.2** - Animations
- **Google Fonts** - Fredoka & Nunito

## 📱 Responsive Design

- **Mobile Portrait**: 40% scene scale, compact UI
- **Mobile Landscape**: 100% scene scale
- **Desktop**: Full-size UI and scene

## 🎨 UI Components

- **Logo Header**: App icon and title
- **Day/Night Button**: Toggle time of day
- **Item Counter**: Shows X/15 items placed
- **Mute Button**: Toggle all sounds 🔊/🔇
- **Category Tabs**: Plants, Furniture, Decor
- **Item Grid**: Visual item selection with icons
- **Tutorial Overlay**: First-time instructions
- **Upgrade Popup**: Premium features preview

---

Enjoy designing your garden! 🌻
