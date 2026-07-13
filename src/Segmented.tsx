export function Segmented({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <span className="block text-sm font-semibold text-slate-700">{legend}</span>
      <div
        role="group"
        aria-label={legend}
        className="inline-flex overflow-hidden rounded-lg border border-slate-300"
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={
              'px-4 py-1.5 text-sm font-medium transition ' +
              (index > 0 ? 'border-l border-slate-300 ' : '') +
              (value === option.value
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100')
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
