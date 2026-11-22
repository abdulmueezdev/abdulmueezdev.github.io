import { useEffect, useRef, useCallback } from 'react'

export function useHeroParallax() {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
    let start = 0
    let travel = 0
    let frame = 0
    let previous = -1

    function update() {
      frame = 0
      const distance = motionPreference.matches ? 0 : Math.min(travel, Math.max(0, window.scrollY - start))
      const progress = distance / travel
      if (progress === previous) return
      previous = progress
      scene!.style.setProperty('--type-y', (distance * 0.26).toFixed(2) + 'px')
      scene!.style.setProperty('--object-y', (-distance * 0.13).toFixed(2) + 'px')
      scene!.style.setProperty('--stage-opacity', (1 - progress * 0.16).toFixed(3))
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    function measure() {
      start = scene!.getBoundingClientRect().top + window.scrollY
      travel = Math.max(1, Math.min(stage!.clientHeight * 0.8, innerWidth < 720 ? 220 : 430))
      previous = -1
      schedule()
    }

    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', measure)
    motionPreference.addEventListener('change', schedule)
    const observer = new ResizeObserver(measure)
    observer.observe(scene)
    measure()

    return () => {
      removeEventListener('scroll', schedule)
      removeEventListener('resize', measure)
      motionPreference.removeEventListener('change', schedule)
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return { sceneRef, stageRef }
}
