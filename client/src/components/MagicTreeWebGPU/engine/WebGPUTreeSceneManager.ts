import { buildQRMatrix, cellToWorld } from '../../MagicTreeQR/engine/QRMatrixBuilder';
import { PALETTE_PRESETS, SEASON_THEMES } from '../../MagicTreeQR/types/magicTree';
import type { MagicTreeConfig } from '../../MagicTreeQR/types/magicTree';
import { generateBranches } from './BranchGenerator';
import { BRANCH_VERTEX_FLOATS, buildBranchMesh } from './BranchMesh';
import { CameraMatrices } from './CameraMatrices';
import { generateGrassRing, gridHalfExtent } from './GrassRing';
import { generateLeaves } from './LeafInstances';
import { generateFallingParticles } from './PetalParticles';
import { seedFromUrl } from './seedFromUrl';
import { DEPTH_FORMAT, SAMPLE_COUNT, WebGPUContext } from './WebGPUContext';
import branchWgsl from './shaders/branch.wgsl?raw';
import canopyWgsl from './shaders/canopyLeaves.wgsl?raw';
import commonWgsl from './shaders/common.wgsl?raw';
import fallingWgsl from './shaders/fallingParticles.wgsl?raw';
import grassWgsl from './shaders/grass.wgsl?raw';
import groundWgsl from './shaders/ground.wgsl?raw';
import decalWgsl from './shaders/groundingDecal.wgsl?raw';

/**
 * Owns the render loop and the rebuild/dispose lifecycle — spec §4/§8.
 *
 * Every GPU buffer created by rebuild() is destroyed before the next one
 * replaces it: WebGPU objects don't release GPU memory just because the JS
 * wrapper goes out of scope.
 */

const FRAME_UNIFORM_BYTES = 112;
const PALETTE_UNIFORM_BYTES = 112;
const GROUND_Y = 0;
/** Below this the tree contributes nothing, so its draws are skipped (§6.1). */
const DISSOLVE_EPSILON = 0.001;

/** Unit quad, triangle list. Ground uses it in XZ, billboards as corners. */
const QUAD = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
  -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
]);

/** vec4 + float: two attributes, one interleaved instance buffer. */
const PARTICLE_INSTANCE_LAYOUT: GPUVertexBufferLayout = {
  arrayStride: 20,
  stepMode: 'instance',
  attributes: [
    { shaderLocation: 1, offset: 0, format: 'float32x4' },
    { shaderLocation: 2, offset: 16, format: 'float32' },
  ],
};

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export class WebGPUTreeSceneManager {
  private readonly gpu: WebGPUContext;
  private readonly camera = new CameraMatrices();

  private readonly frameUniform: GPUBuffer;
  private readonly paletteUniform: GPUBuffer;
  private readonly quadBuffer: GPUBuffer;
  private readonly bindGroup: GPUBindGroup;
  private readonly groundPipeline: GPURenderPipeline;
  private readonly branchPipeline: GPURenderPipeline;
  private readonly canopyPipeline: GPURenderPipeline;
  private readonly fallingPipeline: GPURenderPipeline;
  private readonly grassPipeline: GPURenderPipeline;
  private readonly decalPipeline: GPURenderPipeline;

  private groundInstances: GPUBuffer | null = null;
  private groundCount = 0;
  private branchVertices: GPUBuffer | null = null;
  private branchIndices: GPUBuffer | null = null;
  private branchIndexCount = 0;
  private canopyInstances: GPUBuffer | null = null;
  private canopyCount = 0;
  private fallingInstances: GPUBuffer | null = null;
  private fallingCount = 0;
  private grassInstances: GPUBuffer | null = null;
  private grassCount = 0;

  private background: GPUColor = { r: 1, g: 1, b: 1, a: 1 };
  private readonly frameData = new Float32Array(FRAME_UNIFORM_BYTES / 4);
  private frameId: number | null = null;
  private startTime = performance.now();
  private lastTime = this.startTime;
  private disposed = false;

  private constructor(gpu: WebGPUContext) {
    this.gpu = gpu;
    const { device } = gpu;

    this.frameUniform = device.createBuffer({
      size: FRAME_UNIFORM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.paletteUniform = device.createBuffer({
      size: PALETTE_UNIFORM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.quadBuffer = device.createBuffer({
      size: QUAD.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.quadBuffer, 0, QUAD);

    const layout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} },
        { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} },
      ],
    });
    this.bindGroup = device.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: this.frameUniform } },
        { binding: 1, resource: { buffer: this.paletteUniform } },
      ],
    });

    const cornerLayout: GPUVertexBufferLayout = {
      arrayStride: 8,
      attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
    };

    this.groundPipeline = this.createPipeline(layout, groundWgsl, [
      cornerLayout,
      {
        arrayStride: 12,
        stepMode: 'instance',
        attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }],
      },
    ]);
    this.branchPipeline = this.createPipeline(layout, branchWgsl, [
      {
        arrayStride: BRANCH_VERTEX_FLOATS * 4,
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x3' },
          { shaderLocation: 1, offset: 12, format: 'float32x3' },
          { shaderLocation: 2, offset: 24, format: 'float32' },
        ],
      },
    ]);
    this.canopyPipeline = this.createPipeline(layout, canopyWgsl, [
      cornerLayout,
      {
        arrayStride: 16,
        stepMode: 'instance',
        attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x4' }],
      },
    ]);
    this.fallingPipeline = this.createPipeline(layout, fallingWgsl, [
      cornerLayout,
      PARTICLE_INSTANCE_LAYOUT,
    ]);
    this.grassPipeline = this.createPipeline(layout, grassWgsl, [
      cornerLayout,
      PARTICLE_INSTANCE_LAYOUT,
    ]);
    this.decalPipeline = this.createPipeline(layout, decalWgsl, [cornerLayout], true);

    this.camera.setViewport(gpu.pixelWidth, gpu.pixelHeight);
    this.frameId = requestAnimationFrame(this.renderLoop);
  }

  static async create(canvas: HTMLCanvasElement): Promise<WebGPUTreeSceneManager | null> {
    const gpu = await WebGPUContext.create(canvas);
    return gpu ? new WebGPUTreeSceneManager(gpu) : null;
  }

  /**
   * Everything is alpha-tested and depth-writing except the grounding decal,
   * which is the one blended pass and therefore the one that must draw last.
   */
  private createPipeline(
    bindGroupLayout: GPUBindGroupLayout,
    source: string,
    buffers: GPUVertexBufferLayout[],
    blended = false
  ): GPURenderPipeline {
    const { device } = this.gpu;
    const module = device.createShaderModule({ code: `${commonWgsl}\n${source}` });
    const target: GPUColorTargetState = { format: this.gpu.format };
    if (blended) {
      target.blend = {
        color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        alpha: { srcFactor: 'zero', dstFactor: 'one', operation: 'add' },
      };
    }
    return device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: { module, entryPoint: 'vertexMain', buffers },
      fragment: { module, entryPoint: 'fragmentMain', targets: [target] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: !blended,
        depthCompare: 'less',
      },
      multisample: { count: SAMPLE_COUNT },
    });
  }

  private createGpuBuffer(data: Float32Array | Uint32Array, usage: number): GPUBuffer {
    const buffer = this.gpu.device.createBuffer({
      size: data.byteLength,
      usage: usage | GPUBufferUsage.COPY_DST,
    });
    this.gpu.device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  }

  rebuild(config: MagicTreeConfig): void {
    if (this.disposed) return;
    const { device } = this.gpu;
    const theme = SEASON_THEMES[config.season];
    const accent = PALETTE_PRESETS.find((p) => p.id === config.palette) ?? PALETTE_PRESETS[0];
    const { size, matrix } = buildQRMatrix(config.targetUrl);
    const seed = seedFromUrl(config.targetUrl);

    const ground = new Float32Array(size * size * 3);
    let g = 0;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const { x, z } = cellToWorld(row, col, size);
        ground[g++] = x;
        ground[g++] = z;
        ground[g++] = matrix[row][col] ? 1 : 0;
      }
    }

    const segments = generateBranches(seed, size);
    const mesh = buildBranchMesh(segments, seed);
    const canopy = generateLeaves(segments, seed);
    const leaves = new Float32Array(canopy.leaves.length * 4);
    canopy.leaves.forEach((leaf, i) => {
      leaves.set([leaf.position[0], leaf.position[1], leaf.position[2], leaf.seed], i * 4);
    });

    const particles = generateFallingParticles(theme.weather, canopy, gridHalfExtent(size), seed);
    const falling = new Float32Array(particles.length * 5);
    particles.forEach((p, i) => {
      falling.set([p.x, p.z, p.canopyY, p.drift, p.seed], i * 5);
    });

    const blades = generateGrassRing(size, seed);
    const grass = new Float32Array(blades.length * 5);
    blades.forEach((b, i) => {
      grass.set([b.x, b.z, b.height, b.rotation, b.seed], i * 5);
    });

    this.destroySceneBuffers();
    this.groundInstances = this.createGpuBuffer(ground, GPUBufferUsage.VERTEX);
    this.groundCount = size * size;
    this.branchVertices = this.createGpuBuffer(mesh.vertices, GPUBufferUsage.VERTEX);
    this.branchIndices = this.createGpuBuffer(mesh.indices, GPUBufferUsage.INDEX);
    this.branchIndexCount = mesh.indexCount;
    this.canopyInstances = this.createGpuBuffer(leaves, GPUBufferUsage.VERTEX);
    this.canopyCount = canopy.leaves.length;
    this.fallingInstances = this.createGpuBuffer(falling, GPUBufferUsage.VERTEX);
    this.fallingCount = particles.length;
    this.grassInstances = this.createGpuBuffer(grass, GPUBufferUsage.VERTEX);
    this.grassCount = blades.length;

    const palette = new Float32Array(PALETTE_UNIFORM_BYTES / 4);
    palette.set([...hexToRgb(theme.groundLight), 1], 0);
    palette.set([...hexToRgb(theme.groundDark), 1], 4);
    palette.set([...hexToRgb(theme.trunk), 1], 8);
    palette.set([...hexToRgb(accent.color || theme.canopyPrimary), 1], 12);
    palette.set([...hexToRgb(theme.canopyPrimary), 1], 16);
    palette.set([...hexToRgb(theme.canopySecondary), 1], 20);
    palette.set([canopy.minY, canopy.height, GROUND_Y, size / 2], 24);
    device.queue.writeBuffer(this.paletteUniform, 0, palette);

    const [r, g0, b] = hexToRgb(theme.background);
    this.background = { r, g: g0, b, a: 1 };
    this.camera.frameStructure(size, canopy.minY + canopy.height);
  }

  toggleView(): void {
    this.camera.toggle();
  }

  private readonly renderLoop = (): void => {
    if (this.disposed) return;
    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.gpu.resize()) {
      this.camera.setViewport(this.gpu.pixelWidth, this.gpu.pixelHeight);
    }
    this.camera.update(delta);

    if (this.groundInstances) {
      const { device } = this.gpu;
      const treeAlpha = this.camera.treeAlpha;

      this.frameData.set(this.camera.viewProj(), 0);
      this.frameData.set(this.camera.cameraRight, 16);
      this.frameData.set(this.camera.cameraUp, 20);
      this.frameData[24] = (now - this.startTime) / 1000;
      this.frameData[25] = 1;
      this.frameData[26] = treeAlpha;
      device.queue.writeBuffer(this.frameUniform, 0, this.frameData);

      const encoder = device.createCommandEncoder();
      const pass = this.gpu.beginPass(encoder, this.background);
      pass.setBindGroup(0, this.bindGroup);

      pass.setPipeline(this.groundPipeline);
      pass.setVertexBuffer(0, this.quadBuffer);
      pass.setVertexBuffer(1, this.groundInstances);
      pass.draw(6, this.groundCount);

      // Outside the grid, so it can't cover a module and never dissolves.
      if (this.grassInstances && this.grassCount > 0) {
        pass.setPipeline(this.grassPipeline);
        pass.setVertexBuffer(0, this.quadBuffer);
        pass.setVertexBuffer(1, this.grassInstances);
        pass.draw(6, this.grassCount);
      }

      // Nothing above ground once the flat view is settled, so the QR can
      // never be covered, whatever the dissolve does.
      if (treeAlpha > DISSOLVE_EPSILON) {
        if (this.branchVertices && this.branchIndices) {
          pass.setPipeline(this.branchPipeline);
          pass.setVertexBuffer(0, this.branchVertices);
          pass.setIndexBuffer(this.branchIndices, 'uint32');
          pass.drawIndexed(this.branchIndexCount);
        }
        if (this.canopyInstances && this.canopyCount > 0) {
          pass.setPipeline(this.canopyPipeline);
          pass.setVertexBuffer(0, this.quadBuffer);
          pass.setVertexBuffer(1, this.canopyInstances);
          pass.draw(6, this.canopyCount);
        }
        if (this.fallingInstances && this.fallingCount > 0) {
          pass.setPipeline(this.fallingPipeline);
          pass.setVertexBuffer(0, this.quadBuffer);
          pass.setVertexBuffer(1, this.fallingInstances);
          pass.draw(6, this.fallingCount);
        }
      }

      pass.setPipeline(this.decalPipeline);
      pass.setVertexBuffer(0, this.quadBuffer);
      pass.draw(6, 1);

      pass.end();
      device.queue.submit([encoder.finish()]);
    }

    this.frameId = requestAnimationFrame(this.renderLoop);
  };

  private destroySceneBuffers(): void {
    this.groundInstances?.destroy();
    this.branchVertices?.destroy();
    this.branchIndices?.destroy();
    this.canopyInstances?.destroy();
    this.fallingInstances?.destroy();
    this.grassInstances?.destroy();
    this.groundInstances = null;
    this.branchVertices = null;
    this.branchIndices = null;
    this.canopyInstances = null;
    this.fallingInstances = null;
    this.grassInstances = null;
  }

  dispose(): void {
    this.disposed = true;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.destroySceneBuffers();
    this.frameUniform.destroy();
    this.paletteUniform.destroy();
    this.quadBuffer.destroy();
    this.gpu.destroy();
  }
}
