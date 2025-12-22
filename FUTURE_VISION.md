# SpatialOS: Future Vision & Architecture

> *"The computer is a room, not a tool. You don't just use it; you inhabit it."*

This document outlines the roadmap for evolving SpatialOS from a 2D canvas into a fully inhabitable digital environment. It introduces four interlocking layers: **Skins**, **Zines**, **Atmospheres**, and the **Toolbelt**.

---

## 1. Winamp Skins: The Philosophy of "Visual Anarchy"

Modern theming is too safe. It offers accent color pickers and light/dark modes.
**Halcyon Computing** looks back to the Winamp era: **Total decoupling of container and function.**

### The Concept
A music player can look like a spaceship, a wooden radio, or a brutalist slab of concrete. In SpatialOS, the "skin" dictates the physics, the grid, the window shapes, and the sound design.

### Implementation
Skins are tradeable, shareable artifacts (`.hskin`).

```typescript
interface HalcyonSkin {
  id: string;
  name: string;
  author: string;
  
  // Visual Tokens
  surfaces: Record<string, SurfaceStyle>;  // textures for cards, boxes, frames
  typography: TypographySet; // Hand-drawn, terminal, serif
  borders: BorderSet; // Rough edges, neon lines, invisible
  
  // Spatial Tokens
  gridStyle: 'dots' | 'lines' | 'none' | 'isometric-grid';
  backgroundShader?: ShaderConfig;
  
  // Audio Design (Skins have sounds)
  sounds?: {
    connect?: AudioRef;    // The 'click' of a cable
    disconnect?: AudioRef;
    drop?: AudioRef;       // The 'thud' of a heavy card
    navigate?: AudioRef;   // The 'whoosh' of changing districts
  };
}
```

---

## 2. Zines: The Publisher Primitive

Frames constrain *input*. Zines constrain *output*.

### The Concept
A **Zine** is a curated selection of content from your spatial board, laid out intentionally, and exported. It brings the "Lo-Fi" aesthetic to sharing. Instead of sending a Google Doc link, you send a digital (or printable) Zine.

### Workflow
1.  **Select**: Lasso a group of cards on the canvas.
2.  **Create Zine**: Opens a specialized Editor Frame.
3.  **Layout**: Arrange content on pages (A5, Half-Letter).
4.  **Skin**: Apply a visual style (Photocopied, Risograph, Clean).
5.  **Export**: PDF, HTML, or `png-sequence`.

```typescript
interface Zine {
  title: string;
  layout: 'saddle-stitch' | 'accordion' | 'scroll';
  pages: ZinePage[];
  sourceCards: string[]; // Linked to original spatial nodes
}
```

---

## 3. Atmospheres: Music Space & Shaders

A District is not just a coordinate on a map; it is a **Cognitive Space**.
Different thinking requires different environments.

### The Concept
*   **The Study**: Quiet. Paper texture background. No audio. High friction.
*   **The Studio**: Energetic. Generative, audio-reactive shaders pulsing to your playlist. Low friction.
*   **The Garden**: Organic. Slowly evolving "Game of Life" cellular automata background. Ambient bird/nature sounds.

### Architecture
Each district has an `AtmosphereConfig`:
*   **Shader**: `noise-flow` | `particle-field` | `wave-interference`
*   **Reactivity**: Does the background move when I speak? When music plays?
*   **Audio**: Generative stems or playlist integration.

---

## 4. The Toolbelt: Persistent Utility Layer

You are always *somewhere* on the canvas, but you need your tools *everywhere*.

### The Concept
A floating strip (Command Center) that transcends spatial context. It holds utilities that are **always running**.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ▶ Now Playing: Tycho - Awake   advancement ████████░░  │ 🍅 18:42 │ 📋 3 │ 📅 2 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Slots
1.  **Music Player**: Persistent playback (Spotify/Apple Music bridge).
2.  **Chronometer**: Pomodoro timer that doesn't reset when you switch districts.
3.  **Clipboard**: A history of the last 5 things you copied, ready to drag-and-drop.
4.  **Calendar Peek**: "Next meeting in 10m."
5.  **Pocket**: A temporary holding slot for a card you want to move between districts.

---

## 5. Jump Context: The Navigation Layer

Navigation is not just X/Y panning. It is dimensional.

### The "Jump" Palette (⌘K)
Instead of searching for files, you **Jump** to contexts.

| Jump Type | Example |
| :--- | :--- |
| **Spatial** | "Jump to **STUDIO**" |
| **Temporal** | "Jump to **Yesterday Morning**" (Time travel) |
| **Semantic** | "Jump to **#project-alpha**" (Tags) |
| **Entity** | "Jump to **Sarah**" (Social location) |
| **Modal** | "Jump to **Focus Mode**" |

### Modal Jumps
"Focus Mode" is a **Context Transformation**:
*   Hides all cards except the active Frame.
*   Collapses the Toolbelt to minimal.
*   Mutes notifications.
*   Changes Atmosphere to "Deep Focus" (Dark mode, rain sounds).

---

## Summary: The Interlocking Layers

| Layer | Component | Purpose |
| :--- | :--- | :--- |
| **Visual** | **Skins** | Total customization, shaders, sound design. |
| **Persistent** | **Toolbelt** | Always-on utilities (Music, Timer). |
| **Navigation** | **Jump** | Moving through Space, Time, and Context. |
| **Environment** | **Atmosphere** | Audio-reactive shaders defining the "Vibe." |
| **Output** | **Zine** | Curated export of your spatial thoughts. |

