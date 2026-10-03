import type { Orientation } from '@/lib/grid'

const PX_PER_MM = 96 / 25.4
// Must match GridView: 1.4rem cells separated by a 1px gap, with a 1px frame.
const CELL_PX = 1.4 * 16 + 1
const FRAME_PX = 2
const PAGE_SHORT_MM = 210
// Shorter than A4 (297mm) so the page also fits US Letter.
const PAGE_LONG_MM = 279
const PAGE_PADDING_MM = 6
const SAFETY = 0.97

export function printScale(cols: number, rows: number, orientation: Orientation): number {
  const gridWidth = cols * CELL_PX + FRAME_PX
  const gridHeight = rows * CELL_PX + FRAME_PX
  const shortSide = PAGE_SHORT_MM * PX_PER_MM
  const longSide = PAGE_LONG_MM * PX_PER_MM
  const padding = 2 * PAGE_PADDING_MM * PX_PER_MM
  const availableWidth = (orientation === 'landscape' ? longSide : shortSide) - padding
  const availableHeight = (orientation === 'landscape' ? shortSide : longSide) - padding
  return SAFETY * Math.min(availableWidth / gridWidth, availableHeight / gridHeight)
}
