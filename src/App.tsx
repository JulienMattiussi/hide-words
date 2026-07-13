import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { buildGrid } from '@/lib/grid'
import type { Orientation } from '@/lib/grid'
import { normalizeLetters, normalizeTextLines } from '@/lib/text'
import { GridView } from '@/GridView'
import type { RevealMode } from '@/GridView'

function toInt(value: number): number {
  return Number.isNaN(value) ? 0 : Math.round(value)
}

function joinLines(text: string): string {
  return normalizeTextLines(text).join(' ').trim()
}

const inputClass = 'rounded border border-slate-300 bg-white px-2 py-1'

export default function App() {
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [text1, setText1] = useState('JOUR')
  const [key1, setKey1] = useState('JOURNE')
  const [text2, setText2] = useState('NUIT')
  const [key2, setKey2] = useState('NEBCT')
  const [mode, setMode] = useState<RevealMode>('both')
  const [printMode, setPrintMode] = useState<RevealMode | null>(null)
  const [manualOffset, setManualOffset] = useState<{ dx: number; dy: number } | null>(null)

  const grid = useMemo(
    () =>
      buildGrid({
        orientation,
        first: { text: text1, key: key1 },
        second: { text: text2, key: key2 },
        offset: manualOffset ?? undefined,
      }),
    [orientation, text1, key1, text2, key2, manualOffset],
  )

  const label1 = joinLines(text1)
  const label2 = joinLines(text2)
  const shownMode = printMode ?? mode
  const hasSecondText = text2.trim().length > 0
  const showError = hasSecondText && !grid.keys.valid

  function printGrid(target: RevealMode) {
    flushSync(() => setPrintMode(target))
    if (typeof window.print === 'function') {
      window.print()
    }
    flushSync(() => setPrintMode(null))
  }

  function toggleManualOffset(enabled: boolean) {
    setManualOffset(enabled ? grid.offset : null)
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-6 lg:w-96 print:hidden">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">hidden-word</h1>
            <p className="text-sm text-slate-500">Cache deux codes dans une même grille de lettres.</p>
          </header>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">Orientation</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orientation"
                  checked={orientation === 'landscape'}
                  onChange={() => setOrientation('landscape')}
                />
                Paysage
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orientation"
                  checked={orientation === 'portrait'}
                  onChange={() => setOrientation('portrait')}
                />
                Portrait
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded border border-sky-200 bg-sky-50 p-3">
            <legend className="px-1 text-sm font-semibold text-sky-700">Code 1</legend>
            <label className="flex flex-col gap-1 text-sm">
              Message
              <textarea
                value={text1}
                rows={2}
                onChange={(event) => setText1(event.target.value)}
                className={`${inputClass} resize-y font-mono`}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Lettres du tracé (clé)
              <input
                type="text"
                value={key1}
                placeholder={normalizeLetters(text1) || 'clé'}
                onChange={(event) => setKey1(event.target.value)}
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 rounded border border-rose-200 bg-rose-50 p-3">
            <legend className="px-1 text-sm font-semibold text-rose-700">Code 2</legend>
            <label className="flex flex-col gap-1 text-sm">
              Message
              <textarea
                value={text2}
                rows={2}
                onChange={(event) => setText2(event.target.value)}
                className={`${inputClass} resize-y font-mono`}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Lettres du tracé (clé)
              <input
                type="text"
                value={key2}
                placeholder={normalizeLetters(text2) || 'clé'}
                onChange={(event) => setKey2(event.target.value)}
                className={inputClass}
              />
            </label>
          </fieldset>

          {showError ? (
            <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
              {grid.keys.reason}
            </p>
          ) : grid.secondActive ? (
            <p className="text-sm text-slate-600">
              Lettres partagées (intersections) : <strong>{grid.keys.shared.join(', ')}</strong>
            </p>
          ) : null}

          {grid.secondActive ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-slate-700">Décalage des tracés</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={manualOffset !== null}
                  onChange={(event) => toggleManualOffset(event.target.checked)}
                />
                Ajuster manuellement (sinon automatique)
              </label>
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm">
                  dx
                  <input
                    type="number"
                    value={grid.offset.dx}
                    disabled={manualOffset === null}
                    onChange={(event) => setManualOffset({ dx: toInt(event.target.valueAsNumber), dy: grid.offset.dy })}
                    className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1 text-sm">
                  dy
                  <input
                    type="number"
                    value={grid.offset.dy}
                    disabled={manualOffset === null}
                    onChange={(event) => setManualOffset({ dx: grid.offset.dx, dy: toInt(event.target.valueAsNumber) })}
                    className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                  />
                </label>
              </div>
            </fieldset>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">Affichage</legend>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" checked={mode === 'hidden'} onChange={() => setMode('hidden')} />
                Caché
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" checked={mode === 'both'} onChange={() => setMode('both')} />
                Les deux
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" checked={mode === 'first'} onChange={() => setMode('first')} />
                Code 1
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" checked={mode === 'second'} onChange={() => setMode('second')} />
                Code 2
              </label>
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => printGrid('hidden')}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Imprimer la grille cachée
            </button>
            <button
              type="button"
              onClick={() => printGrid('first')}
              className="rounded bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              Imprimer le code 1
            </button>
            <button
              type="button"
              onClick={() => printGrid('second')}
              className="rounded bg-rose-700 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Imprimer le code 2
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <GridView grid={grid} mode={shownMode} firstLabel={label1} secondLabel={label2} />
        </main>
      </div>
    </div>
  )
}
