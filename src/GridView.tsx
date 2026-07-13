import type { Grid } from '@/lib/grid'

export type RevealMode = 'hidden' | 'first' | 'second' | 'both'

const BASE = 'bg-white text-slate-400'
const COLOR_FIRST = 'bg-sky-600 font-bold text-white'
const COLOR_SECOND = 'bg-rose-600 font-bold text-white'
const COLOR_SHARED = 'bg-violet-700 font-bold text-white'

function cellClass(primary: boolean, secondary: boolean, mode: RevealMode): string {
  if (mode === 'first') return primary ? COLOR_FIRST : BASE
  if (mode === 'second') return secondary ? COLOR_SECOND : BASE
  if (mode === 'both') {
    if (primary && secondary) return COLOR_SHARED
    if (primary) return COLOR_FIRST
    if (secondary) return COLOR_SECOND
  }
  return BASE
}

function label(mode: RevealMode, first: string, second: string): string {
  if (mode === 'first') return `Grille révélant le code 1 : ${first}`
  if (mode === 'second') return `Grille révélant le code 2 : ${second}`
  if (mode === 'both') return `Grille révélant les deux codes : ${first} et ${second}`
  return 'Grille de lettres, codes cachés'
}

export function GridView({
  grid,
  mode,
  firstLabel,
  secondLabel,
}: {
  grid: Grid
  mode: RevealMode
  firstLabel: string
  secondLabel: string
}) {
  return (
    <div className="w-full overflow-auto">
      <div
        role="img"
        aria-label={label(mode, firstLabel, secondLabel)}
        className="inline-grid gap-px bg-slate-300 p-px font-mono leading-none"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1.4rem)` }}
      >
        {grid.cells.map((cell, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={
              'flex h-[1.4rem] w-[1.4rem] items-center justify-center text-[0.8rem] ' +
              cellClass(cell.primary, cell.secondary, mode)
            }
          >
            {cell.char}
          </span>
        ))}
      </div>
    </div>
  )
}
