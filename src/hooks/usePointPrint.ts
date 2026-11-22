import { useEffect, useRef, useState, useCallback } from 'react'

export function usePointPrint() {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [ready, setReady] = useState(false)

  const isPrintingRef = useRef(false)
  isPrintingRef.current = isPrinting

  const stateRef = useRef({
    width: 0,
    height: 0,
    columns: 0,
    rows: 0,
    pitchX: 0,
    pitchY: 0,
    dots: null as Float32Array | null,
    pointer: null as { x: number; y: number } | null,
    frame: 0,
    visible: false,
    base: null as HTMLCanvasElement | null,
    sample: null as HTMLCanvasElement | null,
  })

  const renderPrint = useCallback(() => {
    const s = stateRef.current
    s.frame = 0
    if (!isPrintingRef.current || !s.visible || !s.dots || !s.base || document.hidden) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ink = canvas.getContext('2d')
    if (!ink) return

    ink.drawImage(s.base, 0, 0, s.width, s.height)

    const motionPref = matchMedia('(prefers-reduced-motion: reduce)')
    const pointerPref = matchMedia('(hover: hover) and (pointer: fine)')
    if (!s.pointer || motionPref.matches || !pointerPref.matches) return

    const radius = Math.min(s.width * 0.17, 75)
    const left = Math.max(0, Math.floor((s.pointer.x - radius) / s.pitchX))
    const right = Math.min(s.columns, Math.ceil((s.pointer.x + radius) / s.pitchX))
    const top = Math.max(0, Math.floor((s.pointer.y - radius) / s.pitchY))
    const bottom = Math.min(s.rows, Math.ceil((s.pointer.y + radius) / s.pitchY))

    ink.fillStyle = '#171717'
    ink.fillRect(left * s.pitchX, top * s.pitchY, (right - left) * s.pitchX, (bottom - top) * s.pitchY)
    ink.fillStyle = '#f6f4ec'

    for (let row = top; row < bottom; row++) {
      for (let col = left; col < right; col++) {
        const size = s.dots[row * s.columns + col]
        if (size < 0.48) continue
        const x = (col + 0.5) * s.pitchX
        const y = (row + 0.5) * s.pitchY
        const dx = x - s.pointer.x
        const dy = y - s.pointer.y
        const distance = Math.hypot(dx, dy)
        const push = Math.max(0, 1 - distance / radius) ** 2 * radius * 0.23 / Math.max(1, distance)
        ink.fillRect(x + dx * push - size / 2, y + dy * push - size / 2, size, size)
      }
    }
  }, [])

  const schedulePrint = useCallback(() => {
    const s = stateRef.current
    if (!s.frame && isPrintingRef.current && s.visible && !document.hidden) {
      s.frame = requestAnimationFrame(renderPrint)
    }
  }, [renderPrint])

  const prepare = useCallback(() => {
    const img = imgRef.current
    const mount = frameRef.current
    const canvas = canvasRef.current
    const s = stateRef.current
    if (!s.visible || !img || !img.naturalWidth || !mount || !canvas) return

    const w = mount.clientWidth
    const h = mount.clientHeight
    if (!w || !h || (s.width === w && s.height === h && s.dots)) return

    s.width = w
    s.height = h
    const pitch = Math.max(2.8, w / 158)
    s.columns = Math.max(1, Math.round(w / pitch))
    s.rows = Math.max(1, Math.round(h / pitch))
    s.pitchX = w / s.columns
    s.pitchY = h / s.rows

    if (!s.sample) s.sample = document.createElement('canvas')
    s.sample.width = s.columns
    s.sample.height = s.rows
    const sampler = s.sample.getContext('2d', { willReadFrequently: true })
    if (!sampler) return

    const cover = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const fitW = img.naturalWidth * cover
    const fitH = img.naturalHeight * cover
    const pos = getComputedStyle(img).objectPosition.split(' ').map(parseFloat)
    const offX = (w - fitW) * (pos[0] / 100)
    const offY = (h - fitH) * (pos[1] / 100)
    sampler.drawImage(img, offX / s.pitchX, offY / s.pitchY, fitW / s.pitchX, fitH / s.pitchY)

    let pixels: Uint8ClampedArray
    try {
      pixels = sampler.getImageData(0, 0, s.columns, s.rows).data
    } catch {
      setReady(false)
      return
    }

    if (!s.base) s.base = document.createElement('canvas')
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = s.base.width = Math.round(w * ratio)
    canvas.height = s.base.height = Math.round(h * ratio)

    const plate = s.base.getContext('2d')
    const ink = canvas.getContext('2d')
    if (!plate || !ink) return

    plate.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0)
    ink.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0)
    plate.fillStyle = '#171717'
    plate.fillRect(0, 0, w, h)
    plate.fillStyle = '#f6f4ec'

    s.dots = new Float32Array(s.columns * s.rows)
    for (let i = 0; i < s.dots.length; i++) {
      const p = i * 4
      const light = (pixels[p] * 0.2126 + pixels[p + 1] * 0.7152 + pixels[p + 2] * 0.0722) / 255
      const size = pitch * Math.sqrt(Math.max(0, (light - 0.04) * 1.15))
      s.dots[i] = size
      if (size < 0.48) continue
      const col = i % s.columns
      const row = Math.floor(i / s.columns)
      plate.fillRect((col + 0.5) * s.pitchX - size / 2, (row + 0.5) * s.pitchY - size / 2, size, size)
    }

    setReady(true)
    if (isPrintingRef.current) renderPrint()
  }, [renderPrint])

  useEffect(() => {
    const mount = frameRef.current
    const img = imgRef.current
    if (!mount || !img) return

    const s = stateRef.current
    const motionPref = matchMedia('(prefers-reduced-motion: reduce)')

    const onPointerMove = (e: PointerEvent) => {
      if (!isPrintingRef.current || motionPref.matches) return
      const bounds = mount.getBoundingClientRect()
      s.pointer = { x: e.clientX - bounds.left, y: e.clientY - bounds.top }
      schedulePrint()
    }

    const onPointerLeave = () => {
      s.pointer = null
      schedulePrint()
    }

    const onMotionChange = () => {
      s.pointer = null
      schedulePrint()
    }

    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerleave', onPointerLeave)
    motionPref.addEventListener('change', onMotionChange)

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
      s.pointer = null
      if (s.visible) {
        prepare()
        schedulePrint()
      } else {
        cancelAnimationFrame(s.frame)
        s.frame = 0
      }
    })
    io.observe(mount)

    const ro = new ResizeObserver(prepare)
    ro.observe(mount)

    if (img.complete) {
      prepare()
    } else {
      img.addEventListener('load', prepare, { once: true })
    }

    return () => {
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerleave', onPointerLeave)
      motionPref.removeEventListener('change', onMotionChange)
      io.disconnect()
      ro.disconnect()
      cancelAnimationFrame(s.frame)
    }
  }, [prepare, schedulePrint])

  const togglePrint = useCallback(() => {
    setIsPrinting(prev => {
      const next = !prev
      stateRef.current.pointer = null
      if (next) {
        requestAnimationFrame(renderPrint)
      }
      return next
    })
  }, [renderPrint])

  return {
    imgRef,
    canvasRef,
    frameRef,
    isPrinting,
    ready,
    togglePrint,
  }
}
