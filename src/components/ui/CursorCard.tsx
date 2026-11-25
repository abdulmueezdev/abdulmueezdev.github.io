import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react'

export interface CursorCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  url: string
  href?: string
  target?: string
  rel?: string
  className?: string
  asLink?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function CursorCard({
  children,
  title,
  subtitle,
  url,
  href,
  target,
  rel,
  className = '',
  asLink = false,
  onClick,
}: CursorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [mounted, setMounted] = useState(false)

  const mouseX = useMotionValue(-999)
  const mouseY = useMotionValue(-999)

  const springConfig = { damping: 28, stiffness: 320, mass: 0.5 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCanHover(media.matches)

    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Position floating card slightly below and to the right of the cursor
    // Clamp so it stays within viewport
    const cardWidth = 240
    const cardHeight = 84
    let targetX = e.clientX + 16
    let targetY = e.clientY + 18

    if (typeof window !== 'undefined') {
      if (targetX + cardWidth > window.innerWidth - 12) {
        targetX = e.clientX - cardWidth - 12
      }
      if (targetY + cardHeight > window.innerHeight - 12) {
        targetY = e.clientY - cardHeight - 12
      }
    }

    mouseX.set(targetX)
    mouseY.set(targetY)
  }, [mouseX, mouseY])

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!canHover) return
    handleMouseMove(e)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const containerProps = {
    className: `cursor-card-trigger ${className}`.trim(),
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseMove: handleMouseMove,
    onClick,
  }

  // Render trigger as link or span/div
  const triggerElement = asLink && href ? (
    <a
      href={href}
      target={target}
      rel={rel}
      {...containerProps}
    >
      {children}
    </a>
  ) : (
    <div {...containerProps}>
      {children}
    </div>
  )

  const displayUrl = url.replace(/^https?:\/\//, '')

  return (
    <>
      {triggerElement}

      {mounted && canHover && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                x: springX,
                y: springY,
                pointerEvents: 'none',
                zIndex: 9999,
              }}
              className="cursor-card-portal"
              role="tooltip"
              aria-hidden="true"
            >
              <div className="cursor-card-body">
                <div className="cursor-card-header">
                  <span className="cursor-card-pill">
                    <span className="cursor-card-dot" aria-hidden="true" />
                    LINK
                  </span>
                  {title && <span className="cursor-card-title">{title}</span>}
                </div>
                <div className="cursor-card-url" title={url}>
                  {displayUrl}
                </div>
                {subtitle && <div className="cursor-card-sub">{subtitle}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
