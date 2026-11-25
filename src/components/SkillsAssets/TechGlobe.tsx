import React, { useEffect, useRef, useState, useCallback } from 'react'
import { TECH_ITEMS, type TechItem } from './techData'
import { TechLogos } from './techLogos'
import { CursorCard } from '../ui/CursorCard'

interface SphereNode extends TechItem {
  baseX: number
  baseY: number
  baseZ: number
  x: number
  y: number
  z: number
  scale: number
  opacity: number
}

// Compute Fibonacci sphere distribution for uniform 3D spacing
function initNodes(): SphereNode[] {
  const n = TECH_ITEMS.length
  return TECH_ITEMS.map((item, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / n)
    const theta = Math.sqrt(n * Math.PI) * phi
    const baseX = Math.cos(theta) * Math.sin(phi)
    const baseY = Math.sin(theta) * Math.sin(phi)
    const baseZ = Math.cos(phi)

    return {
      ...item,
      baseX,
      baseY,
      baseZ,
      x: baseX,
      y: baseY,
      z: baseZ,
      scale: 1,
      opacity: 1,
    }
  })
}

export function TechGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<SphereNode[]>(initNodes)
  const [isHovered, setIsHovered] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

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

  // Strict viewport-gated intersection observer: pauses RAF when off-screen to guarantee 60fps scroll
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: '100px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  // 3D rotation & projection loop (only ticks when visible and motion not reduced)
  useEffect(() => {
    if (!isVisible) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    let animationFrameId: number

    const updateProjection = () => {
      const rot = rotRef.current

      if (!rot.isDragging) {
        // Slow rotation when hovering to facilitate reading and cursor interaction
        const speedMultiplier = isHovered ? 0.2 : 1
        rot.rx += rot.vx * speedMultiplier
        rot.ry += rot.vy * speedMultiplier

        // Momentum inertia decay
        rot.vx *= 0.96
        rot.vy *= 0.96
        if (Math.abs(rot.vx) < 0.001) rot.vx = 0.0012
        if (Math.abs(rot.vy) < 0.0015) rot.vy = 0.0025
      }

      const cosX = Math.cos(rot.rx)
      const sinX = Math.sin(rot.rx)
      const cosY = Math.cos(rot.ry)
      const sinY = Math.sin(rot.ry)

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          // Rotate around Y axis
          const x1 = node.baseX * cosY - node.baseZ * sinY
          const z1 = node.baseZ * cosY + node.baseX * sinY

          // Rotate around X axis
          const y1 = node.baseY * cosX - z1 * sinX
          const z2 = z1 * cosX + node.baseY * sinX

          // Perspective depth calculation for 3D Icon Cloud
          const scale = Math.max(0.72, Math.min(1.25, (z2 + 2.0) / 2.5))
          const opacity = Math.max(0.38, Math.min(1.0, (z2 + 1.25) / 2.1))

          return {
            ...node,
            x: x1,
            y: y1,
            z: z2,
            scale,
            opacity,
          }
        })
      )

      animationFrameId = requestAnimationFrame(updateProjection)
    }

    animationFrameId = requestAnimationFrame(updateProjection)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isVisible, isHovered])

  // Pointer drag momentum interaction
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setActiveId(null)
      }}
      role="region"
      aria-label="3D Interactive Technology Logo Cloud"
    >
      <div className="tech-icon-cloud-scene">
        {/* Subtle geometric orbital guide rings */}
        <div className="tech-cloud-ring ring-h" aria-hidden="true" />
        <div className="tech-cloud-ring ring-v" aria-hidden="true" />

        {/* 12 Crisp Official Brand Logo Nodes Floating in 3D Perspective */}
        {nodes.map((node) => {
          const isFront = node.z > 0
          const isActive = activeId === node.id

          // Spherical radius scaling
          const radiusX = 165
          const radiusY = 145
          const posX = node.x * radiusX
          const posY = node.y * radiusY

          return (
            <div
              key={node.id}
              className={`tech-cloud-node${isFront ? ' is-front' : ' is-back'}${isActive ? ' is-active' : ''}`}
              style={{
                transform: `translate3d(${posX}px, ${posY}px, 0) scale(${node.scale})`,
                opacity: node.opacity,
                zIndex: Math.round((node.z + 1.5) * 50),
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
                    setIsHovered(true)
                    setActiveId(node.id)
                  }}
                  onBlur={() => {
                    setIsHovered(false)
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
