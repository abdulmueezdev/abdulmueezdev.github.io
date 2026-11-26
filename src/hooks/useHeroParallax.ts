import { useEffect, useRef, useCallback } from 'react'

export function useHeroParallax() {
  const sceneRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
    const mobileQuery = matchMedia('(max-width: 768px), (pointer: coarse)')
    let start = 0
    let travel = 0
    let frame = 0
    let previous = -1

    function reset() {
      scene!.style.setProperty('--type-y', '0px')
      scene!.style.setProperty('--object-y', '0px')
      scene!.style.setProperty('--stage-opacity', '1')
    }

    function update() {
      frame = 0
      if (motionPreference.matches) {
        if (previous !== 0) {
          previous = 0
          reset()
        }
        return
      }
      const distance = Math.min(travel, Math.max(0, window.scrollY - start))
      const progress = distance / travel
      if (progress === previous) return
      previous = progress
      const isMobile = mobileQuery.matches
      const typeY = isMobile ? progress * 28 : distance * 0.26
      const objectY = isMobile ? -progress * 24 : -distance * 0.13
      const stageOpacity = isMobile ? 1 - progress * 0.1 : 1 - progress * 0.16
      scene!.style.setProperty('--type-y', typeY.toFixed(2) + 'px')
      scene!.style.setProperty('--object-y', objectY.toFixed(2) + 'px')
      scene!.style.setProperty('--stage-opacity', stageOpacity.toFixed(3))
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
    motionPreference.addEventListener('change', measure)
    mobileQuery.addEventListener('change', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(scene)
    measure()

    return () => {
      removeEventListener('scroll', schedule)
      removeEventListener('resize', measure)
      motionPreference.removeEventListener('change', measure)
      mobileQuery.removeEventListener('change', measure)
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return { sceneRef, stageRef }
}
