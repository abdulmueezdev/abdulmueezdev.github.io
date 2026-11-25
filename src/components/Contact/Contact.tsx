import { useState, useCallback, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useLenis } from 'lenis/react'
import { ContactModalPage } from './ContactModalPage'
import '../../styles/contact-page.css'

const SKIPER26_GIF_1_URL =
  'https://media.giphy.com/media/KBbr4hHl9DSahKvInO/giphy.gif?cid=790b76112m5eeeydoe7et0cr3j3ekb1erunxozyshuhxx2vl&ep=v1_stickers_search&rid=giphy.gif&ct=s'

const VT_STYLE_ID = 'contact-view-transition-styles'

const SKIPER26_GIF_CSS = `
::view-transition-group(root) {
  animation-duration: 3s;
  animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
}

::view-transition-new(root) {
  mask: url('${SKIPER26_GIF_1_URL}') center / 0 no-repeat;
  mask-mode: alpha;
  animation: contact-gif-scale 3s cubic-bezier(0.7, 0, 0.84, 0) both;
  animation-fill-mode: both;
  mix-blend-mode: normal;
  z-index: 2;
}

::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  mix-blend-mode: normal;
  z-index: 1;
}

@keyframes contact-gif-scale {
  0% {
    mask-size: 0;
  }
  10% {
    mask-size: 50vmax;
  }
  90% {
    mask-size: 50vmax;
  }
  100% {
    mask-size: 2000vmax;
  }
}
`

const SKIPER26_CIRCLE_CLOSE_CSS = `
::view-transition-group(root) {
  animation-duration: 1.7s;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

::view-transition-new(root) {
  animation: contact-circle-close 1.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-fill-mode: both;
  mix-blend-mode: normal;
  z-index: 2;
}

::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  mix-blend-mode: normal;
  z-index: 1;
}

@keyframes contact-circle-close {
  from {
    clip-path: circle(0% at 50% 50%);
  }
  to {
    clip-path: circle(150% at 50% 50%);
  }
}
`

function supportsReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof document.startViewTransition === 'function'
  )
}

function prefersMobileMotionFallback(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none), (pointer: coarse), (max-width: 768px)').matches
  )
}

function setViewTransitionStyles(css: string) {
  let styleEl = document.getElementById(VT_STYLE_ID) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = VT_STYLE_ID
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = css
}

export function Contact() {
  const [copyStatus, setCopyStatus] = useState('')
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [usedViewTransition, setUsedViewTransition] = useState(false)

  const gifFailedRef = useRef(false)
  const gifPreloadedRef = useRef(false)
  const headingTriggerRef = useRef<HTMLButtonElement>(null)
  const activeTransitionRef = useRef<ViewTransition | null>(null)
  const scrollLockRef = useRef<{ overflow: string; paddingRight: string } | null>(null)
  const lenis = useLenis()

  const lockRootScroll = useCallback(() => {
    lenis?.stop()
    if (!scrollLockRef.current) {
      scrollLockRef.current = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      }
      const gap = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
      if (gap > 0) {
        document.body.style.paddingRight = `${gap}px`
      }
      document.body.style.overflow = 'hidden'
    }
  }, [lenis])

  const unlockRootScroll = useCallback(() => {
    if (scrollLockRef.current) {
      document.body.style.overflow = scrollLockRef.current.overflow
      document.body.style.paddingRight = scrollLockRef.current.paddingRight
      scrollLockRef.current = null
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    lenis?.start()
  }, [lenis])

  const preloadGif = useCallback(() => {
    if (typeof window === 'undefined' || gifPreloadedRef.current) return
    gifPreloadedRef.current = true
    const img = new Image()
    img.onload = () => {
      gifFailedRef.current = false
    }
    img.onerror = () => {
      gifFailedRef.current = true
    }
    img.src = SKIPER26_GIF_1_URL
  }, [])

  useEffect(() => {
    preloadGif()
    return () => {
      activeTransitionRef.current?.skipTransition?.()
      activeTransitionRef.current = null
      document.getElementById(VT_STYLE_ID)?.remove()
      unlockRootScroll()
    }
  }, [preloadGif, unlockRootScroll])

  const runViewTransition = useCallback(
    (css: string, commitDom: () => void, afterFinish?: () => void) => {
      activeTransitionRef.current?.skipTransition?.()
      setViewTransitionStyles(css)
      const transition = document.startViewTransition(() => {
        flushSync(commitDom)
      })
      activeTransitionRef.current = transition
      transition.finished.finally(() => {
        if (activeTransitionRef.current === transition) {
          activeTransitionRef.current = null
          document.getElementById(VT_STYLE_ID)?.remove()
          afterFinish?.()
        }
      })
    },
    [],
  )

  const restoreScrollAndFocus = useCallback(() => {
    unlockRootScroll()
    requestAnimationFrame(() => {
      headingTriggerRef.current?.focus({ preventScroll: true })
    })
  }, [unlockRootScroll])

  const openContact = useCallback(() => {
    lockRootScroll()
    const canTransition =
      supportsViewTransitions() &&
      !supportsReducedMotion() &&
      !gifFailedRef.current &&
      !prefersMobileMotionFallback()

    if (!canTransition) {
      setUsedViewTransition(false)
      setIsContactOpen(true)
      return
    }

    runViewTransition(SKIPER26_GIF_CSS, () => {
      setUsedViewTransition(true)
      setIsContactOpen(true)
    })
  }, [lockRootScroll, runViewTransition])

  const closeContact = useCallback(() => {
    const canTransition =
      supportsViewTransitions() &&
      !supportsReducedMotion() &&
      !prefersMobileMotionFallback()
    if (!canTransition) {
      activeTransitionRef.current?.skipTransition?.()
      activeTransitionRef.current = null
      document.getElementById(VT_STYLE_ID)?.remove()
      setUsedViewTransition(false)
      setIsContactOpen(false)
      return
    }

    runViewTransition(
      SKIPER26_CIRCLE_CLOSE_CSS,
      () => {
        setUsedViewTransition(true)
        setIsContactOpen(false)
      },
      () => {
        setUsedViewTransition(false)
        restoreScrollAndFocus()
      },
    )
  }, [restoreScrollAndFocus, runViewTransition])

  const handleCopy = useCallback(async () => {
    const address = 'abdulmueezshahid550@gmail.com'
    try {
      await navigator.clipboard.writeText(address)
      setCopyStatus('Email copied.')
    } catch {
      setCopyStatus('Select the address to copy it.')
    }
  }, [])

  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText

  return (
    <footer className="contact-room" id="contact" data-cursor-theme="dark" aria-labelledby="contact-heading">
      <div className="folio-measure">
        <div className="contact-invite">
          <h2 className="folio-display" id="contact-heading">
            <button
              ref={headingTriggerRef}
              type="button"
              className="contact-heading-trigger"
              onMouseEnter={preloadGif}
              onFocus={preloadGif}
              onClick={openContact}
              aria-haspopup="dialog"
              aria-expanded={isContactOpen}
            >
              Say hello<span className="contact-arrow" aria-hidden="true">↗</span>
            </button>
          </h2>
          <div className="contact-address">
            <a href="mailto:abdulmueezshahid550@gmail.com">abdulmueezshahid550@gmail.com</a>
            {canCopy && (
              <button
                className="address-copy"
                type="button"
                onClick={handleCopy}
                aria-label="Copy email address"
                title="Copy email address"
              >
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <rect x={8} y={8} width={12} height={13} rx={1} />
                  <path d="M16 8V3H3v13h5" />
                </svg>
              </button>
            )}
            <span className="address-status" role="status">{copyStatus}</span>
          </div>
        </div>
        <div className="contact-ledger">
          <nav aria-label="Social profiles">
            <a href="https://github.com/abdulmueezdev">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/abdulmueezdev/">LinkedIn ↗</a>
            <a href="https://www.instagram.com/abdul.mueez.shahid/">Instagram ↗</a>
          </nav>
          <a href="#home">Back to top ↑</a>
        </div>
      </div>

      <ContactModalPage
        isOpen={isContactOpen}
        usedViewTransition={usedViewTransition}
        onClose={closeContact}
        onAfterClose={restoreScrollAndFocus}
      />
    </footer>
  )
}
