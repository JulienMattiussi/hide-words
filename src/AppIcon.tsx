const SLATE = '#334155'
const CELLS = [
  { x: 6, y: 6, fill: SLATE },
  { x: 17, y: 6, fill: SLATE },
  { x: 28, y: 6, fill: '#0ea5e9' },
  { x: 6, y: 17, fill: SLATE },
  { x: 17, y: 17, fill: '#f43f5e' },
  { x: 28, y: 17, fill: SLATE },
  { x: 6, y: 28, fill: '#f59e0b' },
  { x: 17, y: 28, fill: SLATE },
  { x: 28, y: 28, fill: SLATE },
]

export function AppIcon() {
  return (
    <svg viewBox="0 0 42 42" width="42" height="42" aria-hidden="true" className="shrink-0">
      <rect width="42" height="42" rx="10" fill="#0f172a" />
      {CELLS.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width="8"
          height="8"
          rx="2"
          fill={cell.fill}
        />
      ))}
    </svg>
  )
}
