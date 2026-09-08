# Magic Tree 3D QR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully client-side "Magic Tree" feature to OptiLink that renders any URL as an interactive 3D tree (Three.js) whose foliage/pedestal encode a real, scannable QR code, matching `specs/MAGIC_TREE_QR_SPEC.md` v2.0.0.

**Architecture:** Pure-logic QR matrix + share-state modules (unit tested) feed a vanilla-Three.js engine (scene/camera/geometry builders, no React reconciler involved), which a single React container mounts via `useEffect` and drives with debounced rebuilds. No backend changes.

**Tech Stack:** React 19 + Vite (existing), `three` + `@types/three` (new), `qrcode-generator` (new), `vitest` (new, dev-only — repo has no test runner yet, added specifically for the pure-logic modules where automated tests matter).

**Spec:** `specs/MAGIC_TREE_QR_SPEC.md` (v2.0.0)

## Global Constraints
- **Never commit `specs/` or `.claude/`** — both stay local-only for this feature (per explicit instruction; `specs/` is also gitignored already).
- **Never work directly on `main`** — all work happens on feature branches.
- Commit messages and PR titles use **Conventional Commits** (`feat(magic-tree): ...`, `test(magic-tree): ...`, `chore(magic-tree): ...`). **Titles must not contain any attribution text.** Commit bodies still end with the standard `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` trailer per this session's convention — that trailer is body-only, never in the title/subject line.
- **Stage = branch + PR.** Stage 1 branches off `main`; each subsequent stage branches off the previous stage's tip (stacked), so work is never blocked on a merge happening first. Every step inside a stage ends in its own commit; the stage ends with `git push` + `gh pr create`.
- **Cost-tiered subagents per step, not per stage:** implementation steps (writing code) use the standard/full-capability agent; review, QA, and verification steps use a cheaper/lower-effort agent (lower reasoning effort or a smaller model) — these steps only need to check correctness against this plan, not design anything.
- Zone classification (`finder` / `canopy` / `ground`) is computed once by `QRMatrixBuilder` and consumed everywhere else — no re-deriving it in geometry builders.
- All Three.js geometries/materials/textures created during a rebuild must be tracked and disposed on the next rebuild and on unmount — no leaks.

---

## Stage 1 — Foundation: QR matrix + share-state (pure logic, unit tested)
**Branch:** `feature/magic-tree-qr` (off `main`)
**PR title:** `feat(magic-tree): add QR matrix builder and share-state codec`

### Task 1: Install dependencies + test runner

**Files:**
- Modify: `client/package.json`
- Create: `client/vitest.config.ts`

- [ ] **Step 1: Install runtime deps**

```bash
cd client
npm install three qrcode-generator
npm install -D @types/three vitest
```

- [ ] **Step 2: Add vitest config**

`client/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add a `test` script**

In `client/package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

- [ ] **Step 4: Verify the toolchain runs (no tests yet, should report 0 passed)**

Run: `cd client && npm test`
Expected: exits 0, "No test files found" or similar — confirms vitest is wired up before any real test is written.

- [ ] **Step 5: Commit**

```bash
git add client/package.json client/package-lock.json client/vitest.config.ts
git commit -m "chore(magic-tree): add three, qrcode-generator, vitest"
```

---

### Task 2: Season/palette config types

**Files:**
- Create: `client/src/components/MagicTreeQR/types/magicTree.ts`

**Interfaces:**
- Produces: `SeasonId`, `PaletteId`, `SeasonTheme`, `SEASON_THEMES: Record<SeasonId, SeasonTheme>`, `PalettePreset`, `PALETTE_PRESETS: PalettePreset[]`, `MagicTreeConfig`, `DEFAULT_CONFIG: MagicTreeConfig` — every later task imports these exact names.

- [ ] **Step 1: Write the file**

```ts
export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherKind = 'sakura' | 'sunbeam' | 'leavesRain' | 'snow';
export type PaletteId = 'rose' | 'violet' | 'crimson' | 'gold' | 'azure' | 'silver';

export interface SeasonTheme {
  id: SeasonId;
  label: string;
  canopyPrimary: string;
  canopySecondary: string;
  trunk: string;
  groundLight: string;
  groundDark: string;
  background: string;
  weather: WeatherKind;
}

export const SEASON_THEMES: Record<SeasonId, SeasonTheme> = {
  spring: {
    id: 'spring',
    label: 'Xuân',
    canopyPrimary: '#FFB7C5',
    canopySecondary: '#F472B6',
    trunk: '#8B5A2B',
    groundLight: '#FDFBF7',
    groundDark: '#FBCFE8',
    background: '#F6F1E7',
    weather: 'sakura',
  },
  summer: {
    id: 'summer',
    label: 'Hạ',
    canopyPrimary: '#22C55E',
    canopySecondary: '#15803D',
    trunk: '#5C4033',
    groundLight: '#FEF3C7',
    groundDark: '#334155',
    background: '#FAF7EE',
    weather: 'sunbeam',
  },
  autumn: {
    id: 'autumn',
    label: 'Thu',
    canopyPrimary: '#F59E0B',
    canopySecondary: '#DC2626',
    trunk: '#6B4423',
    groundLight: '#E5E7EB',
    groundDark: '#475569',
    background: '#EDE8DF',
    weather: 'leavesRain',
  },
  winter: {
    id: 'winter',
    label: 'Đông',
    canopyPrimary: '#E2E8F0',
    canopySecondary: '#93C5FD',
    trunk: '#374151',
    groundLight: '#F8FAFC',
    groundDark: '#CBD5E1',
    background: '#F1F5F9',
    weather: 'snow',
  },
};

export interface PalettePreset {
  id: PaletteId;
  label: string;
  color: string;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  { id: 'rose', label: 'Pastel Rose', color: '#FFB7C5' },
  { id: 'violet', label: 'Royal Violet', color: '#A855F7' },
  { id: 'crimson', label: 'Crimson Red', color: '#EF4444' },
  { id: 'gold', label: 'Golden Glow', color: '#EAB308' },
  { id: 'azure', label: 'Azure Blue', color: '#3B82F6' },
  { id: 'silver', label: 'Silver Stealth', color: '#94A3B8' },
];

export interface MagicTreeConfig {
  targetUrl: string;
  season: SeasonId;
  palette: PaletteId;
}

export const DEFAULT_CONFIG: MagicTreeConfig = {
  targetUrl: 'https://optilink.app',
  season: 'spring',
  palette: 'rose',
};
```

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors mentioning `magicTree.ts`.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/types/magicTree.ts
git commit -m "feat(magic-tree): add season and palette config tables"
```

---

### Task 3: QR matrix builder

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/QRMatrixBuilder.ts`
- Test: `client/src/components/MagicTreeQR/engine/QRMatrixBuilder.test.ts`

**Interfaces:**
- Consumes: none (leaf module).
- Produces: `type CellZone = 'finder' | 'canopy' | 'ground'`, `interface QRGridData { size: number; matrix: boolean[][]; zones: CellZone[][] }`, `buildQRMatrix(url: string): QRGridData` (throws `Error` on empty input), `cellToWorld(r: number, c: number, size: number, cellSize?: number): { x: number; z: number }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { buildQRMatrix, cellToWorld } from './QRMatrixBuilder';

describe('buildQRMatrix', () => {
  it('throws on empty input', () => {
    expect(() => buildQRMatrix('   ')).toThrow();
  });

  it('produces a square matrix with matching zone grid', () => {
    const grid = buildQRMatrix('https://optilink.app');
    expect(grid.matrix.length).toBe(grid.size);
    expect(grid.zones.length).toBe(grid.size);
    grid.matrix.forEach((row) => expect(row.length).toBe(grid.size));
    grid.zones.forEach((row) => expect(row.length).toBe(grid.size));
  });

  it('classifies the top-left 7x7 corner as finder', () => {
    const grid = buildQRMatrix('https://optilink.app');
    expect(grid.zones[0][0]).toBe('finder');
    expect(grid.zones[6][6]).toBe('finder');
  });

  it('classifies the three finder corners, not a fourth', () => {
    const grid = buildQRMatrix('https://optilink.app');
    const n = grid.size;
    expect(grid.zones[0][n - 1]).toBe('finder'); // top-right
    expect(grid.zones[n - 1][0]).toBe('finder'); // bottom-left
    expect(grid.zones[n - 1][n - 1]).not.toBe('finder'); // bottom-right has none
  });

  it('classifies the exact center as canopy', () => {
    const grid = buildQRMatrix('https://optilink.app');
    const mid = Math.floor((grid.size - 1) / 2);
    expect(grid.zones[mid][mid]).toBe('canopy');
  });
});

describe('cellToWorld', () => {
  it('maps the matrix center to world origin', () => {
    const size = 25;
    const mid = (size - 1) / 2;
    const { x, z } = cellToWorld(mid, mid, size);
    expect(x).toBeCloseTo(0);
    expect(z).toBeCloseTo(0);
  });

  it('maps row/col to z/x respectively, scaled by cellSize', () => {
    const { x, z } = cellToWorld(0, 1, 3, 2);
    // mid = 1, so col 1 -> x = 0, row 0 -> z = -1 * 2 = -2
    expect(x).toBeCloseTo(0);
    expect(z).toBeCloseTo(-2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd client && npx vitest run src/components/MagicTreeQR/engine/QRMatrixBuilder.test.ts`
Expected: FAIL — `QRMatrixBuilder.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
import qrcode from 'qrcode-generator';

export type CellZone = 'finder' | 'canopy' | 'ground';

export interface QRGridData {
  size: number;
  matrix: boolean[][];
  zones: CellZone[][];
}

export function buildQRMatrix(url: string): QRGridData {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('URL is required to build a QR matrix');
  }

  const qr = qrcode(0, 'H');
  qr.addData(trimmed);
  qr.make();

  const size = qr.getModuleCount();
  const mid = (size - 1) / 2;
  const canopyRadius = 0.38 * size;

  const matrix: boolean[][] = [];
  const zones: CellZone[][] = [];

  for (let r = 0; r < size; r++) {
    matrix[r] = [];
    zones[r] = [];
    for (let c = 0; c < size; c++) {
      matrix[r][c] = qr.isDark(r, c);
      zones[r][c] = classifyZone(r, c, size, mid, canopyRadius);
    }
  }

  return { size, matrix, zones };
}

function classifyZone(
  r: number,
  c: number,
  size: number,
  mid: number,
  canopyRadius: number
): CellZone {
  const inTopLeft = r <= 7 && c <= 7;
  const inTopRight = r <= 7 && c >= size - 8;
  const inBottomLeft = r >= size - 8 && c <= 7;
  if (inTopLeft || inTopRight || inBottomLeft) return 'finder';

  const dr = r - mid;
  const dc = c - mid;
  if (Math.sqrt(dr * dr + dc * dc) <= canopyRadius) return 'canopy';

  return 'ground';
}

export function cellToWorld(
  r: number,
  c: number,
  size: number,
  cellSize = 1
): { x: number; z: number } {
  const mid = (size - 1) / 2;
  return {
    x: (c - mid) * cellSize,
    z: (r - mid) * cellSize,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd client && npx vitest run src/components/MagicTreeQR/engine/QRMatrixBuilder.test.ts`
Expected: PASS, all 7 assertions.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/QRMatrixBuilder.ts client/src/components/MagicTreeQR/engine/QRMatrixBuilder.test.ts
git commit -m "feat(magic-tree): add QR matrix builder with zone classification"
```

---

### Task 4: Share-state URL codec

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/shareState.ts`
- Test: `client/src/components/MagicTreeQR/engine/shareState.test.ts`

**Interfaces:**
- Consumes: `MagicTreeConfig`, `DEFAULT_CONFIG`, `SeasonId`, `PaletteId` from `../types/magicTree`.
- Produces: `encodeShareState(config: MagicTreeConfig): string`, `decodeShareState(q: string | null): MagicTreeConfig`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { decodeShareState, encodeShareState } from './shareState';
import { DEFAULT_CONFIG } from '../types/magicTree';

describe('shareState', () => {
  it('round-trips a config through encode/decode', () => {
    const config = { targetUrl: 'https://optilink.app/u/demo', season: 'autumn' as const, palette: 'gold' as const };
    const decoded = decodeShareState(encodeShareState(config));
    expect(decoded).toEqual(config);
  });

  it('round-trips URLs with unicode characters', () => {
    const config = { targetUrl: 'https://optilink.app/?tên=xin-chào', season: 'winter' as const, palette: 'silver' as const };
    const decoded = decodeShareState(encodeShareState(config));
    expect(decoded).toEqual(config);
  });

  it('falls back to defaults when q is null', () => {
    expect(decodeShareState(null)).toEqual(DEFAULT_CONFIG);
  });

  it('falls back to defaults when q is malformed', () => {
    expect(decodeShareState('!!!')).toEqual(DEFAULT_CONFIG);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd client && npx vitest run src/components/MagicTreeQR/engine/shareState.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Write the implementation**

```ts
import type { MagicTreeConfig, PaletteId, SeasonId } from '../types/magicTree';
import { DEFAULT_CONFIG } from '../types/magicTree';

const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];
const PALETTE_ORDER: PaletteId[] = ['rose', 'violet', 'crimson', 'gold', 'azure', 'silver'];

export function encodeShareState(config: MagicTreeConfig): string {
  const seasonIdx = SEASON_ORDER.indexOf(config.season);
  const paletteIdx = PALETTE_ORDER.indexOf(config.palette);
  const encodedUrl = btoa(unescape(encodeURIComponent(config.targetUrl)));
  return `${pad2(seasonIdx)}${pad2(paletteIdx)}${encodedUrl}`;
}

export function decodeShareState(q: string | null): MagicTreeConfig {
  if (!q || q.length < 4) return DEFAULT_CONFIG;

  const seasonIdx = Number(q.slice(0, 2));
  const paletteIdx = Number(q.slice(2, 4));
  const encodedUrl = q.slice(4);

  const season = SEASON_ORDER[seasonIdx] ?? DEFAULT_CONFIG.season;
  const palette = PALETTE_ORDER[paletteIdx] ?? DEFAULT_CONFIG.palette;

  try {
    const targetUrl = decodeURIComponent(escape(atob(encodedUrl)));
    return { targetUrl: targetUrl || DEFAULT_CONFIG.targetUrl, season, palette };
  } catch {
    return { ...DEFAULT_CONFIG, season, palette };
  }
}

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd client && npx vitest run src/components/MagicTreeQR/engine/shareState.test.ts`
Expected: PASS, all 4 assertions.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/shareState.ts client/src/components/MagicTreeQR/engine/shareState.test.ts
git commit -m "feat(magic-tree): add URL share-state encode/decode"
```

---

### Task 5: Stage 1 review + PR

- [ ] **Step 1 (cheap review agent): Re-run the full test suite**

Run: `cd client && npm test`
Expected: all tests from Tasks 3–4 pass, 0 failures.

- [ ] **Step 2 (cheap review agent): Type-check the whole client**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`
Expected: no new errors introduced by this stage's files.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feature/magic-tree-qr
gh pr create --base main --head feature/magic-tree-qr \
  --title "feat(magic-tree): add QR matrix builder and share-state codec" \
  --body "Stage 1 of the Magic Tree 3D QR feature (specs/MAGIC_TREE_QR_SPEC.md): pure-logic QR matrix extraction/zone classification and share-state URL codec, both unit tested. No rendering yet — that's Stage 2."
```

---

## Stage 2 — Three.js scene engine
**Branch:** `feature/magic-tree-qr-engine` (off `feature/magic-tree-qr`)
**PR title:** `feat(magic-tree): add three.js tree rendering engine`

### Task 6: Camera animator (isometric ⇄ top-down)

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/CameraAnimator.ts`
- Test: `client/src/components/MagicTreeQR/engine/CameraAnimator.test.ts`

**Interfaces:**
- Produces: `type CameraViewState = 'isometric' | 'topdown'`, `class CameraAnimator { constructor(camera: THREE.PerspectiveCamera); get currentState(): CameraViewState; toggle(): void; update(deltaSeconds: number): void }`, `quinticEase(t: number): number` (exported for testing).

- [ ] **Step 1: Write the failing test (pure-math part only — no WebGL needed)**

```ts
import { describe, expect, it } from 'vitest';
import { quinticEase } from './CameraAnimator';

describe('quinticEase', () => {
  it('starts at 0 and ends at 1', () => {
    expect(quinticEase(0)).toBeCloseTo(0);
    expect(quinticEase(1)).toBeCloseTo(1);
  });

  it('is exactly 0.5 at the midpoint', () => {
    expect(quinticEase(0.5)).toBeCloseTo(0.5);
  });

  it('is monotonically increasing', () => {
    expect(quinticEase(0.25)).toBeLessThan(quinticEase(0.75));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd client && npx vitest run src/components/MagicTreeQR/engine/CameraAnimator.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Write the implementation**

```ts
import * as THREE from 'three';

export type CameraViewState = 'isometric' | 'topdown';

const ISO_POS = new THREE.Vector3(22, 24, 22);
const ISO_TARGET = new THREE.Vector3(0, 2.5, 0);
const ISO_UP = new THREE.Vector3(0, 1, 0);

const TOP_POS = new THREE.Vector3(0, 32, 0);
const TOP_TARGET = new THREE.Vector3(0, 0, 0);
const TOP_UP = new THREE.Vector3(0, 0, -1);

const TRANSITION_SECONDS = 0.9;
const IDLE_ROTATE_SPEED = 0.08;

export function quinticEase(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

export class CameraAnimator {
  private state: CameraViewState = 'isometric';
  private fromState: CameraViewState = 'isometric';
  private toState: CameraViewState = 'isometric';
  private animating = false;
  private progress = 0;
  private idleAngle = 0;

  constructor(private camera: THREE.PerspectiveCamera) {
    this.camera.position.copy(ISO_POS);
    this.camera.up.copy(ISO_UP);
    this.camera.lookAt(ISO_TARGET);
  }

  get currentState(): CameraViewState {
    return this.state;
  }

  toggle(): void {
    if (this.animating) return;
    this.fromState = this.state;
    this.toState = this.state === 'isometric' ? 'topdown' : 'isometric';
    this.progress = 0;
    this.animating = true;
  }

  update(deltaSeconds: number): void {
    if (this.animating) {
      this.progress = Math.min(1, this.progress + deltaSeconds / TRANSITION_SECONDS);
      const eased = quinticEase(this.progress);

      const startPos = this.fromState === 'isometric' ? ISO_POS : TOP_POS;
      const endPos = this.toState === 'isometric' ? ISO_POS : TOP_POS;
      const startTarget = this.fromState === 'isometric' ? ISO_TARGET : TOP_TARGET;
      const endTarget = this.toState === 'isometric' ? ISO_TARGET : TOP_TARGET;
      const startUp = this.fromState === 'isometric' ? ISO_UP : TOP_UP;
      const endUp = this.toState === 'isometric' ? ISO_UP : TOP_UP;

      this.camera.position.lerpVectors(startPos, endPos, eased);
      const target = new THREE.Vector3().lerpVectors(startTarget, endTarget, eased);
      this.camera.up.lerpVectors(startUp, endUp, eased).normalize();
      this.camera.lookAt(target);

      if (this.progress >= 1) {
        this.animating = false;
        this.state = this.toState;
      }
      return;
    }

    if (this.state === 'isometric') {
      this.idleAngle += deltaSeconds * IDLE_ROTATE_SPEED;
      const radius = Math.hypot(ISO_POS.x, ISO_POS.z);
      this.camera.position.set(
        Math.cos(this.idleAngle) * radius,
        ISO_POS.y,
        Math.sin(this.idleAngle) * radius
      );
      this.camera.up.copy(ISO_UP);
      this.camera.lookAt(ISO_TARGET);
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd client && npx vitest run src/components/MagicTreeQR/engine/CameraAnimator.test.ts`
Expected: PASS, all 3 assertions.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/CameraAnimator.ts client/src/components/MagicTreeQR/engine/CameraAnimator.test.ts
git commit -m "feat(magic-tree): add isometric/top-down camera animator"
```

---

### Task 7: Ground pedestal + paver grid

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/PedestalBuilder.ts`

**Interfaces:**
- Consumes: `QRGridData`, `cellToWorld` from `./QRMatrixBuilder`; `SeasonTheme` from `../types/magicTree`.
- Produces: `interface BuildResult { group: THREE.Group; dispose: () => void }`, `buildPedestal(grid: QRGridData, theme: SeasonTheme): BuildResult`.

- [ ] **Step 1: Write the implementation** (no unit test — WebGL geometry construction is verified visually in Task 12's browser pass, not worth mocking `THREE.WebGLRenderer`/canvas context for)

```ts
import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';

export interface BuildResult {
  group: THREE.Group;
  dispose: () => void;
}

export function buildPedestal(grid: QRGridData, theme: SeasonTheme): BuildResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const baseGeo = new THREE.BoxGeometry(grid.size + 1.6, 0.5, grid.size + 1.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: theme.trunk, roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.25;
  base.receiveShadow = true;
  group.add(base);
  disposables.push(baseGeo, baseMat);

  const paverGeo = new THREE.BoxGeometry(0.94, 0.04, 0.94);
  const lightMat = new THREE.MeshStandardMaterial({ color: theme.groundLight, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: theme.groundDark, roughness: 0.8 });
  disposables.push(paverGeo, lightMat, darkMat);

  const lightCount = countGroundCells(grid, false);
  const darkCount = countGroundCells(grid, true);
  const lightMesh = new THREE.InstancedMesh(paverGeo, lightMat, Math.max(1, lightCount));
  const darkMesh = new THREE.InstancedMesh(paverGeo, darkMat, Math.max(1, darkCount));
  lightMesh.receiveShadow = true;
  darkMesh.receiveShadow = true;

  const m = new THREE.Matrix4();
  let li = 0;
  let di = 0;
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (grid.zones[r][c] === 'finder') continue; // ShrubFinderBuilder owns these cells
      const { x, z } = cellToWorld(r, c, grid.size);
      m.makeTranslation(x, 0.02, z);
      if (grid.matrix[r][c]) {
        darkMesh.setMatrixAt(di++, m);
      } else {
        lightMesh.setMatrixAt(li++, m);
      }
    }
  }
  lightMesh.count = li;
  darkMesh.count = di;
  lightMesh.instanceMatrix.needsUpdate = true;
  darkMesh.instanceMatrix.needsUpdate = true;
  group.add(lightMesh, darkMesh);

  return {
    group,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function countGroundCells(grid: QRGridData, dark: boolean): number {
  let count = 0;
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (grid.zones[r][c] === 'finder') continue;
      if (grid.matrix[r][c] === dark) count++;
    }
  }
  return count;
}
```

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors in `PedestalBuilder.ts`.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/PedestalBuilder.ts
git commit -m "feat(magic-tree): add instanced ground pedestal builder"
```

---

### Task 8: Finder-pattern shrub hedges

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/ShrubFinderBuilder.ts`

**Interfaces:**
- Consumes: `QRGridData`, `cellToWorld` from `./QRMatrixBuilder`; `SeasonTheme` from `../types/magicTree`; `BuildResult` from `./PedestalBuilder`.
- Produces: `buildShrubFinders(grid: QRGridData, theme: SeasonTheme): BuildResult`.

- [ ] **Step 1: Write the implementation**

```ts
import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';
import type { BuildResult } from './PedestalBuilder';

const finderOrigins = (size: number): Array<[number, number]> => [
  [0, 0],
  [0, size - 7],
  [size - 7, 0],
];

export function buildShrubFinders(grid: QRGridData, theme: SeasonTheme): BuildResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const hedgeGeo = new THREE.BoxGeometry(0.94, 0.9, 0.94);
  const hedgeMat = new THREE.MeshStandardMaterial({ color: theme.groundDark, roughness: 0.95 });
  const coreGeo = new THREE.DodecahedronGeometry(0.5);
  const coreMat = new THREE.MeshStandardMaterial({ color: theme.canopyPrimary, roughness: 0.6 });
  const pavGeo = new THREE.BoxGeometry(0.94, 0.04, 0.94);
  const pavMat = new THREE.MeshStandardMaterial({ color: theme.groundLight, roughness: 0.8 });
  disposables.push(hedgeGeo, hedgeMat, coreGeo, coreMat, pavGeo, pavMat);

  for (const [baseR, baseC] of finderOrigins(grid.size)) {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const r = baseR + dr;
        const c = baseC + dc;
        const { x, z } = cellToWorld(r, c, grid.size);
        const isOuterFrame = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const isCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;

        if (isOuterFrame) {
          const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
          hedge.position.set(x, 0.45, z);
          hedge.castShadow = true;
          group.add(hedge);
        } else {
          const pav = new THREE.Mesh(pavGeo, pavMat);
          pav.position.set(x, 0.02, z);
          group.add(pav);
          if (isCore && dr === 3 && dc === 3) {
            const core = new THREE.Mesh(coreGeo, coreMat);
            core.position.set(x, 0.55, z);
            core.castShadow = true;
            group.add(core);
          }
        }
      }
    }
  }

  return {
    group,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
```

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/ShrubFinderBuilder.ts
git commit -m "feat(magic-tree): add finder-pattern shrub hedge builder"
```

---

### Task 9: Trunk, branches, and swaying foliage canopy

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/TreeProceduralMesh.ts`

**Interfaces:**
- Consumes: `QRGridData`, `cellToWorld` from `./QRMatrixBuilder`; `SeasonTheme` from `../types/magicTree`.
- Produces: `interface TreeMeshResult { group: THREE.Group; update: (elapsedSeconds: number) => void; dispose: () => void }`, `buildTreeMesh(grid: QRGridData, theme: SeasonTheme, accentColor: string): TreeMeshResult`.

- [ ] **Step 1: Write the implementation**

```ts
import * as THREE from 'three';
import { cellToWorld, type QRGridData } from './QRMatrixBuilder';
import type { SeasonTheme } from '../types/magicTree';

export interface TreeMeshResult {
  group: THREE.Group;
  update: (elapsedSeconds: number) => void;
  dispose: () => void;
}

const FORK_HEIGHT = 3.5;
const CROWN_BASE = 3.0;
const CROWN_HEIGHT = 2.5;

export function buildTreeMesh(
  grid: QRGridData,
  theme: SeasonTheme,
  accentColor: string
): TreeMeshResult {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const trunkGeo = new THREE.CylinderGeometry(0.4, 0.8, FORK_HEIGHT, 10);
  const trunkMat = new THREE.MeshStandardMaterial({ color: theme.trunk, roughness: 0.85 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = FORK_HEIGHT / 2;
  trunk.castShadow = true;
  group.add(trunk);
  disposables.push(trunkGeo, trunkMat);

  const canopyCells: Array<{ x: number; z: number }> = [];
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (grid.zones[r][c] === 'canopy' && grid.matrix[r][c]) {
        canopyCells.push(cellToWorld(r, c, grid.size));
      }
    }
  }

  const branchMat = new THREE.MeshStandardMaterial({ color: theme.trunk, roughness: 0.85 });
  disposables.push(branchMat);
  const quadrants = [
    canopyCells.filter((p) => p.x >= 0 && p.z >= 0),
    canopyCells.filter((p) => p.x < 0 && p.z >= 0),
    canopyCells.filter((p) => p.x >= 0 && p.z < 0),
    canopyCells.filter((p) => p.x < 0 && p.z < 0),
  ];
  for (const quadrant of quadrants) {
    if (quadrant.length === 0) continue;
    const centroid = quadrant.reduce(
      (acc, p) => ({ x: acc.x + p.x / quadrant.length, z: acc.z + p.z / quadrant.length }),
      { x: 0, z: 0 }
    );
    const targetY = crownElevation(centroid.x, centroid.z, grid.size);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, FORK_HEIGHT, 0),
      new THREE.Vector3(centroid.x * 0.5, FORK_HEIGHT + 0.6, centroid.z * 0.5),
      new THREE.Vector3(centroid.x, targetY, centroid.z)
    );
    const branchGeo = new THREE.TubeGeometry(curve, 12, 0.12, 6, false);
    const branch = new THREE.Mesh(branchGeo, branchMat);
    branch.castShadow = true;
    group.add(branch);
    disposables.push(branchGeo);
  }

  const leafTexture = createLeafTexture(accentColor || theme.canopyPrimary, theme.canopySecondary);
  const leafGeo = new THREE.PlaneGeometry(1.05, 1.05);
  const leafMat = new THREE.MeshStandardMaterial({
    map: leafTexture,
    transparent: true,
    alphaTest: 0.3,
    side: THREE.DoubleSide,
    roughness: 0.7,
  });
  disposables.push(leafGeo, leafMat, leafTexture);

  const count = Math.max(1, canopyCells.length);
  const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, count);
  leafMesh.count = canopyCells.length;
  leafMesh.castShadow = true;

  const basePositions: THREE.Vector3[] = [];
  const phases: number[] = [];
  const dummy = new THREE.Object3D();

  canopyCells.forEach((p, i) => {
    const y = crownElevation(p.x, p.z, grid.size);
    const pos = new THREE.Vector3(p.x, y, p.z);
    basePositions.push(pos);
    phases.push(Math.random() * Math.PI * 2);
    dummy.position.copy(pos);
    dummy.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
    dummy.updateMatrix();
    leafMesh.setMatrixAt(i, dummy.matrix);
  });
  leafMesh.instanceMatrix.needsUpdate = true;
  group.add(leafMesh);

  const update = (elapsedSeconds: number) => {
    for (let i = 0; i < basePositions.length; i++) {
      const pos = basePositions[i];
      const phase = phases[i];
      dummy.position.set(pos.x, pos.y + Math.sin(elapsedSeconds * 1.2 + phase) * 0.06, pos.z);
      dummy.rotation.set(
        Math.sin(elapsedSeconds * 0.8 + phase) * 0.08,
        phase,
        Math.cos(elapsedSeconds * 0.8 + phase) * 0.08
      );
      dummy.updateMatrix();
      leafMesh.setMatrixAt(i, dummy.matrix);
    }
    leafMesh.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function crownElevation(x: number, z: number, size: number): number {
  const canopyRadius = 0.38 * size;
  const t = Math.max(0, 1 - (x * x + z * z) / (canopyRadius * canopyRadius));
  return CROWN_BASE + CROWN_HEIGHT * Math.sqrt(t);
}

function createLeafTexture(primary: string, secondary: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(1, secondary);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
```

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/TreeProceduralMesh.ts
git commit -m "feat(magic-tree): add procedural trunk, branches, and swaying foliage"
```

---

### Task 10: Seasonal weather particles

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/WeatherSystem.ts`

**Interfaces:**
- Consumes: `SeasonId` from `../types/magicTree`.
- Produces: `interface WeatherResult { points: THREE.Points; update: (deltaSeconds: number) => void; dispose: () => void }`, `buildWeather(season: SeasonId): WeatherResult`.

- [ ] **Step 1: Write the implementation**

```ts
import * as THREE from 'three';
import type { SeasonId } from '../types/magicTree';

export interface WeatherResult {
  points: THREE.Points;
  update: (deltaSeconds: number) => void;
  dispose: () => void;
}

interface WeatherParams {
  count: number;
  color: string;
  size: number;
  fallSpeed: [number, number];
  spread: number;
  height: number;
}

const WEATHER_PARAMS: Record<SeasonId, WeatherParams> = {
  spring: { count: 120, color: '#FFB7C5', size: 0.12, fallSpeed: [1.2, 2.2], spread: 15, height: 18 },
  summer: { count: 60, color: '#FEF3C7', size: 0.08, fallSpeed: [0.2, 0.5], spread: 15, height: 18 },
  autumn: { count: 140, color: '#DC2626', size: 0.14, fallSpeed: [2.5, 4.0], spread: 15, height: 18 },
  winter: { count: 100, color: '#F8FAFC', size: 0.1, fallSpeed: [0.8, 1.6], spread: 15, height: 18 },
};

export function buildWeather(season: SeasonId): WeatherResult {
  const params = WEATHER_PARAMS[season];
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  const speeds = new Float32Array(params.count);
  const phases = new Float32Array(params.count);

  for (let i = 0; i < params.count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * params.spread * 2;
    positions[i * 3 + 1] = Math.random() * params.height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * params.spread * 2;
    speeds[i] = params.fallSpeed[0] + Math.random() * (params.fallSpeed[1] - params.fallSpeed[0]);
    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: params.color,
    size: params.size,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  const update = (deltaSeconds: number) => {
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < params.count; i++) {
      let y = posAttr.getY(i) - speeds[i] * deltaSeconds;
      let x = posAttr.getX(i) + Math.sin(phases[i] + y * 0.5) * 0.02;
      if (y < 0) {
        y = params.height;
        x = (Math.random() - 0.5) * params.spread * 2;
      }
      posAttr.setX(i, x);
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  };

  return {
    points,
    update,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
```

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/WeatherSystem.ts
git commit -m "feat(magic-tree): add seasonal weather particle system"
```

---

### Task 11: Audio scaffold (no-op, per spec's explicit scope decision)

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/AudioAmbience.ts`

**Interfaces:**
- Produces: `class AudioAmbience { setTrack(url: string | null): void; setMuted(muted: boolean): void; get isMuted(): boolean; dispose(): void }`.

- [ ] **Step 1: Write the implementation**

```ts
export class AudioAmbience {
  private audio: HTMLAudioElement | null = null;
  private muted = true;

  setTrack(url: string | null): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (!url) return;
    this.audio = new Audio(url);
    this.audio.loop = true;
    this.audio.muted = this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audio) {
      this.audio.muted = muted;
      if (!muted) {
        void this.audio.play().catch(() => undefined);
      }
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    this.setTrack(null);
  }
}
```

No season track URLs are wired up anywhere in this plan — `setTrack` is never called with a non-null argument, so this ships as a functional-but-silent mute toggle. Add real `audio/<season>.mp3` assets and a `setTrack()` call later if you obtain licensed audio.

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/AudioAmbience.ts
git commit -m "feat(magic-tree): add audio ambience scaffold (no bundled tracks)"
```

---

### Task 12: Scene manager orchestration

**Files:**
- Create: `client/src/components/MagicTreeQR/engine/TreeSceneManager.ts`

**Interfaces:**
- Consumes: `buildQRMatrix`, `QRGridData` from `./QRMatrixBuilder`; `buildPedestal` from `./PedestalBuilder`; `buildShrubFinders` from `./ShrubFinderBuilder`; `buildTreeMesh` from `./TreeProceduralMesh`; `buildWeather` from `./WeatherSystem`; `CameraAnimator` from `./CameraAnimator`; `AudioAmbience` from `./AudioAmbience`; `SEASON_THEMES`, `PALETTE_PRESETS`, `MagicTreeConfig` from `../types/magicTree`.
- Produces: `class TreeSceneManager { constructor(canvas: HTMLCanvasElement); readonly audio: AudioAmbience; rebuild(config: MagicTreeConfig): void; toggleView(): void; dispose(): void }` — this is what `MagicTreeContainer.tsx` (Task 13) mounts.

- [ ] **Step 1: Write the implementation**

```ts
import * as THREE from 'three';
import { buildQRMatrix, type QRGridData } from './QRMatrixBuilder';
import { buildPedestal } from './PedestalBuilder';
import { buildShrubFinders } from './ShrubFinderBuilder';
import { buildTreeMesh } from './TreeProceduralMesh';
import { buildWeather } from './WeatherSystem';
import { CameraAnimator } from './CameraAnimator';
import { AudioAmbience } from './AudioAmbience';
import { SEASON_THEMES, PALETTE_PRESETS, type MagicTreeConfig } from '../types/magicTree';

interface Disposable {
  dispose: () => void;
}

export class TreeSceneManager {
  readonly audio = new AudioAmbience();

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private cameraAnimator: CameraAnimator;
  private clock = new THREE.Clock();
  private frameId: number | null = null;
  private sceneGroup: THREE.Group | null = null;
  private disposables: Disposable[] = [];
  private updaters: Array<(elapsed: number, delta: number) => void> = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.cameraAnimator = new CameraAnimator(this.camera);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.9);
    directional.position.set(10, 20, 10);
    directional.castShadow = true;
    this.scene.add(ambient, directional);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.frameId = requestAnimationFrame(this.renderLoop);
  }

  rebuild(config: MagicTreeConfig): void {
    this.clearScene();

    const grid: QRGridData = buildQRMatrix(config.targetUrl);
    const theme = SEASON_THEMES[config.season];
    const accent = PALETTE_PRESETS.find((p) => p.id === config.palette)?.color ?? theme.canopyPrimary;

    this.scene.background = new THREE.Color(theme.background);

    const group = new THREE.Group();
    const pedestal = buildPedestal(grid, theme);
    const finders = buildShrubFinders(grid, theme);
    const tree = buildTreeMesh(grid, theme, accent);
    const weather = buildWeather(config.season);

    group.add(pedestal.group, finders.group, tree.group, weather.points);
    this.scene.add(group);
    this.sceneGroup = group;

    this.disposables.push(pedestal, finders, tree, weather);
    this.updaters.push((elapsed) => tree.update(elapsed));
    this.updaters.push((_elapsed, delta) => weather.update(delta));
  }

  toggleView(): void {
    this.cameraAnimator.toggle();
  }

  private handleResize = (): void => {
    const { clientWidth, clientHeight } = this.canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
  };

  private renderLoop = (): void => {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    this.cameraAnimator.update(delta);
    for (const update of this.updaters) update(elapsed, delta);

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.renderLoop);
  };

  private clearScene(): void {
    if (this.sceneGroup) {
      this.scene.remove(this.sceneGroup);
    }
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.updaters = [];
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.clearScene();
    this.audio.dispose();
    this.renderer.dispose();
  }
}
```

- [ ] **Step 2: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors — this is the integration point for every engine module written so far, so a type error here usually means an earlier task's exported name/signature drifted.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MagicTreeQR/engine/TreeSceneManager.ts
git commit -m "feat(magic-tree): add scene manager orchestrating the tree engine"
```

---

### Task 13: Stage 2 review + PR

- [ ] **Step 1 (cheap review agent): Full test suite still passes**

Run: `cd client && npm test`
Expected: same passing tests as Stage 1 (this stage added no new unit tests, by design — WebGL geometry is visually verified in Stage 3).

- [ ] **Step 2 (cheap review agent): Type-check the whole client**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`
Expected: clean.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feature/magic-tree-qr-engine
gh pr create --base feature/magic-tree-qr --head feature/magic-tree-qr-engine \
  --title "feat(magic-tree): add three.js tree rendering engine" \
  --body "Stage 2 of the Magic Tree 3D QR feature: vanilla-Three.js engine (pedestal, finder hedges, procedural trunk/branches/foliage with idle sway, seasonal weather particles, camera state machine, audio scaffold) orchestrated by TreeSceneManager. Not yet wired into any React page — that's Stage 3. Stacked on #<stage-1-pr-number>."
```

---

## Stage 3 — React integration, routing, and verification
**Branch:** `feature/magic-tree-qr-ui` (off `feature/magic-tree-qr-engine`)
**PR title:** `feat(magic-tree): wire tree engine into a workspace page`

### Task 14: MagicTreeContainer (React shell)

**Files:**
- Create: `client/src/components/MagicTreeQR/MagicTreeContainer.tsx`
- Create: `client/src/components/MagicTreeQR/MagicTreeContainer.css`

**Interfaces:**
- Consumes: `TreeSceneManager` from `./engine/TreeSceneManager`; `encodeShareState`, `decodeShareState` from `./engine/shareState`; `SEASON_THEMES`, `PALETTE_PRESETS`, `SeasonId`, `PaletteId`, `MagicTreeConfig` from `./types/magicTree`.
- Produces: `export function MagicTreeContainer(): JSX.Element` — mounted directly by `MagicTreePage.tsx` (Task 15).

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { TreeSceneManager } from './engine/TreeSceneManager';
import { decodeShareState, encodeShareState } from './engine/shareState';
import {
  SEASON_THEMES,
  PALETTE_PRESETS,
  type SeasonId,
  type PaletteId,
  type MagicTreeConfig,
} from './types/magicTree';
import './MagicTreeContainer.css';

const DEBOUNCE_MS = 500;

export function MagicTreeContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<TreeSceneManager | null>(null);
  const debounceRef = useRef<number | null>(null);

  const initial = useMemo(
    () => decodeShareState(new URLSearchParams(window.location.search).get('q')),
    []
  );
  const [urlInput, setUrlInput] = useState(initial.targetUrl);
  const [season, setSeason] = useState<SeasonId>(initial.season);
  const [palette, setPalette] = useState<PaletteId>(initial.palette);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const manager = new TreeSceneManager(canvasRef.current);
    managerRef.current = manager;
    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const trimmed = urlInput.trim();
      if (!trimmed) {
        setError('Nhập một URL để tạo cây QR');
        return;
      }
      try {
        manager.rebuild({ targetUrl: trimmed, season, palette });
        setError(null);
        const q = encodeShareState({ targetUrl: trimmed, season, palette });
        window.history.replaceState(null, '', `?q=${q}`);
      } catch {
        setError('URL không hợp lệ để tạo mã QR');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [urlInput, season, palette]);

  useEffect(() => {
    managerRef.current?.audio.setMuted(muted);
  }, [muted]);

  const handleTap = () => managerRef.current?.toggleView();

  const handleShare = async () => {
    const config: MagicTreeConfig = {
      targetUrl: urlInput.trim() || 'https://optilink.app',
      season,
      palette,
    };
    const q = encodeShareState(config);
    const shareUrl = `${window.location.origin}${window.location.pathname}?q=${q}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt('Sao chép link chia sẻ:', shareUrl);
    }
  };

  return (
    <div className="magic-tree">
      <canvas ref={canvasRef} className="magic-tree-canvas" onClick={handleTap} />
      <p className="magic-tree-hint">Chạm vào cây để xem mã QR</p>

      <div className="magic-tree-controls">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://optilink.app"
          className="magic-tree-input"
        />
        <button type="button" onClick={handleShare} className="magic-tree-share">
          Chia sẻ
        </button>
      </div>

      {error && <p className="magic-tree-error">{error}</p>}

      <div className="magic-tree-seasons">
        {(Object.keys(SEASON_THEMES) as SeasonId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`magic-tree-season${season === id ? ' is-active' : ''}`}
            onClick={() => setSeason(id)}
          >
            {SEASON_THEMES[id].label}
          </button>
        ))}
        <button type="button" onClick={() => setMuted((m) => !m)} className="magic-tree-mute">
          {muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        </button>
      </div>

      <div className="magic-tree-palettes">
        {PALETTE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`magic-tree-palette${palette === p.id ? ' is-active' : ''}`}
            style={{ backgroundColor: p.color }}
            aria-label={p.label}
            onClick={() => setPalette(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the stylesheet**

```css
.magic-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 640px;
}

.magic-tree-canvas {
  flex: 1;
  width: 100%;
  min-height: 480px;
  border-radius: 12px;
  background: #f6f1e7;
  cursor: pointer;
}

.magic-tree-hint {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.magic-tree-controls {
  display: flex;
  gap: 8px;
}

.magic-tree-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.magic-tree-share {
  padding: 10px 18px;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.magic-tree-error {
  color: #dc2626;
  font-size: 13px;
  margin: 0;
}

.magic-tree-seasons,
.magic-tree-palettes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.magic-tree-season,
.magic-tree-mute {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}

.magic-tree-season.is-active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.magic-tree-palette {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.magic-tree-palette.is-active {
  border-color: #111827;
}
```

- [ ] **Step 3: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`

- [ ] **Step 4: Commit**

```bash
git add client/src/components/MagicTreeQR/MagicTreeContainer.tsx client/src/components/MagicTreeQR/MagicTreeContainer.css
git commit -m "feat(magic-tree): add React container with debounced rebuild"
```

---

### Task 15: MagicTreePage + routing + sidebar + QR page CTA

**Files:**
- Create: `client/src/pages/Workspace/MagicTreePage.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/workspace/Sidebar/Sidebar.tsx`
- Modify: `client/src/pages/Workspace/QRCodePage.tsx`

**Interfaces:**
- Consumes: `PageHeader` from `../../components/workspace/PageHeader/PageHeader`; `ContentPanel` from `../../components/workspace/panels/ContentPanel/ContentPanel`; `MagicTreeContainer` from `../../components/MagicTreeQR/MagicTreeContainer`.

- [ ] **Step 1: Create the page**

```tsx
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { MagicTreeContainer } from '../../components/MagicTreeQR/MagicTreeContainer';
import './workspace.css';

export function MagicTreePage() {
  return (
    <>
      <PageHeader title="Magic Tree QR" />
      <ContentPanel className="magic-tree-panel">
        <MagicTreeContainer />
      </ContentPanel>
    </>
  );
}
```

- [ ] **Step 2: Register the route**

In `client/src/App.tsx`, add the import next to the existing `QRCodePage` import:

```ts
import { MagicTreePage } from './pages/Workspace/MagicTreePage';
```

And add the route next to `path="qr"` inside the `/dashboard` layout route:

```tsx
<Route path="qr" element={<QRCodePage />} />
<Route path="magic-tree" element={<MagicTreePage />} />
```

- [ ] **Step 3: Add the sidebar entry**

In `client/src/components/workspace/Sidebar/Sidebar.tsx`, append to the `navItems` array (after the "QR Code" entry, before "Bio Page"), matching the existing inline-SVG convention exactly (same `iconProps` spread, a tree-like Heroicons-style outline path):

```tsx
{
  label: 'Magic Tree',
  to: '/dashboard/magic-tree',
  end: false,
  icon: (
    <svg {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v18M12 3c-2.5 0-4.5 2-4.5 4.5S9.5 12 12 12s4.5-2 4.5-4.5S14.5 3 12 3ZM12 12c-3 0-5.5 2.5-5.5 5.5S9 21 12 21s5.5-2 5.5-3.5S15 12 12 12Z"
      />
    </svg>
  ),
},
```

- [ ] **Step 4: Add a CTA link on the existing QR page**

In `client/src/pages/Workspace/QRCodePage.tsx`, add a third link inside the existing `<div style={{ display: 'flex', gap: '12px' }}>` block, after "Xem Swagger API", reusing the same button style object as "Mở QR Studio & Themes Demo" (`background: '#111827'`):

```tsx
<a
  href="/dashboard/magic-tree"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: '#111827',
    color: '#ffffff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
  }}
>
  Thử Magic Tree 3D QR ↗
</a>
```

- [ ] **Step 5: Type-check**

Run: `cd client && npx tsc --noEmit -p tsconfig.app.json`
Expected: clean — this is the point where every earlier module gets exercised through real React imports.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/Workspace/MagicTreePage.tsx client/src/App.tsx client/src/components/workspace/Sidebar/Sidebar.tsx client/src/pages/Workspace/QRCodePage.tsx
git commit -m "feat(magic-tree): route, sidebar entry, and QR page cross-link"
```

---

### Task 16: Browser verification (cheap QA agent)

No new files — this task drives the already-built feature in a real browser and fixes anything broken.

- [ ] **Step 1: Start the dev server and log in**

Use the Browser preview tool: `preview_start` with the client dev server config, log in with a test account, navigate to `/dashboard/magic-tree`.

- [ ] **Step 2: Verify the default render**

Screenshot the page. Expected: an isometric 3D tree renders on a colored ground grid with 3 visibly denser corner clusters (finder hedges), "Chạm vào cây để xem mã QR" hint text below the canvas, season buttons (Xuân/Hạ/Thu/Đông), 6 palette dots, and a URL input pre-filled with `https://optilink.app`.

- [ ] **Step 3: Verify URL rebuild**

Type a different URL into the input (e.g. `https://optilink.app/u/demo`), wait >500ms without typing. Expected: the tree regenerates (shape/foliage count visibly changes since the QR content changed), the page URL gains a `?q=...` query param, no console errors.

- [ ] **Step 4: Verify season/palette switching**

Click each season button. Expected: canopy/trunk/ground/weather colors and particle type change per the theme table. Click a palette dot. Expected: canopy accent color changes independent of season.

- [ ] **Step 5: Verify the tap-to-scan transition**

Click the canvas. Expected: camera smoothly animates to a top-down view over ~0.9s; clicking again returns to isometric. Screenshot the top-down view and visually confirm the three finder squares are square and evenly spaced, matching a real QR's position-detection pattern layout (this is the closest scannability check possible from this environment — flag physical phone-camera scanning as the user's manual follow-up).

- [ ] **Step 6: Verify no console/network errors and the untouched QR page**

Check `read_console_messages` for errors. Navigate to `/dashboard/qr`, confirm it renders unchanged and the new "Thử Magic Tree 3D QR ↗" link navigates to `/dashboard/magic-tree`.

- [ ] **Step 7: Fix anything broken found in Steps 2–6**

If any check fails, fix the specific file responsible (most likely `TreeSceneManager.ts` wiring or `MagicTreeContainer.tsx` state) and re-run the relevant step above until it passes. Commit each fix separately with a `fix(magic-tree): ...` message.

---

### Task 17: Stage 3 review + PR

- [ ] **Step 1 (cheap review agent): Full test suite**

Run: `cd client && npm test`
Expected: all Stage 1 tests still pass, no regressions.

- [ ] **Step 2 (cheap review agent): Build check**

Run: `cd client && npm run build`
Expected: `tsc -b && vite build` completes with no errors — this is the strongest signal the whole feature compiles end-to-end, including the routing/sidebar/page wiring from Task 15.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feature/magic-tree-qr-ui
gh pr create --base feature/magic-tree-qr-engine --head feature/magic-tree-qr-ui \
  --title "feat(magic-tree): wire tree engine into a workspace page" \
  --body "Stage 3 (final) of the Magic Tree 3D QR feature: React container with debounced rebuild + share-state URL, new /dashboard/magic-tree route, sidebar entry, and a cross-link from the existing /dashboard/qr page. Verified in-browser: default render, URL rebuild, season/palette switching, tap-to-scan camera transition, no console errors, existing QR page unaffected. Physical phone-camera scan verification is a manual follow-up — not possible from this environment. Stacked on #<stage-2-pr-number>."
```

---

## Post-implementation note for the user
Once all three PRs are reviewed and merged (in order: Stage 1 → Stage 2 → Stage 3), open `/dashboard/magic-tree` on an actual phone or scan the top-down screenshot with a phone camera / online QR decoder to confirm real-world scannability — that check could not be performed from this environment.
