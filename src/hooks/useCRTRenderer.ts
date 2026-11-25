import { useEffect, useRef, useCallback, useState } from 'react'

const SCREEN_PAPER = '#101211'
const SCREEN_W = 500
const SCREEN_H = 320
const AUTO_SWITCH_MS = 60_000
const FRAME_INTERVAL_MS = 1000 / 24

function ridgeHeight(x: number, z: number, phase: number): number {
  const ridge = Math.abs(x + 0.38 - z * 0.95 + 0.10 * Math.sin(z * 9 + phase))
  const shoulder = Math.abs(x - 0.29 + z * 0.35 + 0.07 * Math.cos(z * 10))
  const peak = Math.max(0, 1 - ridge * 2.35) * Math.exp(-((z - 0.39) ** 2) * 16)
  const spur = Math.max(0, 1 - shoulder * 3.5) * Math.exp(-((z - 0.55) ** 2) * 18)
  const detail =
    0.82 +
    0.13 * Math.sin(22 * x + 9 * z + phase) +
    0.08 * Math.sin(39 * x - 8 * z) +
    0.03 * Math.cos(65 * x + 19 * z)
  return (
    Math.max(peak, spur * 0.78) * detail +
    Math.sin(x * 4 - z * 7 + phase) ** 2 * 0.055 * (1 - x * x)
  )
}

function drawTerrain(ctx: CanvasRenderingContext2D, phase: number) {
  const rows = 38
  const samples = 100
  for (let row = 0; row <= rows; row++) {
    const z = row / rows
    const baseline = 150 + z * 132
    const span = 161 + z * 57
    const center = 264 - z * 26
    const contour = new Path2D()
    for (let s = 0; s <= samples; s++) {
      const x = (s / samples) * 2 - 1
      const px = center + x * span
      const py = baseline + x * (12 - z * 7) - ridgeHeight(x, z, phase) * 140
      s === 0 ? contour.moveTo(px, py) : contour.lineTo(px, py)
    }
    const surface = new Path2D(contour)
    surface.lineTo(center + span, SCREEN_H)
    surface.lineTo(center - span, SCREEN_H)
    surface.closePath()
    ctx.fillStyle = SCREEN_PAPER
    ctx.fill(surface)
    const shade = Math.round(180 + z * 64)
    ctx.strokeStyle = `rgb(${shade} ${shade} ${shade})`
    ctx.lineWidth = 1.45
    ctx.stroke(contour)
  }
}

function drawWaveform(ctx: CanvasRenderingContext2D, phase: number) {
  for (let trace = 0; trace < 32; trace++) {
    const offset = trace / 31
    ctx.beginPath()
    for (let step = 0; step <= 230; step++) {
      const x = step / 230
      const t = x * Math.PI * 2
      const envelope = Math.sin(Math.PI * x) ** 1.3
      const wave =
        Math.sin(t * 2.35 - phase + offset * 2.15) * 0.68 +
        Math.sin(t * 4.25 + phase * 0.7 - offset * 2) * 0.32
      const y = 162 + (wave * 103 + offset * 39 - 20) * envelope
      step === 0 ? ctx.moveTo(28, y) : ctx.lineTo(28 + x * 444, y)
    }
    ctx.lineWidth = trace % 4 === 0 ? 1.7 : 1.15
    ctx.strokeStyle = `rgba(240,241,237,${(0.46 + offset * 0.48).toFixed(2)})`
    ctx.stroke()
  }
}

function drawRegistration(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  for (const x of [27, 473]) {
    for (const y of [29, 292]) {
      ctx.moveTo(x - 4, y)
      ctx.lineTo(x + 4, y)
      ctx.moveTo(x, y - 4)
      ctx.lineTo(x, y + 4)
    }
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = '#757973'
  ctx.stroke()
}

export function useCRTRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [waveform, setWaveform] = useState(false)
  const syncRef = useRef<() => void>(() => {})
  const resetAutoSwitchRef = useRef<() => void>(() => {})
  const stateRef = useRef({
    width: 0,
    height: 0,
    frame: 0,
    lastDraw: 0,
    elapsed: 0,
    visible: true,
    waveform: false,
    mounted: false,
  })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const s = stateRef.current
    if (!canvas || !s.width || !s.height) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    ctx.setTransform(canvas.width / SCREEN_W, 0, 0, canvas.height / SCREEN_H, 0, 0)
    ctx.fillStyle = SCREEN_PAPER
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
    const phase = s.elapsed * 0.00035
    s.waveform ? drawWaveform(ctx, phase) : drawTerrain(ctx, phase)
    drawRegistration(ctx)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current
    s.mounted = true
    const motionPref = matchMedia('(prefers-reduced-motion: reduce)')
    let autoTimerId: number | null = null

    function animate(time: number) {
      s.frame = 0
      if (!s.mounted || !s.visible || document.hidden || motionPref.matches) return
      if (!s.lastDraw || time - s.lastDraw >= FRAME_INTERVAL_MS) {
        if (s.lastDraw) s.elapsed += Math.min(time - s.lastDraw, 80)
        s.lastDraw = time
        draw()
      }
      s.frame = requestAnimationFrame(animate)
    }

    function sync() {
      if (s.frame) {
        cancelAnimationFrame(s.frame)
        s.frame = 0
      }
      s.lastDraw = 0
      if (!s.mounted || !s.visible || document.hidden) return
      draw()
      if (!motionPref.matches) {
        s.frame = requestAnimationFrame(animate)
      }
    }
    syncRef.current = sync

    function stopAutoSwitch() {
      if (autoTimerId !== null) {
        window.clearInterval(autoTimerId)
        autoTimerId = null
      }
    }

    function resetAutoSwitch() {
      stopAutoSwitch()
      if (!s.mounted || motionPref.matches) return
      autoTimerId = window.setInterval(() => {
        if (!s.mounted || motionPref.matches) return
        const nextWaveform = !s.waveform
        s.waveform = nextWaveform
        setWaveform(nextWaveform)
        if (s.visible && !document.hidden) {
          draw()
          if (!s.frame) sync()
        }
      }, AUTO_SWITCH_MS)
    }
    resetAutoSwitchRef.current = resetAutoSwitch

    function handleMotionOrVisibilityChange() {
      sync()
      if (motionPref.matches) {
        stopAutoSwitch()
      } else if (autoTimerId === null) {
        resetAutoSwitch()
      }
    }

    function resize() {
      if (!canvas) return
      const nextW = Math.round(canvas.clientWidth)
      const nextH = Math.round(canvas.clientHeight)
      if (!nextW || !nextH) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const cw = Math.round(nextW * ratio)
      const ch = Math.round(nextH * ratio)
      if (s.width === nextW && s.height === nextH && canvas.width === cw && canvas.height === ch) {
        return
      }
      s.width = nextW
      s.height = nextH
      if (canvas.width !== cw) canvas.width = cw
      if (canvas.height !== ch) canvas.height = ch
      draw()
    }

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
      sync()
    })
    io.observe(canvas)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    motionPref.addEventListener('change', handleMotionOrVisibilityChange)
    document.addEventListener('visibilitychange', sync)

    resize()
    sync()
    resetAutoSwitch()

    return () => {
      s.mounted = false
      stopAutoSwitch()
      if (s.frame) {
        cancelAnimationFrame(s.frame)
        s.frame = 0
      }
      io.disconnect()
      ro.disconnect()
      motionPref.removeEventListener('change', handleMotionOrVisibilityChange)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [draw])

  const toggleSignal = useCallback(() => {
    const s = stateRef.current
    const nextWaveform = !s.waveform
    s.waveform = nextWaveform
    setWaveform(nextWaveform)
    syncRef.current()
    resetAutoSwitchRef.current()
    return nextWaveform
  }, [])

  return { canvasRef, waveform, toggleSignal }
}
