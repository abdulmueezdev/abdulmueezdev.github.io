import { useEffect, useRef, useState, useCallback } from 'react'
import portraitSrc from '../assets/portrait.webp'

interface TrackerNode {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  id: string
  normCoords: string
  zCoord: string
  isActive?: boolean
}

const VOID_BG_32 = 0xff0c0b0b // #0b0b0c in little-endian ABGR (0xAABBGGRR)
const EMBER = '#ff6436'

const TRACKER_CONFIG = [
  { id: '01', rx: 0.31, ry: 0.49, normCoords: '-0.15 -0.07', zCoord: '+0.05', isActive: true },
  { id: '02', rx: 0.46, ry: 0.36, normCoords: '+0.06 +0.44', zCoord: '-0.01' },
  { id: '03', rx: 0.65, ry: 0.46, normCoords: '+0.47 -0.07', zCoord: '-0.14' },
  { id: '04', rx: 0.68, ry: 0.20, normCoords: '+0.51 +0.74', zCoord: '-0.25' },
  { id: '05', rx: 0.33, ry: 0.58, normCoords: '-0.22 -0.70', zCoord: '-0.06' },
  { id: '06', rx: 0.62, ry: 0.62, normCoords: '+0.35 -0.60', zCoord: '-0.12' },
  { id: '07', rx: 0.22, ry: 0.38, normCoords: '-0.51 +0.30', zCoord: '-0.42' },
  { id: '08', rx: 0.44, ry: 0.16, normCoords: '-0.24 +0.88', zCoord: '-0.34' },
  { id: '09', rx: 0.58, ry: 0.37, normCoords: '+0.43 +0.17', zCoord: '-0.21' },
]

const VECTOR_LINKS: [number, number][] = [
  [0, 1], [1, 3], [1, 8], [6, 7], [7, 0],
  [0, 4], [4, 5], [5, 2], [2, 3], [8, 1],
  [0, 6], [2, 8],
]

function createPrng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createTrackers(w: number, h: number): TrackerNode[] {
  const rand = createPrng(0x243f6a88)
  return TRACKER_CONFIG.map((cfg) => ({
    x: cfg.rx * w,
    y: cfg.ry * h,
    baseX: cfg.rx * w,
    baseY: cfg.ry * h,
    vx: (rand() - 0.5) * 0.10,
    vy: (rand() - 0.5) * 0.10,
    id: cfg.id,
    normCoords: cfg.normCoords,
    zCoord: cfg.zCoord,
    isActive: cfg.isActive,
  }))
}

export function usePointPrint() {
  return useGatherPortrait()
}

export function useGatherPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    count: 0,
    x: new Float32Array(0),
    y: new Float32Array(0),
    baseX: new Float32Array(0),
    baseY: new Float32Array(0),
    vx: new Float32Array(0),
    vy: new Float32Array(0),
    mass: new Float32Array(0),
    swirl: new Float32Array(0),
    color32: new Uint32Array(0),
    imageData: null as ImageData | null,
    buf32: null as Uint32Array | null,
    restBuf32: null as Uint32Array | null,
    pointer: null as { x: number; y: number } | null,
    frame: 0,
    animating: false,
    visible: true,
    painted: false,
    reducedMotion: false,
    finePointer: false,
    lastPointerMs: 0,
    trackers: [] as TrackerNode[],
    tick: 0,
    settleCount: 0,
  })

  const renderGather = useCallback(() => {
    const s = stateRef.current
    s.frame = 0
    const canvas = canvasRef.current
    if (!canvas || !s.buf32 || !s.imageData || s.count === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const w = s.width
    const h = s.height
    const dpr = s.dpr
    if (!w || !h || !cw || !ch) return

    const reducedMotion = s.reducedMotion
    const hasPointer = Boolean(s.pointer && s.finePointer && !reducedMotion)

    // 1. Deterministic Particle Swarm Physics with Tight Localized Cursor Radius
    let activeMovement = 0
    if (s.animating && !reducedMotion) {
      const pX = s.pointer ? s.pointer.x : -9999
      const pY = s.pointer ? s.pointer.y : -9999
      const boundRadius = 52
      const boundRadiusSq = boundRadius * boundRadius
      const sigma = 22
      const twoSigmaSq = 2 * sigma * sigma

      for (let i = 0; i < s.count; i++) {
        let px = s.x[i]
        let py = s.y[i]
        let pvx = s.vx[i]
        let pvy = s.vy[i]

        if (hasPointer) {
          const dx = px - pX
          const dy = py - pY
          const distSq = dx * dx + dy * dy

          if (distSq < boundRadiusSq) {
            const influence = Math.exp(-distSq / twoSigmaSq)
            const dist = Math.sqrt(distSq) + 6
            const fRad = influence * 1.15
            const fCurl = influence * 1.45 * s.swirl[i]

            pvx += ((dx / dist) * fRad - (dy / dist) * fCurl) / s.mass[i]
            pvy += ((dy / dist) * fRad + (dx / dist) * fCurl) / s.mass[i]
          }
        }

        const springX = (s.baseX[i] - px) * 0.065
        const springY = (s.baseY[i] - py) * 0.065

        pvx = (pvx + springX) * 0.82
        pvy = (pvy + springY) * 0.82

        px += pvx
        py += pvy

        s.x[i] = px
        s.y[i] = py
        s.vx[i] = pvx
        s.vy[i] = pvy

        activeMovement += Math.abs(pvx) + Math.abs(pvy)
      }

      if (!s.pointer) {
        if (activeMovement < s.count * 0.012) {
          s.settleCount++
          if (s.settleCount > 6) {
            for (let i = 0; i < s.count; i++) {
              s.x[i] = s.baseX[i]
              s.y[i] = s.baseY[i]
              s.vx[i] = 0
              s.vy[i] = 0
            }
            s.animating = false
            s.settleCount = 0
          }
        } else {
          s.settleCount = 0
        }
      } else if (performance.now() - s.lastPointerMs > 220 && activeMovement < s.count * 0.012) {
        s.settleCount++
        if (s.settleCount > 10) {
          s.animating = false
          s.settleCount = 0
        }
      } else {
        s.settleCount = 0
      }
    }

    // 2. Render complete ImageData buffer before a single putImageData blit
    const buf = s.buf32
    if (!s.animating && s.restBuf32 && s.restBuf32.length === buf.length) {
      buf.set(s.restBuf32)
    } else {
      buf.fill(VOID_BG_32)
      const isRetina = dpr > 1.25
      for (let i = 0; i < s.count; i++) {
        const bx = Math.round(s.x[i] * dpr)
        const by = Math.round(s.y[i] * dpr)
        if (bx >= 0 && bx < cw && by >= 0 && by < ch) {
          const idx = by * cw + bx
          const col = s.color32[i]
          buf[idx] = col
          if (isRetina) {
            if (bx + 1 < cw) buf[idx + 1] = col
            if (by + 1 < ch) buf[idx + cw] = col
            if (bx + 1 < cw && by + 1 < ch) buf[idx + cw + 1] = col
          }
        }
      }
    }

    ctx.putImageData(s.imageData, 0, 0)
    s.painted = true

    // 3. Render Whisper-Thin Gather HUD Overlay (<0.1ms)
    ctx.save()
    ctx.scale(dpr, dpr)

    // A. Perimeter Ruler Ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = 0.75
    ctx.beginPath()
    const xStep = Math.max(14, Math.round(w / 32))
    const yStep = Math.max(14, Math.round(h / 32))

    for (let x = xStep; x < w - 2; x += xStep) {
      const isMajor = Math.round(x / xStep) % 4 === 0
      const tickLen = isMajor ? 6 : 3
      ctx.moveTo(x, 0)
      ctx.lineTo(x, tickLen)
      ctx.moveTo(x, h)
      ctx.lineTo(x, h - tickLen)
    }
    for (let y = yStep; y < h - 2; y += yStep) {
      const isMajor = Math.round(y / yStep) % 4 === 0
      const tickLen = isMajor ? 6 : 3
      ctx.moveTo(0, y)
      ctx.lineTo(tickLen, y)
      ctx.moveTo(w, y)
      ctx.lineTo(w - tickLen, y)
    }
    ctx.stroke()

    // B. Corner Crosshairs (+)
    const crossSpan = 10
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 0.75
    const cornerOffsets = [
      [8, 8],
      [w - 8, 8],
      [8, h - 8],
      [w - 8, h - 8],
    ]
    ctx.beginPath()
    for (const [cx, cy] of cornerOffsets) {
      ctx.moveTo(cx - crossSpan / 2, cy)
      ctx.lineTo(cx + crossSpan / 2, cy)
      ctx.moveTo(cx, cy - crossSpan / 2)
      ctx.lineTo(cx, cy + crossSpan / 2)
    }
    ctx.stroke()

    // C. Tracker micro-drift only when actively interacting
    if (s.animating && !reducedMotion) {
      s.tick++
      for (const t of s.trackers) {
        t.x += t.vx
        t.y += t.vy
        if (hasPointer && s.pointer) {
          const tdx = t.x - s.pointer.x
          const tdy = t.y - s.pointer.y
          const tdist = Math.hypot(tdx, tdy)
          if (tdist < 52) {
            const tpush = (1 - tdist / 52) * 2.0
            t.x += (tdx / Math.max(1, tdist)) * tpush * 0.1
            t.y += (tdy / Math.max(1, tdist)) * tpush * 0.1
          }
        }
        const dx = t.x - t.baseX
        const dy = t.y - t.baseY
        if (Math.abs(dx) > 6) t.vx = -t.vx * 0.85
        if (Math.abs(dy) > 6) t.vy = -t.vy * 0.85
      }
    }

    // D. Vector Connecting Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)'
    ctx.lineWidth = 0.75
    ctx.beginPath()
    for (const [fromIdx, toIdx] of VECTOR_LINKS) {
      const a = s.trackers[fromIdx]
      const b = s.trackers[toIdx]
      if (a && b) {
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
    }
    ctx.stroke()

    // E. Tracking Boxes with Corner Brackets
    const bSpan = 11
    const bArm = 4.5
    for (let i = 0; i < s.trackers.length; i++) {
      const t = s.trackers[i]
      const isActive = t.isActive

      ctx.strokeStyle = isActive ? 'rgba(255, 100, 54, 0.85)' : 'rgba(255, 255, 255, 0.45)'
      ctx.lineWidth = 0.85
      ctx.beginPath()
      ctx.moveTo(t.x - bSpan, t.y - bSpan + bArm)
      ctx.lineTo(t.x - bSpan, t.y - bSpan)
      ctx.lineTo(t.x - bSpan + bArm, t.y - bSpan)
      ctx.moveTo(t.x + bSpan - bArm, t.y - bSpan)
      ctx.lineTo(t.x + bSpan, t.y - bSpan)
      ctx.lineTo(t.x + bSpan + bArm, t.y - bSpan)
      ctx.moveTo(t.x - bSpan, t.y + bSpan - bArm)
      ctx.lineTo(t.x - bSpan, t.y + bSpan)
      ctx.lineTo(t.x - bSpan + bArm, t.y + bSpan)
      ctx.moveTo(t.x + bSpan - bArm, t.y + bSpan)
      ctx.lineTo(t.x + bSpan, t.y + bSpan)
      ctx.lineTo(t.x + bSpan, t.y + bSpan - bArm)
      ctx.stroke()

      if (isActive) {
        ctx.fillStyle = EMBER
        ctx.fillRect(t.x - 1, t.y - 1, 2, 2)
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.lineWidth = 0.75
        ctx.beginPath()
        ctx.moveTo(t.x - 2, t.y)
        ctx.lineTo(t.x + 2, t.y)
        ctx.moveTo(t.x, t.y - 2)
        ctx.lineTo(t.x, t.y + 2)
        ctx.stroke()
      }

      const label = `${t.id} ${t.normCoords} ${t.zCoord}`
      ctx.font = '500 9px "IBM Plex Mono", monospace'
      ctx.fillStyle = isActive ? 'rgba(255, 120, 80, 0.90)' : 'rgba(255, 255, 255, 0.65)'
      ctx.fillText(label, t.x + bSpan + 4, t.y + 3)
    }

    // F. Floating Telemetry
    ctx.font = '500 8.5px "IBM Plex Mono", monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)'
    ctx.fillText('01 / 01  PORTRAIT', 12, 16)
    ctx.fillText('DRIFT 40', w - 58, 16)
    ctx.fillText('524,288 PTS', 12, h - 10)
    ctx.fillText('TRACK+LINKS+MARKS', w - 105, h - 10)

    ctx.restore()

    if (!reducedMotion && s.visible && !document.hidden && s.animating) {
      s.frame = requestAnimationFrame(renderGather)
    }
  }, [])

  const scheduleRender = useCallback(() => {
    const s = stateRef.current
    if (!s.frame && s.visible && !document.hidden) {
      s.frame = requestAnimationFrame(renderGather)
    }
  }, [renderGather])

  const prepare = useCallback((img: HTMLImageElement) => {
    const mount = frameRef.current
    const canvas = canvasRef.current
    const s = stateRef.current
    if (!mount || !canvas || !img.naturalWidth) return

    const rect = mount.getBoundingClientRect()
    const w = Math.round(rect.width || mount.clientWidth || 440)
    const h = Math.round(rect.height || mount.clientHeight || Math.round(w / 0.91))
    if (!w || !h) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = Math.round(w * dpr)
    const ch = Math.round(h * dpr)

    // Ignore sub-pixel scroll/zoom layout jitter (<2px) to prevent canvas wipe flicker
    if (
      s.count > 0 &&
      Math.abs(s.width - w) < 2 &&
      Math.abs(s.height - h) < 2 &&
      s.dpr === dpr
    ) {
      return
    }

    s.width = w
    s.height = h
    s.dpr = dpr

    if (canvas.width !== cw) canvas.width = cw
    if (canvas.height !== ch) canvas.height = ch

    const sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = w
    sampleCanvas.height = h
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
    if (!sampleCtx) return

    const cover = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const fitW = img.naturalWidth * cover
    const fitH = img.naturalHeight * cover
    const offX = (w - fitW) * 0.5
    const offY = (h - fitH) * 0.67
    sampleCtx.drawImage(img, offX, offY, fitW, fitH)

    let pixels: Uint8ClampedArray
    try {
      pixels = sampleCtx.getImageData(0, 0, w, h).data
    } catch {
      setReady(false)
      return
    }

    const pitch = 1.35
    const cols = Math.round(w / pitch)
    const rows = Math.round(h / pitch)
    const maxParticles = cols * rows

    const tempX = new Float32Array(maxParticles)
    const tempY = new Float32Array(maxParticles)
    const tempColor = new Uint32Array(maxParticles)
    const tempMass = new Float32Array(maxParticles)
    const tempSwirl = new Float32Array(maxParticles)

    const rand = createPrng(0x9e3779b9)
    let count = 0

    const getLum = (sx: number, sy: number) => {
      const clx = Math.min(w - 1, Math.max(0, sx))
      const cly = Math.min(h - 1, Math.max(0, sy))
      const idx = (cly * w + clx) * 4
      return (pixels[idx] * 0.2126 + pixels[idx + 1] * 0.7152 + pixels[idx + 2] * 0.0722) / 255
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jx = (c + 0.08 + rand() * 0.84) * pitch
        const jy = (r + 0.08 + rand() * 0.84) * pitch

        const sx = Math.floor(jx)
        const sy = Math.floor(jy)
        if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue

        const lum = getLum(sx, sy)
        const lumL = getLum(sx - 1, sy)
        const lumR = getLum(sx + 1, sy)
        const lumU = getLum(sx, sy - 1)
        const lumD = getLum(sx, sy + 1)
        const edge = Math.abs(lumR - lumL) + Math.abs(lumD - lumU)

        let prob = 0.86
        if (lum > 0.4) {
          prob = 0.95
        } else if (lum < 0.08) {
          prob = 0.70
        }

        if (rand() <= prob) {
          tempX[count] = jx
          tempY[count] = jy

          const tonal = Math.min(1, Math.max(0, Math.pow(lum, 0.88) * 1.05 + edge * 0.22))
          const rCol = Math.round(11 + (242 - 11) * tonal)
          const gCol = Math.round(11 + (242 - 11) * tonal)
          const bCol = Math.round(12 + (238 - 12) * tonal)
          tempColor[count] = (0xff << 24) | (bCol << 16) | (gCol << 8) | rCol

          tempMass[count] = 0.85 + rand() * 0.55
          tempSwirl[count] = (rand() > 0.5 ? 1 : -1) * (0.8 + rand() * 0.6)
          count++
        }
      }
    }

    s.count = count
    s.x = new Float32Array(count)
    s.y = new Float32Array(count)
    s.baseX = new Float32Array(count)
    s.baseY = new Float32Array(count)
    s.vx = new Float32Array(count)
    s.vy = new Float32Array(count)
    s.mass = new Float32Array(count)
    s.swirl = new Float32Array(count)
    s.color32 = new Uint32Array(count)

    for (let i = 0; i < count; i++) {
      s.x[i] = s.baseX[i] = tempX[i]
      s.y[i] = s.baseY[i] = tempY[i]
      s.color32[i] = tempColor[i]
      s.mass[i] = tempMass[i]
      s.swirl[i] = tempSwirl[i]
    }

    const ctx = canvas.getContext('2d')
    if (ctx) {
      s.imageData = ctx.createImageData(cw, ch)
      s.buf32 = new Uint32Array(s.imageData.data.buffer)
      const rest = new Uint32Array(cw * ch)
      rest.fill(VOID_BG_32)
      const isRetina = dpr > 1.25
      for (let i = 0; i < count; i++) {
        const bx = Math.round(s.baseX[i] * dpr)
        const by = Math.round(s.baseY[i] * dpr)
        if (bx >= 0 && bx < cw && by >= 0 && by < ch) {
          const idx = by * cw + bx
          const col = s.color32[i]
          rest[idx] = col
          if (isRetina) {
            if (bx + 1 < cw) rest[idx + 1] = col
            if (by + 1 < ch) rest[idx + cw] = col
            if (bx + 1 < cw && by + 1 < ch) rest[idx + cw + 1] = col
          }
        }
      }
      s.restBuf32 = rest
    }

    s.trackers = createTrackers(w, h)
    s.animating = false
    s.painted = false
    setReady(true)
    renderGather()
  }, [renderGather])

  useEffect(() => {
    const mount = frameRef.current
    const canvas = canvasRef.current
    if (!mount || !canvas) return

    const s = stateRef.current
    const motionPref = matchMedia('(prefers-reduced-motion: reduce)')
    const pointerPref = matchMedia('(hover: hover) and (pointer: fine)')
    s.reducedMotion = motionPref.matches
    s.finePointer = pointerPref.matches

    const onMediaChange = () => {
      s.reducedMotion = motionPref.matches
      s.finePointer = pointerPref.matches
      if (s.reducedMotion && s.frame) {
        cancelAnimationFrame(s.frame)
        s.frame = 0
        s.animating = false
        renderGather()
      }
    }
    motionPref.addEventListener('change', onMediaChange)
    pointerPref.addEventListener('change', onMediaChange)

    let img: HTMLImageElement | null = new Image()
    img.src = portraitSrc

    const onImageLoaded = () => {
      if (!img) return
      prepare(img)
    }

    if (img.complete && img.naturalWidth) {
      prepare(img)
    } else {
      img.onload = onImageLoaded
    }

    const wakeFromPointer = (e: PointerEvent) => {
      if (!s.finePointer || s.reducedMotion) return
      const bounds = mount.getBoundingClientRect()
      s.pointer = { x: e.clientX - bounds.left, y: e.clientY - bounds.top }
      s.lastPointerMs = performance.now()
      s.settleCount = 0
      s.animating = true
      scheduleRender()
    }

    const onPointerLeave = () => {
      s.pointer = null
      if (!s.reducedMotion && s.count > 0) {
        s.settleCount = 0
        s.animating = true
        scheduleRender()
      }
    }

    mount.addEventListener('pointerenter', wakeFromPointer, { passive: true })
    mount.addEventListener('pointermove', wakeFromPointer, { passive: true })
    mount.addEventListener('pointerleave', onPointerLeave, { passive: true })
    mount.addEventListener('pointercancel', onPointerLeave, { passive: true })

    const onVisibilityChange = () => {
      if (document.hidden && s.frame) {
        cancelAnimationFrame(s.frame)
        s.frame = 0
      } else if (!document.hidden && s.visible && s.animating) {
        scheduleRender()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
      if (s.visible) {
        if (s.count === 0 && img && img.naturalWidth) {
          prepare(img)
        } else if (!s.painted) {
          renderGather()
        } else if (s.animating) {
          scheduleRender()
        }
      } else {
        if (s.frame) {
          cancelAnimationFrame(s.frame)
          s.frame = 0
        }
        s.pointer = null
        s.settleCount = 0
        if (s.animating && s.count > 0) {
          s.x.set(s.baseX)
          s.y.set(s.baseY)
          s.vx.fill(0)
          s.vy.fill(0)
          s.animating = false
          renderGather()
        }
      }
    })
    io.observe(mount)

    const ro = new ResizeObserver((entries) => {
      if (!img || !img.naturalWidth) return
      const entry = entries[0]
      const w = Math.round(entry?.contentRect.width || mount.clientWidth || 0)
      const h = Math.round(entry?.contentRect.height || mount.clientHeight || 0)
      if (!w || !h) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (s.count > 0 && Math.abs(s.width - w) < 2 && Math.abs(s.height - h) < 2 && s.dpr === dpr) {
        return
      }
      prepare(img)
    })
    ro.observe(mount)

    return () => {
      mount.removeEventListener('pointerenter', wakeFromPointer)
      mount.removeEventListener('pointermove', wakeFromPointer)
      mount.removeEventListener('pointerleave', onPointerLeave)
      mount.removeEventListener('pointercancel', onPointerLeave)
      motionPref.removeEventListener('change', onMediaChange)
      pointerPref.removeEventListener('change', onMediaChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      io.disconnect()
      ro.disconnect()
      if (s.frame) {
        cancelAnimationFrame(s.frame)
        s.frame = 0
      }
      img = null
    }
  }, [prepare, scheduleRender, renderGather])

  return { canvasRef, frameRef, ready }
}
