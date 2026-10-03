export interface Offset {
  dx: number
  dy: number
}

export interface Composition {
  cols: number
  rows: number
  masks: boolean[][][]
}

const SEARCH_WINDOW = 8

function dimensions(pattern: boolean[][]): { width: number; height: number } {
  const height = pattern.length
  const width = height > 0 ? (pattern[0]?.length ?? 0) : 0
  return { width, height }
}

function cellKey(x: number, y: number): string {
  return `${x},${y}`
}

function addOccupied(occupied: Set<string>, pattern: boolean[][], offset: Offset): void {
  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y] ?? []
    for (let x = 0; x < row.length; x++) {
      if (row[x]) occupied.add(cellKey(x + offset.dx, y + offset.dy))
    }
  }
}

function overlapWithOccupied(occupied: Set<string>, pattern: boolean[][], offset: Offset): number {
  let count = 0
  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y] ?? []
    for (let x = 0; x < row.length; x++) {
      if (row[x] && occupied.has(cellKey(x + offset.dx, y + offset.dy))) count += 1
    }
  }
  return count
}

export function autoOffsets(patterns: boolean[][][]): Offset[] {
  const reference = dimensions(patterns[0] ?? [])
  const occupied = new Set<string>()
  const offsets: Offset[] = []

  patterns.forEach((pattern) => {
    const dim = dimensions(pattern)
    if (dim.height === 0) {
      offsets.push({ dx: 0, dy: 0 })
      return
    }
    if (occupied.size === 0) {
      const off = { dx: 0, dy: 0 }
      offsets.push(off)
      addOccupied(occupied, pattern, off)
      return
    }
    const centerX = Math.round((reference.width - dim.width) / 2)
    const centerY = Math.round((reference.height - dim.height) / 2)
    let bestAny: Offset = { dx: centerX, dy: centerY }
    let bestAnyOverlap = Infinity
    let bestPositive: Offset | null = null
    let bestPositiveOverlap = Infinity
    for (let ddy = -SEARCH_WINDOW; ddy <= SEARCH_WINDOW; ddy++) {
      for (let ddx = -SEARCH_WINDOW; ddx <= SEARCH_WINDOW; ddx++) {
        const off = { dx: centerX + ddx, dy: centerY + ddy }
        const overlap = overlapWithOccupied(occupied, pattern, off)
        if (overlap < bestAnyOverlap) {
          bestAnyOverlap = overlap
          bestAny = off
        }
        if (overlap >= 1 && overlap < bestPositiveOverlap) {
          bestPositiveOverlap = overlap
          bestPositive = off
        }
      }
    }
    const chosen = bestPositive ?? bestAny
    offsets.push(chosen)
    addOccupied(occupied, pattern, chosen)
  })

  return offsets
}

function blank(cols: number, rows: number): boolean[][] {
  const grid: boolean[][] = []
  for (let y = 0; y < rows; y++) {
    grid.push(new Array<boolean>(cols).fill(false))
  }
  return grid
}

function paint(
  cols: number,
  rows: number,
  pattern: boolean[][],
  atX: number,
  atY: number,
): boolean[][] {
  const grid = blank(cols, rows)
  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y] ?? []
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue
      const target = grid[y + atY]
      const gx = x + atX
      if (target && gx >= 0 && gx < cols) target[gx] = true
    }
  }
  return grid
}

export function composeMasks(patterns: boolean[][][], offsets: Offset[]): Composition {
  let left = 0
  let top = 0
  let right = 0
  let bottom = 0
  let any = false
  patterns.forEach((pattern, index) => {
    const dim = dimensions(pattern)
    if (dim.height === 0) return
    const off = offsets[index] ?? { dx: 0, dy: 0 }
    left = Math.min(left, off.dx)
    top = Math.min(top, off.dy)
    right = Math.max(right, off.dx + dim.width)
    bottom = Math.max(bottom, off.dy + dim.height)
    any = true
  })
  if (!any) return { cols: 0, rows: 0, masks: patterns.map(() => []) }

  const cols = right - left
  const rows = bottom - top
  const masks = patterns.map((pattern, index) => {
    const dim = dimensions(pattern)
    if (dim.height === 0) return blank(cols, rows)
    const off = offsets[index] ?? { dx: 0, dy: 0 }
    return paint(cols, rows, pattern, off.dx - left, off.dy - top)
  })
  return { cols, rows, masks }
}
