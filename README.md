# Terra OS - Spatial Operating System

A proof-of-concept "Spatial Operating System" that reimagines the desktop experience as an infinite workspace with distinct districts, smart agent appliances, and magnetic workflows.

## The Halcyon Philosophy

> *"In the age of infinite notifications, we crave a computer that feels like a garden, not a terminal."*

Terra OS is built on the principles of **Halcyon Computing**: calm, organic, and spatially persistent. It rejects the ephemeral chaos of modern operating systems in favor of:

1.  **Memory Palaces**: Instead of hidden file trees, data lives in "Districts" (Study, Studio, Garden). You remember where your "Quarterly Report" is because you placed it *physically* next to the coffee cup in the Study, not because you searched for `report.pdf`.
2.  **Project Graveyards**: Dead projects shouldn't be deleted; they should be allowed to compost. In Terra OS, old nodes aren't trash—they are moved to the "Periphery," becoming visual history that informs future work, much like ruins in a landscape.
3.  **Digital Jewelry Box**: The interface is a precious container. You open it to find your tools exactly where you left them, resting in their decorative locations, waiting for your hand to pick them up.

## Future Vision

See [FUTURE_VISION.md](./FUTURE_VISION.md) for the roadmap on:
- **Winamp Skins** (Visual Anarchy)
- **Zines** (Publisher Primitives)
- **Atmospheres** (Audio-Reactive Shaders)
- **The Toolbelt** (Persistent Utilities)
- **Jump Context** (Dimensional Navigation)

## Core Concepts

- **Districts**: Colored zones representing different work areas (Study, Studio, Playground, Vault)
- **Agent Appliances**: Smart primitives with permission gates that execute AI skills
- **Stacks**: Interactive file collections that "fan out" when clicked
- **Magnetic Workflows**: Cards automatically snap into alignment when moved close together
- **Terminal Drawer**: Collapsible system log console for monitoring agent activity

## Tech Stack

- **React** + **Vite** - Fast development environment
- **@xyflow/react** - Canvas-based spatial interface
- **framer-motion** - Smooth animations for stacks and transitions
- **lucide-react** - Icon library

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Features

### Smart Primitives (Agent Cards)
- Dark mode, glassmorphism design
- Permission toggle (LOCKED vs AUTHORIZED)
- Visual glow effect when active
- Execute AI skills with logging to terminal

### Interactive Stacks
- Click to fan out files in a stack
- Smooth animations using Framer Motion
- Visual card-based file representation

### Terminal Drawer
- Collapsible console at bottom-right
- Real-time system event logging
- Monospace styling with green terminal aesthetic

### Magnetic Snap
- Automatic grid snapping (50px increments)
- Smooth transitions when moving nodes
- Logs movement events

## Project Structure

```
SpatialOS/
├── src/
│   ├── App.jsx          # Main Terra OS component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Development Notes

- The canvas supports pan and zoom (min: 0.2x, max: 2x)
- Districts are positioned at coordinate offsets (e.g., Study at 0,0, Studio at 1400,0)
- Agent cards require authorization before skills can execute
- All agent actions log to the terminal drawer

## Future Enhancements

- Add more districts (Playground, Vault)
- Implement district navigation HUD
- Enhance magnetic snap logic (proximity-based)
- Add more agent types and skills
- Implement edge connections between agents

