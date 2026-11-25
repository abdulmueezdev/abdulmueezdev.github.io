import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useLenis } from 'lenis/react'
import '../../styles/preloader.css'

const STORAGE_KEY = 'am_portfolio_preloader_seen'

const WORDS = [
  'Hello',
  'Bonjour',
  'Ciao',
  'Olà',
  'やあ',
  'Hallå',
  'Guten tag',
  'Hallo',
  'السلام علیکم',
  'Welcome',
]

function canShowFirstVisitPreloader(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}

export function Preloader() {
  const lenis = useLenis()
  const [shouldShow] = useState(canShowFirstVisitPreloader)
  const [isActive, setIsActive] = useState(shouldShow)
  const [isMounted, setIsMounted] = useState(shouldShow)
  const [index, setIndex] = useState(0)
  const [dimension, setDimension] = useState(() =>
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 },
  )
  const prevOverflowRef = useRef<string>('')

  useEffect(() => {
    if (!isMounted) return

    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Ignore storage quota / private mode restrictions
    }

    prevOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setDimension({ width: window.innerWidth, height: window.innerHeight })

    const onResize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = prevOverflowRef.current
    }
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return
    lenis?.stop()
    return () => {
      lenis?.start()
    }
  }, [isMounted, lenis])

  useEffect(() => {
    if (!isActive) return

    if (index >= WORDS.length - 1) {
      const doneTimer = window.setTimeout(() => {
        setIsActive(false)
      }, 220)
      return () => window.clearTimeout(doneTimer)
    }

    const delayMs = index === 0 ? 800 : 140
    const wordTimer = window.setTimeout(() => {
      setIndex((prev) => prev + 1)
    }, delayMs)

    return () => window.clearTimeout(wordTimer)
  }, [index, isActive])

  const handleExitComplete = useCallback(() => {
    document.body.style.overflow = prevOverflowRef.current
    lenis?.start()
    setIsMounted(false)
  }, [lenis])

  if (!isMounted) return null

  const { width, height } = dimension
  const initialPath = `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height + 300} 0 ${height} L0 0`
  const targetPath = `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height} 0 ${height} L0 0`

  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      {isActive && (
        <motion.div
          key="skiper8-preloader"
          className={`preloader-curtain${width === 0 ? ' is-unmeasured' : ''}`}
          data-cursor-theme="ember"
          role="status"
          aria-live="polite"
          aria-label="Loading portfolio"
          initial={{ y: 0 }}
          exit={{
            y: '-100vh',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
          }}
        >
          {width > 0 && (
            <>
              <motion.p
                className="preloader-word"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.06 } }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <span className="preloader-dot" aria-hidden="true" />
                <span dir="auto">{WORDS[index]}</span>
              </motion.p>
              <svg className="preloader-svg" aria-hidden="true">
                <motion.path
                  initial={{ d: initialPath }}
                  exit={{
                    d: targetPath,
                    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.25 },
                  }}
                />
              </svg>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
