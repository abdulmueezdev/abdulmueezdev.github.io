import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import directionsImg from '../../assets/mascot/penguin/directions.png'
import reactionsImg from '../../assets/mascot/penguin/reactions.png'

const DIRECTIONS = [
  'up-left',
  'up',
  'up-right',
  'left',
  'center',
  'right',
  'down-left',
  'down',
  'down-right',
] as const

const REACTIONS = [
  'blink',
  'heart',
  'sparkle',
  'surprised',
  'wink',
  'bashful',
  'sleepy',
  'dizzy',
  'delighted',
] as const

type Direction = (typeof DIRECTIONS)[number]
type Reaction = (typeof REACTIONS)[number]

const CLOCKWISE: Direction[] = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
]
const SECTOR = (Math.PI * 2) / CLOCKWISE.length
const HYSTERESIS = 0.12
const DEAD_ZONE = 60

const PAYOFFS: Reaction[] = ['heart', 'sparkle', 'delighted']
const BOOP_PAYOFF = 130
const BOOP_END = 620
const SQUASH_MS = 420
const DIZZY_AFTER = 4
const DIZZY_WINDOW = 1800
const DIZZY_END = 1200

const SQUASH: Keyframe[] = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.12, 0.85)', offset: 0.18, easing: 'ease-out' },
  { transform: 'scale(0.94, 1.09)', offset: 0.45, easing: 'ease-in-out' },
  { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
  { transform: 'scale(1, 1)' },
]

function cell(index: number): CSSProperties {
  return { backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` }
}

function wrap(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

const layer: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: '300% 300%',
  backgroundRepeat: 'no-repeat',
}

export interface PenguinMascotProps {
  size?: number | string
  className?: string
  label?: string
  onBoop?: (reaction: Reaction | null, boopCount: number) => void
}

export function PenguinMascot({
  size = 110,
  className,
  label = 'CNCF Penguin Mascot',
  onBoop,
}: PenguinMascotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const squashRef = useRef<HTMLSpanElement>(null)
  const timersRef = useRef<number[]>([])
  const boopsRef = useRef({ count: 0, at: 0 })
  const [direction, setDirection] = useState<Direction>('center')
  const [reaction, setReaction] = useState<Reaction | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    let sector = -1
    let pointer: { x: number; y: number } | null = null
    let lastTouchMs = 0
    let rafId = 0

    const applyDirection = (dx: number, dy: number) => {
      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1
        setDirection('center')
        return
      }

      const angle = Math.atan2(dy, dx)
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length
      setDirection(CLOCKWISE[sector])
    }

    const aim = () => {
      rafId = 0
      const button = buttonRef.current
      if (!button || reducedMotion.matches) return

      const box = button.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2

      if (pointer && performance.now() - lastTouchMs < 1400) {
        applyDirection(pointer.x - cx, pointer.y - cy)
        return
      }

      if (pointer && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        applyDirection(pointer.x - cx, pointer.y - cy)
        return
      }

      // Scroll-aware look target toward viewport focus on coarse/idle screens
      const targetX = window.innerWidth * 0.42
      const targetY = window.innerHeight * 0.5
      applyDirection(targetX - cx, targetY - cy)
    }

    const scheduleAim = () => {
      if (!rafId) rafId = requestAnimationFrame(aim)
    }

    const updatePointer = (x: number, y: number, fromTouch: boolean) => {
      pointer = { x, y }
      if (fromTouch) lastTouchMs = performance.now()
      scheduleAim()
    }

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY, event.pointerType !== 'mouse')
    }

    const onPointerDown = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY, event.pointerType !== 'mouse')
    }

    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) updatePointer(touch.clientX, touch.clientY, true)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('scroll', scheduleAim, { passive: true })
    scheduleAim()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('scroll', scheduleAim)
    }
  }, [])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout)
    }
  }, [])

  const boop = () => {
    timersRef.current.forEach(window.clearTimeout)
    timersRef.current = []

    const later = (ms: number, next: Reaction | null) => {
      timersRef.current.push(window.setTimeout(() => setReaction(next), ms))
    }

    const now = Date.now()
    const boops = boopsRef.current
    boops.count = now - boops.at < DIZZY_WINDOW ? boops.count + 1 : 1
    boops.at = now

    if (boops.count >= DIZZY_AFTER) {
      boops.count = 0
      setReaction('dizzy')
      onBoop?.('dizzy', boops.count)
      later(DIZZY_END, null)
    } else {
      setReaction('blink')
      const payoff = PAYOFFS[(boops.count - 1) % PAYOFFS.length]
      later(BOOP_PAYOFF, payoff)
      onBoop?.(payoff, boops.count)
      later(BOOP_END, null)
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      squashRef.current?.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' })
    }
  }

  const dimension = typeof size === 'number' ? `${size}px` : size

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={boop}
      data-look={direction}
      aria-label={`Boop the ${label}`}
      className={`cncf-mascot-btn ${className || ''}`}
      style={{
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        width: dimension,
        height: dimension,
        padding: 0,
        border: 0,
        background: 'transparent',
        appearance: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      <span
        ref={squashRef}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
          transformOrigin: '50% 78%',
        }}
      >
        <span
          style={{
            ...layer,
            backgroundImage: `url(${directionsImg})`,
            ...cell(DIRECTIONS.indexOf(direction)),
            opacity: reaction ? 0 : 1,
            transition: 'opacity 0.12s ease',
          }}
          aria-hidden="true"
        />
        <span
          style={{
            ...layer,
            backgroundImage: `url(${reactionsImg})`,
            ...cell(REACTIONS.indexOf(reaction ?? 'blink')),
            opacity: reaction ? 1 : 0,
            transition: 'opacity 0.12s ease',
          }}
          aria-hidden="true"
        />
      </span>
    </button>
  )
}
