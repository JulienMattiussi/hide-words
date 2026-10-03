import { bitsOf, popcount } from '@/lib/bits'
import type { Grid } from '@/lib/grid'

const BASE = 'bg-white text-slate-400'
const SHARED = 'bg-violet-700 font-bold text-white'
const CODE_COLORS = [
  'bg-sky-600 font-bold text-white',
  'bg-rose-600 font-bold text-white',
  'bg-amber-500 font-bold text-white',
]

function cellClass(mask: number, revealed: number): string {
  const shown = mask & revealed
  if (shown === 0) return BASE
  if (popcount(shown) === 1) return CODE_COLORS[bitsOf(shown, CODE_COLORS.length)[0] ?? 0] ?? SHARED
  return SHARED
}

function label(revealed: number, labels: string[]): string {
  const names = labels.filter((_, index) => revealed & (1 << index))
  if (names.length === 0) return 'Grille de lettres, codes cachés'
  return `Grille révélant : ${names.join(', ')}`
}

export function GridView({
  grid,
  revealed,
  labels,
}: {
  grid: Grid
  revealed: number
  labels: string[]
}) {
  return (
    <div className="hw-scroll w-full overflow-auto">
      <div
        role="img"
        aria-label={label(revealed, labels)}
        className="hw-grid inline-grid gap-px bg-slate-300 p-px font-mono leading-none"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1.4rem)` }}
      >
        {grid.cells.map((cell, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={
              'flex h-[1.4rem] w-[1.4rem] items-center justify-center text-[0.8rem] ' +
              cellClass(cell.mask, revealed)
            }
          >
            {cell.char}
          </span>
        ))}
      </div>
    </div>
  )
}
