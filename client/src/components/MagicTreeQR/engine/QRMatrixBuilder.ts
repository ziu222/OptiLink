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
