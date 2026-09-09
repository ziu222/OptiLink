import qrcode from 'qrcode-generator';

export interface QRGridData {
  size: number;
  matrix: boolean[][];
}

export function buildQRMatrix(url: string): QRGridData {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('URL is required to build a QR matrix');
  }

  const qr = qrcode(0, 'M');
  qr.addData(trimmed);
  qr.make();

  const size = qr.getModuleCount();
  const matrix: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    matrix[r] = [];
    for (let c = 0; c < size; c++) {
      matrix[r][c] = qr.isDark(r, c);
    }
  }

  return { size, matrix };
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
