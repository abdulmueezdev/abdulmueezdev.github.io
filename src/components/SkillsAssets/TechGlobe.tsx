import React, { useEffect, useRef, useState, useCallback } from 'react'
import { TECH_ITEMS, type TechItem } from './techData'
import { TechLogos } from './techLogos'
import { CursorCard } from '../ui/CursorCard'

interface SphereNode extends TechItem {
  baseX: number
  baseY: number
  baseZ: number
}

const RADIUS_X = 165
const RADIUS_Y = 145

const SPHERE_NODES: SphereNode[] = TECH_ITEMS.map((item, i) => {
  const n = TECH_ITEMS.length
  const phi = Math.acos(-1 + (2 * i + 1) / n)
  const theta = Math.sqrt(n * Math.PI) * phi
  return {
    ...item,
    baseX: Math.cos(theta) * Math.sin(phi),
    baseY: Math.sin(theta) * Math.sin(phi),
    baseZ: Math.cos(phi),
  }
})

function projectNode(node: SphereNode, cosX: number, sinX: number, cosY: number, sinY: number) {
  const x1 = node.baseX * cosY - node.baseZ * sinY
  const z1 = node.baseZ * cosY + node.baseX * sinY
  const y1 = node.baseY * cosX - z1 * sinX
  const z2 = z1 * cosX + node.baseY * sinX
  const scale = Math.max(0.72, Math.min(1.25, (z2 + 2.0) / 2.5))
  const opacity = Math.max(0.38, Math.min(1.0, (z2 + 1.25) / 2.1))
  return { x: x1, y: y1, z: z2, scale, opacity }
}

export function TechGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const frontStateRef = useRef<boolean[]>(SPHERE_NODES.map((n) => n.baseZ > 0))
  const isHoveredRef = useRef(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const rotRef = useRef({
    rx: 0.15,
    ry: 0.25,
    vx: 0.002,
    vy: 0.0035,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: '100px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Direct DOM transform writes via refs avoid 60fps React reconciliation
  useEffect(() => {
    if (!isVisible) return

    const motionPref = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionPref.matches) return

    let animationFrameId = 0

    const updateProjection = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(updateProjection)
        return
      }

      const rot = rotRef.current
      if (!rot.isDragging) {
        const speedMultiplier = isHoveredRef.current ? 0.2 : 1
        rot.rx += rot.vx * speedMultiplier
        rot.ry += rot.vy * speedMultiplier

        rot.vx *= 0.96
        rot.vy *= 0.96
        if (Math.abs(rot.vx) < 0.001) rot.vx = 0.0012
        if (Math.abs(rot.vy) < 0.0015) rot.vy = 0.0025
      }

      const cosX = Math.cos(rot.rx)
      const sinX = Math.sin(rot.rx)
      const cosY = Math.cos(rot.ry)
      const sinY = Math.sin(rot.ry)

      for (let i = 0; i < SPHERE_NODES.length; i++) {
        const el = nodeRefs.current[i]
        if (!el) continue

        const { x, y, z, scale, opacity } = projectNode(SPHERE_NODES[i], cosX, sinX, cosY, sinY)
        const posX = x * RADIUS_X
        const posY = y * RADIUS_Y

        el.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`
        el.style.opacity = opacity.toFixed(3)
        el.style.zIndex = String(Math.round((z + 1.5) * 50))

        const isFront = z > 0
        if (frontStateRef.current[i] !== isFront) {
          frontStateRef.current[i] = isFront
          el.classList.toggle('is-front', isFront)
          el.classList.toggle('is-back', !isFront)
        }
      }

      animationFrameId = requestAnimationFrame(updateProjection)
    }

    animationFrameId = requestAnimationFrame(updateProjection)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isVisible])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const rot = rotRef.current
    rot.isDragging = true
    rot.startX = e.clientX
    rot.startY = e.clientY
    rot.lastX = e.clientX
    rot.lastY = e.clientY
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rot = rotRef.current
    if (!rot.isDragging) return

    const dx = e.clientX - rot.lastX
    const dy = e.clientY - rot.lastY

    rot.ry += dx * 0.007
    rot.rx -= dy * 0.007

    rot.vy = dx * 0.004
    rot.vx = -dy * 0.004

    rot.lastX = e.clientX
    rot.lastY = e.clientY
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const rot = rotRef.current
    rot.isDragging = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      // Ignore
    }
  }, [])

  return (
    <div
      className="tech-icon-cloud-wrapper"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        isHoveredRef.current = true
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false
        setActiveId(null)
      }}
      role="region"
      aria-label="3D Interactive Technology Logo Cloud"
    >
      <div className="tech-icon-cloud-scene">
        <div className="tech-cloud-ring ring-h" aria-hidden="true" />
        <div className="tech-cloud-ring ring-v" aria-hidden="true" />

        {SPHERE_NODES.map((node, index) => {
          const cosX = Math.cos(0.15)
          const sinX = Math.sin(0.15)
          const cosY = Math.cos(0.25)
          const sinY = Math.sin(0.25)
          const initial = projectNode(node, cosX, sinX, cosY, sinY)
          const isFront = initial.z > 0
          const isActive = activeId === node.id

          return (
            <div
              key={node.id}
              ref={(el) => {
                nodeRefs.current[index] = el
              }}
              className={`tech-cloud-node${isFront ? ' is-front' : ' is-back'}${isActive ? ' is-active' : ''}`}
              style={{
                transform: `translate3d(${(initial.x * RADIUS_X).toFixed(2)}px, ${(initial.y * RADIUS_Y).toFixed(2)}px, 0) scale(${initial.scale.toFixed(3)})`,
                opacity: Number(initial.opacity.toFixed(3)),
                zIndex: Math.round((initial.z + 1.5) * 50),
              }}
            >
              <CursorCard
                url={node.name}
                title={node.category}
                subtitle={node.description}
              >
                <button
                  type="button"
                  className="tech-logo-btn"
                  onFocus={() => {
                    isHoveredRef.current = true
                    setActiveId(node.id)
                  }}
                  onBlur={() => {
                    isHoveredRef.current = false
                    setActiveId(null)
                  }}
                  aria-label={`${node.name} — ${node.category}: ${node.description}`}
                >
                  <div className="tech-logo-disc">
                    {TechLogos[node.id]}
                  </div>
                </button>
              </CursorCard>
            </div>
          )
        })}
      </div>
    </div>
  )
}
