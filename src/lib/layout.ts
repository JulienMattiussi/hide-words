export interface Offset {
  dx: number
  dy: number
}

export interface Placement {
  cols: number
  rows: number
  primary: boolean[][]
  secondary: boolean[][]
}

const SEARCH_WINDOW = 8

function dimensions(pattern: boolean[][]): { width: number; height: number } {
  const height = pattern.length
  const width = height > 0 ? (pattern[0]?.length ?? 0) : 0
  return { width, height }
}

export function overlapAt(a: boolean[][], b: boolean[][], dx: number, dy: number): number {
  const { width: wa, height: ha } = dimensions(a)
  let count = 0
  for (let y = 0; y < b.length; y++) {
    const row = b[y] ?? []
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue
      const ay = y + dy
      const ax = x + dx
      if (ay >= 0 && ay < ha && ax >= 0 && ax < wa && (a[ay]?.[ax] ?? false)) {
        count += 1
      }
    }
  }
  return count
}

export function bestOffset(a: boolean[][], b: boolean[][]): Offset {
  const { width: wa, height: ha } = dimensions(a)
  const { width: wb, height: hb } = dimensions(b)
  if (ha === 0 || hb === 0) return { dx: 0, dy: 0 }

  const centerX = Math.round((wa - wb) / 2)
  const centerY = Math.round((ha - hb) / 2)
  let bestAny: Offset = { dx: centerX, dy: centerY }
  let bestAnyOverlap = Infinity
  let bestPositive: Offset | null = null
  let bestPositiveOverlap = Infinity

  for (let ddy = -SEARCH_WINDOW; ddy <= SEARCH_WINDOW; ddy++) {
    for (let ddx = -SEARCH_WINDOW; ddx <= SEARCH_WINDOW; ddx++) {
      const dx = centerX + ddx
      const dy = centerY + ddy
      const overlap = overlapAt(a, b, dx, dy)
      if (overlap < bestAnyOverlap) {
        bestAnyOverlap = overlap
        bestAny = { dx, dy }
      }
      if (overlap >= 1 && overlap < bestPositiveOverlap) {
        bestPositiveOverlap = overlap
        bestPositive = { dx, dy }
      }
    }
  }
  return bestPositive ?? bestAny
}

export function placeMasks(a: boolean[][], b: boolean[][], dx: number, dy: number): Placement {
  const { width: wa, height: ha } = dimensions(a)
  const { width: wb, height: hb } = dimensions(b)
  const hasB = hb > 0
  const left = Math.min(0, hasB ? dx : 0)
  const top = Math.min(0, hasB ? dy : 0)
  const right = Math.max(wa, hasB ? dx + wb : 0)
  const bottom = Math.max(ha, hasB ? dy + hb : 0)
  const cols = Math.max(0, right - left)
  const rows = Math.max(0, bottom - top)

  const primary = paint(cols, rows, a, -left, -top)
  const secondary = hasB ? paint(cols, rows, b, dx - left, dy - top) : blank(cols, rows)
  return { cols, rows, primary, secondary }
}

function blank(cols: number, rows: number): boolean[][] {
  const grid: boolean[][] = []
  for (let y = 0; y < rows; y++) {
    grid.push(new Array<boolean>(cols).fill(false))
  }
  return grid
}

function paint(cols: number, rows: number, pattern: boolean[][], atX: number, atY: number): boolean[][] {
  const grid = blank(cols, rows)
  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y] ?? []
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue
      const gy = y + atY
      const gx = x + atX
      const target = grid[gy]
      if (target && gx >= 0 && gx < cols) {
        target[gx] = true
      }
    }
  }
  return grid
}
