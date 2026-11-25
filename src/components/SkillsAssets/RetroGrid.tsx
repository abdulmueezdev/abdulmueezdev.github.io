import type { CSSProperties } from 'react'

interface RetroGridProps {
  className?: string
  angle?: number
  cellSize?: number
  opacity?: number
}

export function RetroGrid({
  className = '',
  angle = 65,
  cellSize = 60,
  opacity = 1,
}: RetroGridProps) {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--grid-opacity': opacity,
  } as CSSProperties

  return (
    <div
      className={`retro-grid-container ${className}`.trim()}
      style={gridStyles}
      aria-hidden="true"
    >
      <div className="retro-grid-perspective-layer">
        <div className="retro-grid-lines" />
      </div>
      <div className="retro-grid-fade" />
    </div>
  )
}
