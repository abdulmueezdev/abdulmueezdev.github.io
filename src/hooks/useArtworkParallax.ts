import { useEffect, useRef } from 'react'

export function useArtworkParallax() {
  const platesRef = useRef<(HTMLDivElement | null)[]>([])

  const setPlateRef = (index: number) => (el: HTMLDivElement | null) => {
    platesRef.current[index] = el
  }

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const visible = new Set<HTMLDivElement>()
    let frame = 0

    function paint() {
      frame = 0
      for (const plate of visible) {
        const rect = plate.getBoundingClientRect()
        const fraction = (innerHeight - rect.top) / (innerHeight + rect.height) - 0.5
        const offset = reduced.matches ? 0 : Math.max(-1, Math.min(1, fraction * 2)) * Math.min(16, rect.width * 0.022)
        plate.style.setProperty('--art-y', offset.toFixed(2) + 'px')
      }
    }

    function schedule() {
      if (!frame && visible.size) frame = requestAnimationFrame(paint)
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const target = entry.target as HTMLDivElement
        entry.isIntersecting ? visible.add(target) : visible.delete(target)
      }
      schedule()
    })

    const plates = platesRef.current.filter(Boolean) as HTMLDivElement[]
    plates.forEach(plate => observer.observe(plate))
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    reduced.addEventListener('change', () => {
      if (reduced.matches) plates.forEach(p => p.style.removeProperty('--art-y'))
      schedule()
    })

    return () => {
      observer.disconnect()
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  return { setPlateRef }
}
