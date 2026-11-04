# Implementation Plan: Framer Strata Dynamic Masonry & 3D Infinite Gallery

Port and recreate the Framer **Dynamic Masonry CMS & 3D Infinite Gallery** (`Strata-D0MRLF`) component directly into the KALA Blossoms 2026–27 gallery section. The component replicates the exact layout, controls, and physics from the reference screenshot and Framer module, featuring dual view modes, 7 stance perspective presets, infinite wrap-around columns, drag-momentum inertia, and full-screen lightbox exploration.

---

## 1. Architecture & Component Blueprint

```
src/
├── features/gallery/
│   ├── GalleryPage.tsx               # Primary page container & view-state coordinator
│   ├── galleryData.ts                # 15 fest photos with aspect ratios, tags & metadata
│   └── components/
│       ├── StrataGallery.tsx         # Master component coordinating Dual Views & Controls
│       ├── ViewSwitcherPill.tsx      # Top-left [CMS Masonry | 3D Infinite Gallery] pill
│       ├── StanceBarPill.tsx         # Top-center [Tilt, Deck, Depth, Plain, Skew, Turn, Sweep] selector
│       ├── Infinite3DGallery.tsx     # 3D interactive infinite canvas with perspective & drag physics
│       ├── DynamicMasonryView.tsx    # Responsive Pinterest-style CMS masonry layout with category tags
│       ├── EdgeVeilVignette.tsx      # Top/bottom chromatic dispersion & gradient fade horizon
│       └── GalleryLightbox.tsx       # Immersive full-screen media viewer with keyboard/swipe navigation
```

---

## 2. Technical Math & Physics Specifications

### A. 3D Camera Angles & Stance Poses (Derived from Framer Strata)
Each stance adjusts `depth` (CSS `perspective`), 3D rotational Euler angles (`rotateX`, `rotateY`, `rotateZ`), and camera scale `zoom`:

| Stance Key | Label | Perspective Depth | rotateX (deg) | rotateY (deg) | rotateZ (deg) | Zoom | Visual Effect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`plain`** *(default)* | Plain | `20000px` | `0°` | `0°` | `0°` | `1.0` | Clean flat orthographic grid with infinite pan |
| **`tilt`** | Tilt | `1200px` | `20°` | `-15°` | `5°` | `1.0` | Natural 3D isometric tilt with dramatic horizon |
| **`deck`** | Deck | `1200px` | `60°` | `0°` | `0°` | `1.0` | Slanted top-down inclined trading card deck |
| **`depth`** | Depth | `400px` | `0°` | `0°` | `0°` | `0.8` | Deep dynamic zoom tunnel into the scene |
| **`skew`** | Skew | `1200px` | `0°` | `0°` | `10°` | `0.95` | Playful angular pitch and diagonal drift |
| **`turn`** | Turn | `1000px` | `0°` | `30°` | `0°` | `0.9` | Yaw rotated side-angle architectural view |
| **`sweep`** | Sweep | `800px` | `0°` | `-30°` | `0°` | `0.9` | Reverse yaw sweep with strong perspective convergence |

### B. Infinite Reach & Column Looping Math
To ensure the tilted 3D plane never reveals empty voids or borders during dragging or auto-drift:
- **`laneReach` calculation**: Computes vertical reach $H_{\text{need}} = \frac{H_{\text{viewport}}}{2} \cdot \frac{\text{depth}}{\text{depth} \cos(\theta) - \frac{H}{2}\sin(\theta)}$ when $\theta > 0$.
- **`copiesFor(laneSpan, need)`**: Dynamically duplicates card tiles ($3\times$ to $8\times$) based on total lane height so seamless wrap-around occurs modulo lane height ($Y \pmod{\text{laneSpan}}$).
- **Inertial Momentum**: Integrates pointer velocity on `pointerup` with smooth exponential damping ($v_{t+1} = v_t \times 0.94$). Supports touch pan, mouse drag, and optional gentle auto-drift.

---

## 3. Phased Execution Roadmap

### Stage 1: Component Infrastructure & Data Models
- Update `galleryData.ts` to enrich all 15 fest photos (`g1.PNG` through `g15.PNG`) with explicit dimensions, height spans, and category taxonomy (`Arts`, `Literature`, `Stage`, `Campus`).
- Build `ViewSwitcherPill.tsx` with Framer-style dark translucent pill and active white indicator for `CMS Masonry` and `3D Infinite Gallery`.
- Build `StanceBarPill.tsx` with horizontal pill options (`Tilt`, `Deck`, `Depth`, `Plain`, `Skew`, `Turn`, `Sweep`) and smooth active pill animations.

### Stage 2: 3D Infinite Canvas Implementation (`Infinite3DGallery.tsx`)
- Implement `transform-style: preserve-3d` viewport with dynamic `perspective` depth and stance interpolation.
- Create 4-column lane packing algorithm (`packLanes`) distributing photos evenly by height.
- Add pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) with velocity tracker, boundary-free infinite wrapping, and friction damping.
- Add card hover micro-interactions: smooth scale ($1.04\times$), subtle elevation shadow, and image brightness lift.
- Implement `EdgeVeilVignette.tsx` for top horizon blur and subtle chromatic dispersion edge fade.

### Stage 3: Dynamic Masonry CMS Layout (`DynamicMasonryView.tsx`)
- Build responsive CSS column masonry ($4$ columns on desktop $\ge 1280\text{px}$, $3$ on tablet, $2$ on mobile).
- Add category filter tabs (`All`, `Arts`, `Literature`, `Stage`, `Campus`) with zero layout shift.
- Support diverse tile shapes (regular, tall, wide banner) based on the image aspect ratios.

### Stage 4: Lightbox, Accessibility & Polish
- Connect both views to the full-screen interactive lightbox viewer with high-resolution image zoom, navigation arrows, touch swipe, and `Escape` key support.
- Add dark theater canvas backdrop (`#0a0a0c`) as requested.
- Ensure 60/120 FPS performance with hardware-accelerated CSS `transform: translate3d(...)`.
- Verify mobile touch responsiveness and fallback support for `prefers-reduced-motion`.

---

## 4. Verification & Testing Criteria
1. **View Toggle**: Clicking between `CMS Masonry` and `3D Infinite Gallery` switches layouts instantly without stutter or re-fetching.
2. **3D Stances**: Clicking each of the 7 stance pills smoothly transitions camera perspective, tilt angles, and scale.
3. **Infinite Drag**: Dragging in 3D mode pans continuously with momentum; cards loop seamlessly without blank gaps.
4. **Lightbox**: Clicking any card in either view opens the full-screen modal with accurate photo titles and keyboard navigation.
5. **Compilation & Linting**: Clean execution of `compile_applet` and `lint_applet` with zero TypeScript errors.
