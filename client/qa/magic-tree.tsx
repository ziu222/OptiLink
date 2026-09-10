import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import jsQR from 'jsqr';
import { WebGPUTreeSceneManager } from '../src/components/MagicTreeWebGPU/engine/WebGPUTreeSceneManager';
import { MagicTreeWebGPUContainer } from '../src/components/MagicTreeWebGPU/MagicTreeWebGPUContainer';
import type { SeasonId } from '../src/components/MagicTreeQR/types/magicTree';

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const results = document.querySelector('#results')!;
const status = document.querySelector('#status')!;
const buffers = new Set<GPUBuffer>();
const textures = new Set<GPUTexture>();
let latestDevice: GPUDevice | null = null;
let root: ReturnType<typeof createRoot> | null = null;

// Test-only instrumentation: track explicit ownership across real rebuilds,
// resizes and disposal. Nothing here is imported by the production app.
if (navigator.gpu) {
  const createBuffer = GPUDevice.prototype.createBuffer;
  const createTexture = GPUDevice.prototype.createTexture;
  GPUDevice.prototype.createBuffer = function (descriptor) {
    // The device is deliberately retained by this fault-injection harness.
    // oxlint-disable-next-line typescript/no-this-alias
    latestDevice = this;
    const buffer = createBuffer.call(this, descriptor);
    buffers.add(buffer);
    const destroy = buffer.destroy.bind(buffer);
    buffer.destroy = () => { buffers.delete(buffer); destroy(); };
    return buffer;
  };
  GPUDevice.prototype.createTexture = function (descriptor) {
    const texture = createTexture.call(this, descriptor);
    textures.add(texture);
    const destroy = texture.destroy.bind(texture);
    texture.destroy = () => { textures.delete(texture); destroy(); };
    return texture;
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
const report = (ok: boolean, message: string) => {
  const item = document.createElement('li');
  item.className = ok ? 'pass' : 'fail';
  item.textContent = (ok ? 'PASS ' : 'FAIL ') + message;
  results.append(item);
  if (!ok) throw new Error(message);
};

function pixels() {
  const copy = document.createElement('canvas');
  copy.width = canvas.width; copy.height = canvas.height;
  const context = copy.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(canvas, 0, 0);
  return context.getImageData(0, 0, copy.width, copy.height);
}

async function run() {
  results.replaceChildren(); status.textContent = 'Running actual GPU scan checks…';
  root?.unmount(); root = null;
  const manager = await WebGPUTreeSceneManager.create(canvas);
  if (!manager) throw new Error('WebGPU unavailable');
  const urls = ['https://optilink.app', 'https://example.com/a?campaign=summer&source=magic-tree', 'https://example.com/' + 'long-path-'.repeat(18)];
  let scans = 0;
  try {
    manager.setMotion(true, true);
    manager.toggleView(true);
    for (const [width, height] of [[600, 600], [340, 450]]) {
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      await sleep(100);
      for (const season of ['spring', 'summer', 'autumn', 'winter'] as SeasonId[]) {
        for (const targetUrl of urls) {
          manager.rebuild({ targetUrl, season, palette: 'rose' });
          await nextFrame();
          const frame = pixels();
          const decoded = jsQR(frame.data, frame.width, frame.height);
          report(decoded?.data === targetUrl, `scan ${season} ${width}x${height}, ${targetUrl.length} characters`);
          scans++;
        }
      }
    }
    const steadyBuffers = buffers.size, steadyTextures = textures.size;
    for (let i = 0; i < 20; i++) {
      canvas.style.width = (i % 2 ? 500 : 420) + 'px';
      canvas.style.height = (i % 2 ? 430 : 550) + 'px';
      manager.rebuild({ targetUrl: urls[i % urls.length], season: i % 2 ? 'summer' : 'spring', palette: 'rose' });
      await sleep(35);
      report(buffers.size === steadyBuffers && textures.size === steadyTextures, `rebuild/resize ${i + 1}: ${buffers.size} buffers, ${textures.size} targets`);
    }
    manager.dispose();
    await nextFrame();
    report(buffers.size === 0 && textures.size === 0, 'all GPU buffers and targets released on dispose');
    status.textContent = `PASS: ${scans} real GPU QR decodes; 20 rebuild/resize cycles; no retained buffers/textures.`;
  } finally { manager.dispose(); }
}

async function fallback(deviceLoss: boolean) {
  root?.unmount(); root = null;
  const gpu = navigator.gpu;
  const oldDescriptor = Object.getOwnPropertyDescriptor(navigator, 'gpu');
  if (!deviceLoss) Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true });
  try {
    root = createRoot(document.querySelector('#fallback-host')!);
    root.render(<StrictMode><MagicTreeWebGPUContainer embedded /></StrictMode>);
    await sleep(1200);
    if (deviceLoss) { latestDevice?.destroy(); await sleep(400); }
    const svg = document.querySelector<SVGElement>('#fallback-host svg.tree-static-qr');
    report(!!svg, deviceLoss ? 'device loss replaces the canvas with static QR' : 'unsupported browser displays static QR');
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg!));
    await image.decode();
    const copy = document.createElement('canvas'); copy.width = 600; copy.height = 600;
    const ctx = copy.getContext('2d')!; ctx.drawImage(image, 0, 0, 600, 600);
    const rgba = ctx.getImageData(0, 0, 600, 600);
    report(jsQR(rgba.data, 600, 600)?.data === 'https://optilink.app', 'fallback QR decodes to exact URL');
    status.textContent = deviceLoss ? 'PASS: device-loss fallback decoded.' : 'PASS: unsupported-browser fallback decoded.';
  } finally {
    if (!deviceLoss) {
      if (oldDescriptor) Object.defineProperty(navigator, 'gpu', oldDescriptor);
      else delete (navigator as unknown as { gpu?: GPU }).gpu;
    }
  }
  report(navigator.gpu === gpu, 'GPU capability restored after fallback test');
}

async function motion() {
  root?.unmount(); root = null;
  canvas.style.width = '600px'; canvas.style.height = '600px';
  const manager = await WebGPUTreeSceneManager.create(canvas);
  if (!manager) throw new Error('WebGPU unavailable');
  try {
    manager.rebuild({ targetUrl: 'https://optilink.app', season: 'spring', palette: 'rose' });
    manager.setMotion(false, false);
    await sleep(120); await nextFrame(); const a = pixels().data;
    await sleep(250); await nextFrame(); const b = pixels().data;
    report(a.some((v, i) => v !== b[i]), 'wind and petals change rendered pixels over time');
    manager.setMotion(true, false);
    await nextFrame(); const c = pixels().data;
    await sleep(150); await nextFrame(); const d = pixels().data;
    report(c.every((v, i) => v === d[i]), 'pause freezes ambient animation exactly');
    manager.setMotion(false, true);
    await nextFrame(); const e = pixels().data;
    await sleep(150); await nextFrame(); const f = pixels().data;
    report(e.every((v, i) => v === f[i]), 'reduced motion freezes ambient animation exactly');
    manager.setMotion(false, false);
    manager.toggleView(); await sleep(300); manager.toggleView(); await sleep(180);
    let settledFlat = false; manager.onViewSettled = flat => { settledFlat = flat; };
    manager.toggleView(); await sleep(1100); await nextFrame();
    const frame = pixels();
    report(settledFlat && jsQR(frame.data, frame.width, frame.height)?.data === 'https://optilink.app', 'interrupted camera transition settles into a decodable QR');
    status.textContent = 'PASS: motion, pause, reduced motion and transition interruption.';
  } finally { manager.dispose(); }
}

for (const [id, action] of [['run', run], ['fallback', () => fallback(false)], ['lost', () => fallback(true)], ['motion', motion]] as const) {
  document.getElementById(id)!.addEventListener('click', async () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => { button.disabled = true; });
    try { await action(); }
    catch (error) { status.textContent = 'FAIL: ' + String(error); }
    finally { buttons.forEach(button => { button.disabled = false; }); }
  });
}
