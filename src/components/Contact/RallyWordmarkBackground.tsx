import { useEffect, useRef, type RefObject } from 'react'

interface RallyWordmarkBackgroundProps {
  isOpen: boolean
  reduceMotion: boolean
  overlayRef: RefObject<HTMLDivElement | null>
}

interface Vec2 {
  x: number
  y: number
}

interface GlyphDef {
  widthRatio: number
  strokes: Vec2[][]
}

interface GlyphState {
  id: number
  center: Vec2
  strokes: Vec2[][]
  offsetY: number
  velY: number
  tilt: number
  velTilt: number
  hitFlash: number
  cooldown: number
}

const INTERACTIVE_SKIP_SELECTOR =
  'button, a, input, textarea, select, label, sakuga-progress, .sakuga-form-card, .contact-page-topbar, .sakuga-progress-slot'

function sampleQuadBezier(p0: Vec2, p1: Vec2, p2: Vec2, steps = 16): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    pts.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    })
  }
  return pts
}

function sampleCubicBezier(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, steps = 20): Vec2[] {
  const pts: Vec2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    pts.push({
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    })
  }
  return pts
}

function sampleEllipse(cx: number, cy: number, rx: number, ry: number, angleRad = -0.07, steps = 40): Vec2[] {
  const pts: Vec2[] = []
  const cosA = Math.cos(angleRad)
  const sinA = Math.sin(angleRad)
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2
    const lx = Math.cos(theta) * rx
    const ly = Math.sin(theta) * ry
    pts.push({
      x: cx + lx * cosA - ly * sinA,
      y: cy + lx * sinA + ly * cosA,
    })
  }
  return pts
}

/** Monoline rounded lowercase "hello" contours modeled after kedhareswer/rally-wordmark-footer. */
const HELLO_GLYPHS: GlyphDef[] = [
  // h
  {
    widthRatio: 0.72,
    strokes: [
      [
        { x: 0.19, y: 0.08 },
        { x: 0.09, y: 0.93 },
      ],
      [
        { x: 0.13, y: 0.62 },
        ...sampleCubicBezier(
          { x: 0.13, y: 0.62 },
          { x: 0.24, y: 0.37 },
          { x: 0.66, y: 0.37 },
          { x: 0.68, y: 0.62 },
          22,
        ),
        { x: 0.65, y: 0.93 },
      ],
    ],
  },
  // e (rounded loop with slanted crossbar)
  {
    widthRatio: 0.78,
    strokes: [
      [
        { x: 0.15, y: 0.56 },
        { x: 0.85, y: 0.72 },
        ...sampleCubicBezier(
          { x: 0.85, y: 0.72 },
          { x: 0.86, y: 0.42 },
          { x: 0.56, y: 0.37 },
          { x: 0.34, y: 0.41 },
          18,
        ),
        ...sampleCubicBezier(
          { x: 0.34, y: 0.41 },
          { x: 0.12, y: 0.46 },
          { x: 0.09, y: 0.75 },
          { x: 0.28, y: 0.88 },
          18,
        ),
        ...sampleQuadBezier({ x: 0.28, y: 0.88 }, { x: 0.51, y: 0.99 }, { x: 0.76, y: 0.89 }, 14),
      ],
    ],
  },
  // l (slanted stem with curled tail)
  {
    widthRatio: 0.46,
    strokes: [
      [
        { x: 0.15, y: 0.08 },
        { x: 0.29, y: 0.74 },
        ...sampleCubicBezier(
          { x: 0.29, y: 0.74 },
          { x: 0.34, y: 0.93 },
          { x: 0.55, y: 0.95 },
          { x: 0.68, y: 0.84 },
          16,
        ),
      ],
    ],
  },
  // l
  {
    widthRatio: 0.46,
    strokes: [
      [
        { x: 0.15, y: 0.08 },
        { x: 0.29, y: 0.74 },
        ...sampleCubicBezier(
          { x: 0.29, y: 0.74 },
          { x: 0.34, y: 0.93 },
          { x: 0.55, y: 0.95 },
          { x: 0.68, y: 0.84 },
          16,
        ),
      ],
    ],
  },
  // o
  {
    widthRatio: 0.82,
    strokes: [sampleEllipse(0.42, 0.67, 0.34, 0.28, -0.08, 42)],
  },
]

function buildWordmarkLayout(width: number, height: number): { glyphs: GlyphState[]; strokeWidth: number } {
  const targetWidth = Math.min(width * 0.92, 1340)
  const targetHeight = Math.min(height * 0.54, targetWidth * 0.44)
  const totalUnitWidth = HELLO_GLYPHS.reduce((acc, g) => acc + g.widthRatio, 0) + 0.08 * (HELLO_GLYPHS.length - 1)
  const scaleH = targetHeight
  const scaleW = targetWidth / totalUnitWidth
  const scale = Math.min(scaleH, scaleW)

  const totalRenderedW = totalUnitWidth * scale
  const startX = (width - totalRenderedW) * 0.5
  const startY = Math.max(height * 0.43, height - scale * 1.04)
  const strokeWidth = Math.max(10, Math.min(44, scale * 0.095))

  let cursorX = startX
  const glyphs: GlyphState[] = HELLO_GLYPHS.map((def, idx) => {
    const gw = def.widthRatio * scale
    const center = { x: cursorX + gw * 0.5, y: startY + scale * 0.6 }
    const strokes = def.strokes.map((poly) =>
      poly.map((p) => ({
        x: cursorX + p.x * scale,
        y: startY + p.y * scale,
      })),
    )
    cursorX += gw + 0.08 * scale
    return {
      id: idx,
      center,
      strokes,
      offsetY: 0,
      velY: 0,
      tilt: 0,
      velTilt: 0,
      hitFlash: 0,
      cooldown: 0,
    }
  })

  return { glyphs, strokeWidth }
}

function closestPointOnSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax
  const aby = by - ay
  const lenSq = abx * abx + aby * aby
  const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq)) : 0
  return { x: ax + t * abx, y: ay + t * aby }
}

export function RallyWordmarkBackground({ isOpen, reduceMotion, overlayRef }: RallyWordmarkBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = Math.max(1, Math.round(container.clientWidth))
    let height = Math.max(1, Math.round(container.clientHeight))
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    let layout = buildWordmarkLayout(width, height)
    const ball = {
      x: width * 0.24,
      y: Math.max(24, height * 0.14),
      vx: 245,
      vy: 40,
      r: Math.max(16, Math.min(26, Math.min(width, height) * 0.03)),
      squash: 0,
      squashAngle: 0,
    }

    const syncCanvasSize = () => {
      const nextW = Math.max(1, Math.round(container.clientWidth))
      const nextH = Math.max(1, Math.round(container.clientHeight))
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.round(nextW * nextDpr) || canvas.height !== Math.round(nextH * nextDpr)) {
        width = nextW
        height = nextH
        dpr = nextDpr
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        layout = buildWordmarkLayout(width, height)
        ball.r = Math.max(16, Math.min(26, Math.min(width, height) * 0.03))
        ball.x = Math.max(ball.r + 8, Math.min(width - ball.r - 8, ball.x))
        ball.y = Math.max(ball.r + 8, Math.min(height - ball.r - 8, ball.y))
      }
    }

    const drawFrame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (const glyph of layout.glyphs) {
        const glyphPath = new Path2D()
        for (const poly of glyph.strokes) {
          if (poly.length < 2) continue
          glyphPath.moveTo(poly[0].x, poly[0].y)
          for (let i = 1; i < poly.length; i++) {
            glyphPath.lineTo(poly[i].x, poly[i].y)
          }
        }

        ctx.save()
        ctx.translate(glyph.center.x, glyph.center.y + glyph.offsetY)
        ctx.rotate(glyph.tilt)
        ctx.translate(-glyph.center.x, -glyph.center.y)

        const flash = glyph.hitFlash
        const outlineR = Math.round(22 + flash * 233)
        const outlineG = Math.round(22 + flash * 78)
        const outlineB = Math.round(22 + flash * 32)
        const outlineA = (0.22 + flash * 0.22).toFixed(3)

        ctx.lineWidth = layout.strokeWidth + 3
        ctx.strokeStyle = `rgba(${outlineR}, ${outlineG}, ${outlineB}, ${outlineA})`
        ctx.stroke(glyphPath)

        ctx.lineWidth = layout.strokeWidth
        ctx.strokeStyle = '#f8f8f8'
        ctx.stroke(glyphPath)
        ctx.restore()
      }

      // Draw Ember bouncing ball with subtle squash on impulse
      ctx.save()
      ctx.translate(ball.x, ball.y)
      ctx.rotate(ball.squashAngle)
      const scaleX = 1 + ball.squash * 0.22
      const scaleY = 1 - ball.squash * 0.18
      ctx.scale(scaleX, scaleY)

      ctx.beginPath()
      ctx.arc(0, 0, ball.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 100, 54, 0.88)'
      ctx.fill()

      // Subtle paper rim glint matching editorial Sakuga finish
      ctx.beginPath()
      ctx.arc(-ball.r * 0.28, -ball.r * 0.28, ball.r * 0.24, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(248, 248, 248, 0.42)'
      ctx.fill()
      ctx.restore()
    }

    syncCanvasSize()
    if (reduceMotion) {
      ball.x = width * 0.52
      ball.y = Math.max(ball.r + 24, height * 0.22)
      drawFrame()
      const resizeObs = new ResizeObserver(() => {
        syncCanvasSize()
        ball.x = width * 0.52
        ball.y = Math.max(ball.r + 24, height * 0.22)
        drawFrame()
      })
      resizeObs.observe(container)
      return () => resizeObs.disconnect()
    }

    const resizeObs = new ResizeObserver(syncCanvasSize)
    resizeObs.observe(container)

    const onOverlayPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target || target.closest(INTERACTIVE_SKIP_SELECTOR)) return
      const rect = canvas.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const dx = ball.x - px
      const dy = ball.y - py
      const dist = Math.hypot(dx, dy) || 1
      const proximity = dist < 260 ? 1.25 : 0.85
      ball.vx = Math.max(-460, Math.min(460, ball.vx * 0.45 + (dx / dist) * 280 * proximity))
      ball.vy = -Math.max(620, Math.min(920, height * 0.88 * proximity))
      ball.squash = 0.78
      ball.squashAngle = Math.atan2(ball.vy, ball.vx)
    }

    const overlayEl = overlayRef.current
    overlayEl?.addEventListener('pointerdown', onOverlayPointerDown, { passive: true })

    let rafId = 0
    let lastTime = performance.now()
    let stallTimer = 0
    const GRAVITY = 720
    const SUBSTEPS = 2

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      if (document.hidden) {
        lastTime = now
        return
      }

      const dt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000))
      lastTime = now
      const subDt = dt / SUBSTEPS
      const highArcSpeed = Math.min(920, Math.max(600, Math.sqrt(2 * GRAVITY * (height * 0.56))))

      // Spring return per wordmark letter
      for (const g of layout.glyphs) {
        const k = 190
        const d = 14
        g.velY += (-k * g.offsetY - d * g.velY) * dt
        g.offsetY += g.velY * dt
        g.velTilt += (-k * g.tilt - d * g.velTilt) * dt
        g.tilt += g.velTilt * dt
        g.hitFlash = Math.max(0, g.hitFlash - dt * 2.2)
        g.cooldown = Math.max(0, g.cooldown - dt)
      }

      ball.squash = Math.max(0, ball.squash - dt * 5.2)

      for (let step = 0; step < SUBSTEPS; step++) {
        ball.vy += GRAVITY * subDt
        ball.vx *= 1 - 0.025 * subDt
        ball.x += ball.vx * subDt
        ball.y += ball.vy * subDt

        // Viewport boundary bounces
        if (ball.x - ball.r < 0) {
          ball.x = ball.r
          ball.vx = Math.max(210, Math.abs(ball.vx) * 0.94 + 35)
          ball.squash = 0.65
          ball.squashAngle = Math.PI / 2
        } else if (ball.x + ball.r > width) {
          ball.x = width - ball.r
          ball.vx = -Math.max(210, Math.abs(ball.vx) * 0.94 + 35)
          ball.squash = 0.65
          ball.squashAngle = Math.PI / 2
        }

        if (ball.y - ball.r < 0) {
          ball.y = ball.r
          ball.vy = Math.abs(ball.vy) * 0.8 + 50
          ball.squash = 0.65
          ball.squashAngle = 0
        } else if (ball.y + ball.r > height) {
          ball.y = height - ball.r
          ball.vy = -Math.max(640, Math.min(920, highArcSpeed * 0.92))
          if (Math.abs(ball.vx) < 185) {
            ball.vx = ball.vx >= 0 ? 225 : -225
          }
          ball.squash = 0.85
          ball.squashAngle = 0
        }

        // Collision against monoline "hello" wordmark strokes
        const hitRadius = ball.r + layout.strokeWidth * 0.48
        for (const glyph of layout.glyphs) {
          let bestDist = Infinity
          let bestNx = 0
          let bestNy = -1
          let bestX = ball.x
          let bestY = ball.y

          for (const poly of glyph.strokes) {
            for (let i = 0; i < poly.length - 1; i++) {
              const pt = closestPointOnSegment(
                ball.x,
                ball.y,
                poly[i].x,
                poly[i].y + glyph.offsetY,
                poly[i + 1].x,
                poly[i + 1].y + glyph.offsetY,
              )
              const dx = ball.x - pt.x
              const dy = ball.y - pt.y
              const dist = Math.hypot(dx, dy)
              if (dist < hitRadius && dist < bestDist) {
                bestDist = dist
                const inv = dist > 0.001 ? 1 / dist : 1
                bestNx = dist > 0.001 ? dx * inv : 0
                bestNy = dist > 0.001 ? dy * inv : -1
                bestX = pt.x + bestNx * hitRadius
                bestY = pt.y + bestNy * hitRadius
              }
            }
          }

          if (bestDist < hitRadius) {
            // One-way escape through overhead concave contours ("e" crossbar / "o" top when rising)
            // prevents trapping in the lower curve pocket
            if (bestNy > 0.18 && (ball.vy < 180 || bestY > glyph.center.y - 12)) {
              continue
            }

            ball.x = bestX
            ball.y = bestY
            const dot = ball.vx * bestNx + ball.vy * bestNy
            if (dot < 0) {
              ball.vx = (ball.vx - 2 * dot * bestNx) * 0.96
              ball.vy = (ball.vy - 2 * dot * bestNy) * 0.96
            }
            if (bestNy < -0.18) {
              ball.vy = Math.min(ball.vy, -Math.max(580, highArcSpeed * 0.8))
            }
            if (Math.abs(ball.vx) < 175) {
              ball.vx = (ball.vx >= 0 ? 1 : -1) * (205 + (glyph.id % 2) * 35)
            }
            if (glyph.cooldown <= 0) {
              glyph.velY += Math.min(260, Math.max(115, Math.abs(dot) * 0.42))
              glyph.velTilt += ((ball.x - glyph.center.x) / Math.max(40, width * 0.08)) * 0.36
              glyph.hitFlash = 1
              glyph.cooldown = 0.16
              ball.squash = 0.85
              ball.squashAngle = Math.atan2(bestNy, bestNx) + Math.PI / 2
            }
            break
          }
        }
      }

      // Anti-stall guard: eject cleanly if speed drops or ball lingers in wordmark band > 1.35s
      const speed = Math.hypot(ball.vx, ball.vy)
      const upperThreshold = Math.min(height * 0.42, (layout.glyphs[0]?.center.y ?? height * 0.72) - 48)
      if (ball.y <= upperThreshold && speed >= 190) {
        stallTimer = 0
      } else if (speed < 185 || ball.y > upperThreshold) {
        stallTimer += dt
      }

      if (stallTimer >= 1.35) {
        ball.vy = -Math.max(660, highArcSpeed * 0.96)
        const dir = ball.x > width * 0.52 ? -1 : 1
        ball.vx = dir * (245 + (Math.abs(Math.round(ball.x)) % 85))
        ball.squash = 0.85
        ball.squashAngle = Math.atan2(ball.vy, ball.vx)
        stallTimer = 0
      }

      drawFrame()
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObs.disconnect()
      overlayEl?.removeEventListener('pointerdown', onOverlayPointerDown)
    }
  }, [isOpen, reduceMotion, overlayRef])

  return (
    <div ref={containerRef} className="rally-wordmark-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="rally-wordmark-canvas" />
    </div>
  )
}
