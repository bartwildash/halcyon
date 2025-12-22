# SpatialOS: Extended Reality & The "Breakout" Interface

## Concept: The Digital "Jewelry Box"
Currently, SpatialOS acts as an infinite 2D canvas (the "Folio"). In a Mixed Reality (MR) or Augmented Reality (AR) context, we reframe the tablet/display not as the *only* workspace, but as the **Storage Container** or **Anchor**.

Imagine the tablet as a magic box. You open it to find your tools arranged in their "decorative locations" (the Districts). You can work there, OR you can reach in, pluck an item out, and place it in your real room.

---

## 1. Interaction Model: "Pluck & Place"

### The Gesture
- **Hold**: Long-press a node (using the existing `SwayWrapper` logic).
- **Pull**: Instead of dragging X/Y, drag **Z-axis** (towards you).
- **Breakout**: The node "pops" off the screen surface with a haptic thud. It is now a 3D object in your hand.

### State Transitions
1.  **In-Box (2D/2.5D)**: The node lives on the React Flow canvas. It is flat, decorative, and constrained to its District.
2.  **In-Hand (3D)**: As you pull it out, the card gains depth. 
    - *Agent Cards* extrude into chunky, physical appliances.
    - *Notes* become floating pieces of paper with transparency.
    - *Avatars* become spherical bubbles (Vision Pro style).
3.  **In-World (Anchored)**: You place the object on your real desk or pin it to a wall. It stays there, persisted via Spatial Anchors.

---

## 2. Returning to the Box: "Magnetic Reversion"

The user asked for items to *"drop them back the 'box' in their places, and again revert in a familiar space to their decorative locations."*

### The Tether System
When an object is taken out of SpatialOS, a faint, glowing **tether** connects it back to its original slot on the tablet screen. This visualizes the link between the "Real World Instance" and the "Digital Home."

### The Drop
- **Gesture**: Grab the floating object and "throw" or "drop" it towards the tablet screen.
- **Animation**:
    1.  **The Shrink**: As it approaches the screen, it scales down.
    2.  **The Flatten**: It loses its Z-depth, turning back into a card.
    3.  **The Snap**: It doesn't just land anywhere; it **springs** back to its original X/Y coordinates in its specific District (Study, Studio, etc.).
    4.  **The Settle**: It wobbles slightly (using the `SwayWrapper` physics) to indicate it has landed safely.

---

## 3. Use Case Scenarios

### Scenario A: The Studio Wall
*You are working on the "Inspiration" Stack in the Studio District.*
1.  You pinch the Stack node.
2.  You pull it out of the screen.
3.  You "throw" it at your physical living room wall.
4.  The stack explodes, tiling your real wall with the images from the stack.
5.  **Cleanup**: You tap a "Gather" button on the tablet. The images fly off the wall, swirl into a deck, and slam back into the `StackNode` on the screen.

### Scenario B: The Social Coffee Table
*You are looking at the "Social Garden" in the Garden District.*
1.  You see the "Design Team" group node.
2.  You drag it onto your real coffee table.
3.  The node expands into a spatial audio circle. The avatars of your team float around the table center.
4.  When the call ends, the avatars dissolve and flow back into the single "Group Node" on your tablet.

### Scenario C: Peripheral Passthrough
*You have the "Device Hub" node.*
1.  You pull the Device Hub out.
2.  You place it next to your real MacBook.
3.  The node detects the real device (via AR object recognition) and snaps a visual UI overlay *on top* of your real keyboard, showing shortcuts or macros.

---

## 4. Technical Implementation Path

To prototype this using the current stack:

1.  **WebXR Support**:
    - Use `react-three-fiber` or `A-Frame` overlays on top of the `ReactFlow` canvas.
    - When `isDragging` and `zForce > threshold`, hide the React component and spawn a Three.js mesh at the same screen coordinates.

2.  **The "Ghost" State**:
    - When a node is removed, leave a semi-transparent "Ghost" or "Socket" on the 2D canvas.
    - This socket waits for the return event to trigger the snap animation.

3.  **Visual Consistency**:
    - Ensure the CSS styles of the cards match the textures of the 3D models exactly so the transition is seamless.

---

## 5. Philosophy of Space: Graveyards & Palaces

This spatial approach leverages two powerful analogies for information management that 2D desktops ignore:

### The Memory Palace (Loci Method)
In a traditional OS, files are lost in deep folder hierarchies. In SpatialOS/AR, we use the **Memory Palace**.
- **Spatial Anchoring**: You don't remember that the "Q3 Strategy" is in `Users/Docs/Work/Q3`. You remember that you left it **floating above the ficus plant** in the corner of your real office.
- **Contextual Recall**: When you walk into your physical "Studio," your AR glasses automatically pull the relevant SpatialOS tools out of the box and place them on your desk. The room *is* the folder.

### The Project Graveyard
We fear deleting things, so we hoard files until our desktops are chaos. The SpatialOS "Jewelry Box" offers a different path: **The Project Graveyard**.
- **Composting Ideas**: When a project is finished, you don't delete it. You shrink it down and drag it to the "Periphery" of the District (or the back of the real room).
- **Visual History**: These old nodes remain as "ruins" or "monuments." They collect digital dust (visual filters). They aren't active, but their presence reminds you of where you've been.
- **Resurrection**: Sometimes, an old idea is needed. You walk over to the "Graveyard," dust off an old node, and bring it back to the active "Workbench." This makes the computing experience feel like an evolving civilization, not a disposable scratchpad.
