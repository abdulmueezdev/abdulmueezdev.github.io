import { useEffect, useRef } from 'react'

export function useMonitorTilt() {
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return

    const allowTilt = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')

    function onMove(event: PointerEvent) {
      if (!allowTilt.matches) return
      const rect = shell!.getBoundingClientRect()
      shell!.style.setProperty('--tilt-y', ((event.clientX - rect.left) / rect.width * 9 - 4.5) + 'deg')
      shell!.style.setProperty('--tilt-x', (3 - (event.clientY - rect.top) / rect.height * 6) + 'deg')
    }

    function resetTilt() {
      shell!.style.removeProperty('--tilt-x')
      shell!.style.removeProperty('--tilt-y')
    }

    shell.addEventListener('pointermove', onMove)
    shell.addEventListener('pointerleave', resetTilt)
    allowTilt.addEventListener('change', resetTilt)

    return () => {
      shell.removeEventListener('pointermove', onMove)
      shell.removeEventListener('pointerleave', resetTilt)
      allowTilt.removeEventListener('change', resetTilt)
    }
  }, [])

  return shellRef
}
