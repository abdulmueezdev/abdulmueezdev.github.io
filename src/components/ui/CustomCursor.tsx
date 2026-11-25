import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

// Exact Skiper61 spring physics constants
const SPRING = {
  mass: 0.1, // Controls inertia (lower mass = snappier motion)
  damping: 10, // Weight and bounce absorption
  stiffness: 131, // Return speed tension
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [visible, setVisible] = useState(false)

  // SimpleMouseFollow direct motion values (Dark Sections: #home, #contact)
  const directX = useMotionValue(-100)
  const directY = useMotionValue(-100)
  const directOpacity = useMotionValue(0)

  // SpringMouseFollow values (Light Sections: #work, #skills, #profile)
  const springTargetX = useMotionValue(-100)
  const springTargetY = useMotionValue(-100)
  const springTargetOpacity = useMotionValue(0)
  const springTargetScale = useMotionValue(1)

  const xSpring = useSpring(springTargetX, SPRING)
  const ySpring = useSpring(springTargetY, SPRING)
  const opacitySpring = useSpring(springTargetOpacity, SPRING)
  const scaleSpring = useSpring(springTargetScale, SPRING)

  useEffect(() => {
    // Only enable on fine pointer devices and when reduced motion is not requested
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!finePointer || coarsePointer || reducedMotion) {
      setEnabled(false)
      return
    }

    setEnabled(true)

    const onPointerMove = (e: PointerEvent) => {
      setVisible(true)

      // Update SimpleMouseFollow (instant 0-lag tracking)
      directX.set(e.clientX)
      directY.set(e.clientY)
      directOpacity.set(1)

      // Update SpringMouseFollow (spring tracking)
      springTargetX.set(e.clientX)
      springTargetY.set(e.clientY)
      springTargetOpacity.set(1)

      // Element-level then section-level cursor theme detection under pointer
      const target = document.elementFromPoint(e.clientX, e.clientY)
      if (target) {
        const themeElement = target.closest('[data-cursor-theme]')
        if (themeElement) {
          const cursorTheme = themeElement.getAttribute('data-cursor-theme')
          // 'dark' surfaces and explicit 'light' cursor overrides (e.g. orange buttons) use Paper white dot
          setTheme(cursorTheme === 'dark' || cursorTheme === 'light' ? 'dark' : 'light')
        } else {
          // Fallback based on section ID
          const section = target.closest('section, footer, header')
          if (section) {
            const id = section.id
            if (id === 'home' || id === 'contact') {
              setTheme('dark')
            } else {
              setTheme('light')
            }
          }
        }

        // Check if hovering interactive controls for subtle reactive scale
        const interactive = !!target.closest('a, button, input, textarea, select, [role="button"], [role="tab"]')
        springTargetScale.set(interactive ? 1.25 : 1)
      }
    }

    const onPointerEnter = () => {
      setVisible(true)
      directOpacity.set(1)
      springTargetOpacity.set(1)
    }

    const onPointerLeave = () => {
      setVisible(false)
      directOpacity.set(0)
      springTargetOpacity.set(0)
      springTargetScale.set(0)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerenter', onPointerEnter)
    document.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerenter', onPointerEnter)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [directX, directY, directOpacity, springTargetX, springTargetY, springTargetOpacity, springTargetScale])

  if (!enabled) return null

  const isDark = theme === 'dark'

  return (
    <div className="skiper61-cursor-container" aria-hidden="true">
      {/* Dark Sections Mode: Crisp Paper white/silver 20px dot (SimpleMouseFollow) */}
      <motion.div
        className="skiper61-simple-dot"
        style={{
          x: directX,
          y: directY,
          opacity: isDark && visible ? directOpacity : 0,
          scale: scaleSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Light Sections Mode: Snappy Ember orange 20px dot with SPRING physics (SpringMouseFollow) */}
      <motion.div
        className="skiper61-spring-dot"
        style={{
          x: xSpring,
          y: ySpring,
          opacity: !isDark && visible ? opacitySpring : 0,
          scale: scaleSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </div>
  )
}
