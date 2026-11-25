import { useEffect, useRef, useState, type CSSProperties } from 'react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHidden, setIsHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: '120px' },
    )
    io.observe(el)

    const onVisibility = () => setIsHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--grid-opacity': opacity,
  } as CSSProperties

  const isPaused = !isVisible || isHidden

  return (
    <div
      ref={containerRef}
      className={`retro-grid-container${isPaused ? ' is-paused' : ''} ${className}`.trim()}
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
