# 🎮 Toy Room - ULTRATHINK Edition

## The Vision

**Metaxas meets browser instruments** - Virtual synthesizers, drum machines, and chess engines as sculptural interactive objects on an infinite spatial canvas.

---

## What's Live Now

### District Layout
**Location:** y: 2400 (below the 2x2 grid of other districts)
**Size:** 2400×1000px (DOUBLE WIDTH - spans full horizontal space)
**Theme:** Golden gradient (amber/yellow) - playful, creative energy

### Interactive Toys (6 nodes)

#### 🎹 **2× Synthesizers**
- **Toy Synth 1** - Sine wave @ 440Hz (A4 note)
- **Toy Synth 2** - Square wave @ 220Hz (A3 note, octave lower)

**Features:**
- 4 waveforms: Sine, Square, Sawtooth, Triangle
- Frequency slider (110-880 Hz range)
- Web Audio API (no external dependencies)
- Visual feedback (green dot when playing)
- Purple gradient aesthetic

#### 🥁 **2× Drum Machines**
- **Drums 1** - 120 BPM, classic pattern
- **Drums 2** - 140 BPM, faster groove

**Features:**
- TR-808 style 16-step sequencer
- 3 tracks: Kick (red), Snare (blue), Hi-hat (green)
- Click squares to toggle steps
- Live playback with visual step indicator
- Reset button

#### ♟️ **2× Chess Boards**
- **Chess 1** - Starting position, play as White
- **Chess 2** - Mid-game position, play as Black

**Features:**
- Full 8×8 board with Unicode pieces
- Click to select, click to move
- FEN position support (save/load games)
- Dark wood aesthetic
- Reset to new game
- Ready for Stockfish.js integration

---

## Technical Implementation

### Node Types Registered:
```javascript
chess: ChessNode
synth: SynthNode
drummachine: DrumMachineNode
```

### Files Created:
- `src/components/nodes/ToyNodes.jsx` - All 3 toy node components
- `TOY-ROOM.md` - This documentation

### Integration Points:
- ✅ Added to PlacesDock navigation (bottom nav)
- ✅ Registered in nodeTypes
- ✅ Double-width district created
- ✅ 6 toy instances placed organically

---

## The Winamp Skin Parallel

These instruments are **skinnable** - community could create:
- 3D Moog System 55 model (from Sketchfab)
- Braun SK 55 turntable skin for music player
- Vintage Roland TR-808 skin for drum machine
- Sculptural Metaxas-style audio equipment

### Next Level: 3D Models
```tsx
// Load 3D turntable from Sketchfab
<Canvas>
  <Turntable
    model="braun-sk55"
    playing={isPlaying}
    onPlatterSpin={() => /* ... */}
  />
</Canvas>
```

---

## Browser-Ready Instrument Ecosystem

### What's Available (Can Add):

**Synthesizers:**
- Tone.js - Full DAW framework with synths, effects, sequencing
- Patchcab - Modular Eurorack style (like VCV Rack)
- Cardinal - Full VCV Rack in browser (1305 modules!)
- Web Audio Modules - OB-XD, Dexed, TAL Noisemaker

**Piano/Keyboards:**
- react-piano - Interactive keyboard with soundfonts
- WebAudioFont - Full GM instrument set
- MIDI.js - Browser MIDI support

**Chess Engines:**
- Stockfish.js - World's strongest chess engine (compiled to WASM)
- Lozza, P4wn - Lighter alternatives
- chessboard3.js - 3D WebGL board

**Drum Machines:**
- Already implemented! Expand with more patterns
- Add Web MIDI support for hardware controllers

---

## Spatial Advantages

On an infinite canvas, these become **kinetic sculptures**:

### Audio Routing
```
[Synth Node] ──cable──> [Mixer Node] ──cable──> [Audio Reactive Shader]
     │                        │                          │
     └──────────> [Drum Machine] ─────────> [Universe Background]
```

### Visual Feedback
- VU meters respond to audio analysis
- Synth waveform visualized in real-time
- Drum machine steps light up with beat
- Chess engine evaluation shown as spatial graph

### Peripheral Integration
```
[MIDI Keyboard Peripheral] ──cable──> [Piano Node]
                                          │
                                          └──> Sound Output
```

---

## Usage Examples

### Play a Synth:
1. Navigate to Toy Room (click dock button)
2. Find the purple synth cards
3. Select waveform (sine/square/sawtooth/triangle)
4. Drag frequency slider
5. Click "Play Note"

### Program a Beat:
1. Find the drum machine (black card)
2. Click squares to toggle steps (red=kick, blue=snare, green=hihat)
3. Click "Play" to start sequencer
4. Adjust BPM if needed

### Play Chess:
1. Find a chess board
2. Click a piece to select
3. Click destination square to move
4. Board shows FEN position below

---

## Future Enhancements

### Phase 2: Advanced Features
- [ ] Add Stockfish.js for computer opponent
- [ ] Synth presets (save/load patches)
- [ ] Drum pattern library
- [ ] MIDI input support
- [ ] Audio routing between nodes
- [ ] Audio recording/export

### Phase 3: 3D Models
- [ ] Load Moog System 55 3D model
- [ ] Animated platter on turntable
- [ ] VU meters respond to audio
- [ ] Knobs are interactive (control params)
- [ ] Cables visible between audio nodes

### Phase 4: Community
- [ ] Shareable synth patches (URLs)
- [ ] Chess positions as links
- [ ] Drum pattern sharing
- [ ] Custom skins/themes
- [ ] Instrument marketplace

---

## The Metaxas Connection

> "I wanted to display the kinetic art-like rolling platform, rather than hide it"

These toys show their **mechanism**:
- ✅ Drum sequencer shows all 16 steps
- ✅ Synth shows waveform type
- ✅ Chess shows full board state
- ✅ Not skeuomorphs - actual working instruments
- ✅ Kinetic sculptures that make sound/play games

---

## Navigation

**From Places Dock:**
Click the **Toy Room** button (golden icon, bottom navigation)

**Coordinates:**
District: (0, 2400) to (2400, 3400)
Center: (1200, 2900)

**Neighbors:**
- Above: Study (left) and Strategy (right)
- Full width spans both columns

---

## Code Snippets

### Add a New Synth Instance:
```jsx
{
  id: 'custom-synth',
  type: 'synth',
  position: { x: 1800, y: 600 },
  parentNode: 'd-toyroom',
  data: {
    waveform: 'triangle',
    frequency: 330 // E4 note
  }
}
```

### Add a Chess Position:
```jsx
{
  id: 'chess-puzzle',
  type: 'chess',
  position: { x: 1000, y: 300 },
  parentNode: 'd-toyroom',
  data: {
    playerColor: 'white',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'
  }
}
```

---

## Status

**Built:** ✅ Complete
**Live:** http://192.168.68.73:5174/
**Navigate:** Click "Toy Room" in bottom dock
**Instruments:** 2 synths, 2 drum machines, 2 chess boards
**District Size:** 2400×1000px (double width!)

---

**The Toy Room is where you PLAY with technology** 🎮🎹♟️

*"Virtual instruments & games on an infinite canvas. Play chess, make music, experiment."*
