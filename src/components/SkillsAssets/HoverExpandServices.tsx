import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import saasVisual from '../../assets/services/saas.svg'
import ragVisual from '../../assets/services/rag-bot.svg'
import portfolioVisual from '../../assets/services/portfolio.svg'
import fullstackVisual from '../../assets/services/fullstack.svg'
import appDevVisual from '../../assets/services/app-dev.svg'
import voiceVisual from '../../assets/services/voice-agents.svg'

export interface ServiceCardData {
  id: string
  name: string
  code: string
  src: string
  alt: string
}

export const SERVICES: ServiceCardData[] = [
  {
    id: 'saas',
    name: 'SAAS',
    code: '01 / SAAS',
    src: saasVisual,
    alt: 'SAAS — Multi-Tenant Cloud Architecture',
  },
  {
    id: 'rag-bot',
    name: 'RAG Bot',
    code: '02 / RAG BOT',
    src: ragVisual,
    alt: 'RAG Bot — Domain-Grounded Context Retrieval',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    code: '03 / PORTFOLIO',
    src: portfolioVisual,
    alt: 'Portfolio — Bespoke Digital Editorial Craft',
  },
  {
    id: 'fullstack',
    name: 'FullStack',
    code: '04 / FULLSTACK',
    src: fullstackVisual,
    alt: 'FullStack — Unified Frontend to Infrastructure',
  },
  {
    id: 'app-dev',
    name: 'App Development',
    code: '05 / APP DEV',
    src: appDevVisual,
    alt: 'App Development — Cross-Platform Native Mobile Engineering',
  },
  {
    id: 'voice-agents',
    name: 'Voice Agents',
    code: '06 / VOICE AGENTS',
    src: voiceVisual,
    alt: 'Voice Agents — Real-Time Bidirectional Speech Intelligence',
  },
]

export function HoverExpandServices() {
  const [activeImage, setActiveImage] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const collapsedWidth = isMobile ? '2.25rem' : '4.8rem'
  const expandedWidth = isMobile ? '11.5rem' : '22rem'
  const cardHeight = isMobile ? '18rem' : '24rem'

  return (
    <div className="hover-expand-container" role="region" aria-label="Engineered Services Visual Strip">
      <div className="hover-expand-track">
        {SERVICES.map((service, index) => {
          const isActive = activeImage === index

          return (
            <motion.button
              type="button"
              key={service.id}
              className={`hover-expand-card${isActive ? ' is-active' : ''}`}
              aria-label={service.alt}
              aria-expanded={isActive}
              onClick={() => setActiveImage(index)}
              onMouseEnter={() => setActiveImage(index)}
              onFocus={() => setActiveImage(index)}
              animate={{
                width: isActive ? expandedWidth : collapsedWidth,
                height: cardHeight,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <img
                src={service.src}
                className="hover-expand-img"
                alt=""
                aria-hidden="true"
                loading="lazy"
              />

              {/* Scrim Overlay */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover-expand-scrim"
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>

              {/* Minimal Code Label on Active Expand */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                    className="hover-expand-label-wrap"
                  >
                    <span className="hover-expand-code">{service.code}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
