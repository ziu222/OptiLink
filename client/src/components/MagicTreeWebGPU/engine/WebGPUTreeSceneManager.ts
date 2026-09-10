import { buildQRMatrix, cellToWorld } from '../../MagicTreeQR/engine/QRMatrixBuilder';
import { PALETTE_PRESETS, SEASON_THEMES } from '../../MagicTreeQR/types/magicTree';
import type { MagicTreeConfig } from '../../MagicTreeQR/types/magicTree';
import { CameraMatrices } from './CameraMatrices';
import { DEPTH_FORMAT, SAMPLE_COUNT, WebGPUContext } from './WebGPUContext';
import commonWgsl from './shaders/common.wgsl?raw';
import groundWgsl from './shaders/ground.wgsl?raw';

/**
 * Owns the render loop and the rebuild/dispose lifecycle — spec §4/§8.
 *
 * Every GPU buffer created by rebuild() is destroyed before the next one
 * replaces it: WebGPU objects don't release GPU memory just because the JS
 * wrapper goes out of scope.
 */

const FRAME_UNIFORM_BYTES = 80;
const PALETTE_UNIFORM_BYTES = 80;
const GROUND_Y = 0;

/** Unit quad in XZ, triangle list. */
const QUAD_XZ = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
  -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
]);

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

  private groundInstances: GPUBuffer | null = null;
  private groundCount = 0;

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
      size: QUAD_XZ.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.quadBuffer, 0, QUAD_XZ);

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

    this.camera.setViewport(gpu.pixelWidth, gpu.pixelHeight);

    this.groundPipeline = this.createPipeline(layout, groundWgsl, [
      {
        arrayStride: 8,
        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
      },
      {
        arrayStride: 12,
        stepMode: 'instance',
        attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }],
      },
    ]);

    this.frameId = requestAnimationFrame(this.renderLoop);
  }

  static async create(canvas: HTMLCanvasElement): Promise<WebGPUTreeSceneManager | null> {
    const gpu = await WebGPUContext.create(canvas);
    return gpu ? new WebGPUTreeSceneManager(gpu) : null;
  }

  private createPipeline(
    bindGroupLayout: GPUBindGroupLayout,
    source: string,
    buffers: GPUVertexBufferLayout[]
  ): GPURenderPipeline {
    const { device } = this.gpu;
    const module = device.createShaderModule({ code: `${commonWgsl}\n${source}` });
    return device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: { module, entryPoint: 'vertexMain', buffers },
      fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: this.gpu.format }] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: DEPTH_FORMAT, depthWriteEnabled: true, depthCompare: 'less' },
      multisample: { count: SAMPLE_COUNT },
    });
  }

  rebuild(config: MagicTreeConfig): void {
    if (this.disposed) return;
    const { device } = this.gpu;
    const theme = SEASON_THEMES[config.season];
    const accent = PALETTE_PRESETS.find((p) => p.id === config.palette) ?? PALETTE_PRESETS[0];
    const { size, matrix } = buildQRMatrix(config.targetUrl);

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

    this.groundInstances?.destroy();
    this.groundInstances = device.createBuffer({
      size: ground.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.groundInstances, 0, ground);
    this.groundCount = size * size;

    const palette = new Float32Array(PALETTE_UNIFORM_BYTES / 4);
    palette.set([...hexToRgb(theme.groundLight), 1], 0);
    palette.set([...hexToRgb(theme.groundDark), 1], 4);
    palette.set([...hexToRgb(theme.trunk), 1], 8);
    palette.set([...hexToRgb(accent.color), 1], 12);
    palette.set([0, 1, GROUND_Y, size / 2], 16);
    device.queue.writeBuffer(this.paletteUniform, 0, palette);

    const [r, g0, b] = hexToRgb(theme.background);
    this.background = { r, g: g0, b, a: 1 };
    this.camera.frameGrid(size);
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
      this.frameData.set(this.camera.viewProj(), 0);
      this.frameData[16] = (now - this.startTime) / 1000;
      this.frameData[17] = 1;
      this.frameData[18] = this.camera.treeAlpha;
      device.queue.writeBuffer(this.frameUniform, 0, this.frameData);

      const encoder = device.createCommandEncoder();
      const pass = this.gpu.beginPass(encoder, this.background);
      pass.setBindGroup(0, this.bindGroup);
      pass.setVertexBuffer(0, this.quadBuffer);

      pass.setPipeline(this.groundPipeline);
      pass.setVertexBuffer(1, this.groundInstances);
      pass.draw(6, this.groundCount);

      pass.end();
      device.queue.submit([encoder.finish()]);
    }

    this.frameId = requestAnimationFrame(this.renderLoop);
  };

  dispose(): void {
    this.disposed = true;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.groundInstances?.destroy();
    this.groundInstances = null;
    this.frameUniform.destroy();
    this.paletteUniform.destroy();
    this.quadBuffer.destroy();
    this.gpu.destroy();
  }
}
