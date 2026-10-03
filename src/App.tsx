import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import { buildGrid } from '@/lib/grid'
import type { Orientation } from '@/lib/grid'
import type { Offset } from '@/lib/layout'
import { autoOffsets } from '@/lib/layout'
import { textToPattern } from '@/lib/pattern'
import { printScale } from '@/lib/print'
import { normalizeLetters, normalizeTextLines } from '@/lib/text'
import { AppIcon } from '@/AppIcon'
import { GridView } from '@/GridView'
import { Segmented } from '@/Segmented'

function toInt(value: number): number {
  return Number.isNaN(value) ? 0 : Math.round(value)
}

function joinLines(text: string): string {
  return normalizeTextLines(text).join(' ').trim()
}

function setAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item))
}

const inputClass = 'rounded border border-slate-300 bg-white px-2 py-1'
const PANEL = [
  'border-sky-200 bg-sky-50',
  'border-rose-200 bg-rose-50',
  'border-amber-200 bg-amber-50',
]
const LEGEND = ['text-sky-700', 'text-rose-700', 'text-amber-700']

export default function App() {
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [codeCount, setCodeCount] = useState(3)
  const [texts, setTexts] = useState<string[]>(['JOUR', 'NUIT', 'SOIR'])
  const [manualKeys, setManualKeys] = useState<string[]>(['bêtement', 'trop fort', 'les clefs'])
  const [revealed, setRevealed] = useState(0b111)
  const [printReveal, setPrintReveal] = useState<number | null>(null)
  const [offsets, setOffsets] = useState<Offset[]>([
    { dx: 0, dy: 0 },
    { dx: -6, dy: 1 },
    { dx: -5, dy: -1 },
  ])

  const grid = useMemo(() => {
    const codes = texts.slice(0, codeCount).map((text, index) => ({ text, key: manualKeys[index] }))
    return buildGrid({ orientation, codes, offsets })
  }, [orientation, codeCount, texts, manualKeys, offsets])

  const labels = texts.slice(0, codeCount).map(joinLines)
  const shownReveal = printReveal ?? revealed
  const activeIndexes = Array.from({ length: codeCount }, (_, index) => index)

  const scale = printScale(grid.cols, grid.rows, orientation)

  useEffect(() => {
    const id = 'hw-page-style'
    let style = document.getElementById(id)
    if (!style) {
      style = document.createElement('style')
      style.id = id
      document.head.appendChild(style)
    }
    style.textContent = `@media print { @page { size: ${orientation}; margin: 0; } }`
  }, [orientation])

  function generateKeys() {
    setManualKeys((previous) =>
      previous.map((key, index) => (index < codeCount ? (grid.suggested[index] ?? '') : key)),
    )
  }

  function generatePlacement() {
    const patterns = texts.slice(0, codeCount).map((text) => textToPattern(text))
    const auto = autoOffsets(patterns)
    setOffsets((previous) =>
      previous.map((offset, index) => (index < codeCount ? (auto[index] ?? offset) : offset)),
    )
  }

  function setOffsetValue(index: number, axis: 'dx' | 'dy', value: number) {
    setOffsets((previous) =>
      previous.map((offset, i) => (i === index ? { ...offset, [axis]: value } : offset)),
    )
  }

  function printGrid(bits: number) {
    flushSync(() => setPrintReveal(bits))
    if (typeof window.print === 'function') window.print()
    flushSync(() => setPrintReveal(null))
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <header className="flex items-center gap-3 print:hidden">
          <AppIcon />
          <div>
            <h1 className="bg-linear-to-r from-sky-600 via-violet-600 to-rose-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Hide Words
            </h1>
            <p className="text-sm text-slate-500">
              Cache jusqu'à trois codes dans une grille de lettres.
            </p>
          </div>
        </header>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            <Segmented
              legend="Codes"
              value={String(codeCount)}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
              ]}
              onChange={(value) => {
                const next = Number(value)
                setCodeCount(next)
                setRevealed((1 << next) - 1)
              }}
            />
            <Segmented
              legend="Orientation"
              value={orientation}
              options={[
                { value: 'landscape', label: 'Paysage' },
                { value: 'portrait', label: 'Portrait' },
              ]}
              onChange={(value) => setOrientation(value as Orientation)}
            />
            <div className="space-y-1">
              <span className="block text-sm font-semibold text-slate-700">Clés</span>
              <button
                type="button"
                onClick={generateKeys}
                className="rounded bg-violet-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
              >
                Générer des mots clés
              </button>
              {grid.keyStatus.valid ? (
                <p className="text-xs text-emerald-700">Combinaison valide.</p>
              ) : (
                <p role="alert" className="text-xs text-red-700">
                  {grid.keyStatus.reason}
                </p>
              )}
            </div>
            {codeCount > 1 ? (
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-slate-700">Placement</span>
                <button
                  type="button"
                  onClick={generatePlacement}
                  className="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600"
                >
                  Placement automatique
                </button>
              </div>
            ) : null}
            <div className="ml-auto space-y-1">
              <span className="block text-sm font-semibold text-slate-700">Impression</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => printGrid(0)}
                  className="rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Grille cachée
                </button>
                <button
                  type="button"
                  onClick={() => printGrid((1 << codeCount) - 1)}
                  className="rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Solutions
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {activeIndexes.map((index) => {
              const offset = offsets[index] ?? { dx: 0, dy: 0 }
              return (
                <fieldset
                  key={index}
                  className={`space-y-2 rounded border p-3 ${PANEL[index] ?? ''}`}
                >
                  <legend className={`px-1 text-sm font-semibold ${LEGEND[index] ?? ''}`}>
                    Code {index + 1}
                  </legend>
                  <label className="flex flex-col gap-1 text-sm">
                    Message
                    <textarea
                      value={texts[index] ?? ''}
                      rows={2}
                      onChange={(event) => setTexts(setAt(texts, index, event.target.value))}
                      className={`${inputClass} resize-y font-mono`}
                    />
                  </label>
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="flex flex-col gap-1 text-sm">
                      Clé
                      <input
                        type="text"
                        aria-label="Clé (lettres du tracé)"
                        value={manualKeys[index] ?? ''}
                        placeholder={normalizeLetters(texts[index] ?? '') || 'clé'}
                        onChange={(event) =>
                          setManualKeys(setAt(manualKeys, index, event.target.value))
                        }
                        className={`${inputClass} w-28`}
                      />
                    </label>
                    {index > 0 ? (
                      <div className="ml-auto flex gap-2">
                        <label className="flex w-14 flex-col gap-1 text-sm">
                          dx
                          <input
                            type="number"
                            value={offset.dx}
                            onChange={(event) =>
                              setOffsetValue(index, 'dx', toInt(event.target.valueAsNumber))
                            }
                            className={`${inputClass} w-full`}
                          />
                        </label>
                        <label className="flex w-14 flex-col gap-1 text-sm">
                          dy
                          <input
                            type="number"
                            value={offset.dy}
                            onChange={(event) =>
                              setOffsetValue(index, 'dy', toInt(event.target.valueAsNumber))
                            }
                            className={`${inputClass} w-full`}
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={(revealed & (1 << index)) !== 0}
                        onChange={() => setRevealed(revealed ^ (1 << index))}
                      />
                      Afficher
                    </label>
                    <button
                      type="button"
                      onClick={() => printGrid(1 << index)}
                      className="rounded bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-500"
                    >
                      Imprimer
                    </button>
                  </div>
                </fieldset>
              )
            })}
          </div>
        </section>

        <main
          className="hw-print-area"
          style={{ ['--hw-print-scale']: String(scale) } as CSSProperties}
        >
          <GridView grid={grid} revealed={shownReveal} labels={labels} />
        </main>
      </div>
    </div>
  )
}
