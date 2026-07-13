import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { buildGrid } from '@/lib/grid'
import type { Grid, Orientation } from '@/lib/grid'
import { normalizeLetters, normalizeTextLines } from '@/lib/text'

function GridView({ grid, reveal, word }: { grid: Grid; reveal: boolean; word: string }) {
  const label =
    reveal && word ? `Grille révélant le mot ${word}` : 'Grille de lettres, mot caché'
  return (
    <div className="w-full overflow-auto">
      <div
        role="img"
        aria-label={label}
        className="inline-grid gap-px bg-slate-300 p-px font-mono leading-none"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1.4rem)` }}
      >
        {grid.cells.map((cell, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={
              'flex h-[1.4rem] w-[1.4rem] items-center justify-center text-[0.8rem] ' +
              (reveal && cell.on
                ? 'bg-slate-900 font-bold text-slate-50'
                : 'bg-white text-slate-400')
            }
          >
            {cell.char}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [text, setText] = useState('CODE\nCACHÉ')
  const [fillLetters, setFillLetters] = useState('')
  const [reveal, setReveal] = useState(true)
  const [printReveal, setPrintReveal] = useState<boolean | null>(null)

  const grid = useMemo(
    () => buildGrid({ orientation, text, fillLetters }),
    [orientation, text, fillLetters],
  )

  const labelWord = normalizeTextLines(text).join(' ').trim()
  const fillHint = normalizeLetters(text)
  const shown = printReveal ?? reveal

  function printGrid(revealForPrint: boolean) {
    flushSync(() => setPrintReveal(revealForPrint))
    if (typeof window.print === 'function') {
      window.print()
    }
    flushSync(() => setPrintReveal(null))
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-5 lg:w-80 print:hidden">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">hidden-word</h1>
            <p className="text-sm text-slate-500">Cache un mot dans une grille de lettres.</p>
          </header>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">Orientation</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orientation"
                  value="landscape"
                  checked={orientation === 'landscape'}
                  onChange={() => setOrientation('landscape')}
                />
                Paysage
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orientation"
                  value="portrait"
                  checked={orientation === 'portrait'}
                  onChange={() => setOrientation('portrait')}
                />
                Portrait
              </label>
            </div>
            <span className="text-xs text-slate-500">
              La grille se dimensionne autour du texte.
            </span>
          </fieldset>

          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              Texte à cacher
              <textarea
                value={text}
                rows={4}
                onChange={(event) => setText(event.target.value)}
                className="resize-y rounded border border-slate-300 bg-white px-2 py-1 font-mono"
              />
              <span className="text-xs text-slate-500">Une ligne de texte = une rangée sur la grille.</span>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Lettres du tracé
              <input
                type="text"
                value={fillLetters}
                placeholder={fillHint || 'lettres du tracé'}
                onChange={(event) => setFillLetters(event.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1"
              />
              <span className="text-xs text-slate-500">
                Remplissent le tracé, répétées. Vide = les lettres du texte.
              </span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={reveal}
              onChange={(event) => setReveal(event.target.checked)}
              className="h-4 w-4"
            />
            Affichage révélé
          </label>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => printGrid(false)}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Imprimer la grille cachée
            </button>
            <button
              type="button"
              onClick={() => printGrid(true)}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Imprimer la grille révélée
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <GridView grid={grid} reveal={shown} word={labelWord} />
        </main>
      </div>
    </div>
  )
}
