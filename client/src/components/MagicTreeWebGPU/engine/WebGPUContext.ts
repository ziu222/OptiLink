/**
 * Device, canvas and render-target setup — spec §4.5/§7/§8.
 *
 * Owns the two textures that are the easiest leak in the feature: the depth
 * buffer and the 4x MSAA colour target, both recreated on every resize.
 */

export const SAMPLE_COUNT = 4;
export const DEPTH_FORMAT: GPUTextureFormat = 'depth24plus';
const MAX_PIXEL_RATIO = 2;

/** null means "no WebGPU here" — the caller renders the static SVG QR instead. */
export async function requestDevice(): Promise<GPUDevice | null> {
  if (!navigator.gpu) return null;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
    return await adapter.requestDevice();
  } catch {
    return null;
  }
}

export class WebGPUContext {
  readonly device: GPUDevice;
  readonly format: GPUTextureFormat;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: GPUCanvasContext;
  private depthTexture: GPUTexture | null = null;
  private msaaTexture: GPUTexture | null = null;
  private width = 0;
  private height = 0;
  private readonly observer: ResizeObserver;

  /** Called after the render targets have been resized. */
  onResize: ((width: number, height: number) => void) | null = null;

  private constructor(canvas: HTMLCanvasElement, device: GPUDevice, context: GPUCanvasContext) {
    this.canvas = canvas;
    this.device = device;
    this.context = context;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({ device, format: this.format, alphaMode: 'premultiplied' });
    this.resize();
    // Layout may not have given the canvas a width yet when the device
    // resolves — without this the first frames render into a 1px target.
    this.observer = new ResizeObserver(() => {
      if (this.resize()) this.onResize?.(this.width, this.height);
    });
    this.observer.observe(canvas);
  }

  static async create(canvas: HTMLCanvasElement): Promise<WebGPUContext | null> {
    const device = await requestDevice();
    if (!device) return null;
    const context = canvas.getContext('webgpu');
    if (!context) {
      device.destroy();
      return null;
    }
    return new WebGPUContext(canvas, device, context);
  }

  get pixelWidth(): number {
    return this.width;
  }

  get pixelHeight(): number {
    return this.height;
  }

  /** Resizes the backing store and render targets. True if anything changed. */
  resize(): boolean {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (width === this.width && height === this.height && this.depthTexture) return false;

    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.destroyTargets();
    this.depthTexture = this.device.createTexture({
      size: [width, height],
      format: DEPTH_FORMAT,
      sampleCount: SAMPLE_COUNT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.msaaTexture = this.device.createTexture({
      size: [width, height],
      format: this.format,
      sampleCount: SAMPLE_COUNT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    return true;
  }

  /** A render pass that clears to `background` and resolves MSAA to the canvas. */
  beginPass(encoder: GPUCommandEncoder, background: GPUColor): GPURenderPassEncoder {
    if (!this.depthTexture || !this.msaaTexture) throw new Error('Render targets are not ready');
    return encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.msaaTexture.createView(),
          resolveTarget: this.context.getCurrentTexture().createView(),
          clearValue: background,
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });
  }

  private destroyTargets(): void {
    this.depthTexture?.destroy();
    this.msaaTexture?.destroy();
    this.depthTexture = null;
    this.msaaTexture = null;
  }

  destroy(): void {
    this.observer.disconnect();
    this.destroyTargets();
    // Deliberately not unconfigure(): the canvas context is shared, and a
    // remount can configure it with a new device before this dispose runs.
    // Unconfiguring here would blank the canvas that already belongs to the
    // newer context.
    this.device.destroy();
  }
}
