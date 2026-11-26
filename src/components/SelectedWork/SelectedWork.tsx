import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useArtworkParallax } from '../../hooks/useArtworkParallax'
import { CncfStage } from './CncfStage'

interface Tab {
  id: string
  label: string
  panelId: string
}

const REVEAL_VIEWPORT = { once: true, amount: 'some' } as const
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

const tabs: Tab[] = [
  { id: 'tab-alucard', label: 'Alucard AI', panelId: 'project-alucard' },
  { id: 'tab-cncf', label: 'CNCF Peshawar', panelId: 'project-cncf' },
]

export function SelectedWork() {
  const [activeTab, setActiveTab] = useState(0)
  const [bookOpen, setBookOpen] = useState(false)
  const [leadMapOpen, setLeadMapOpen] = useState(false)
  const { setPlateRef } = useArtworkParallax()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const shouldReduceMotion = useReducedMotion()

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index)
    setBookOpen(false)
  }, [])

  const handleTabKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    const destinations: Record<string, number> = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }
    if (!(event.key in destinations)) return
    event.preventDefault()
    const next = destinations[event.key]
    setActiveTab(next)
    setBookOpen(false)
    tabRefs.current[next]?.focus()
  }, [])

  const handlePlatePointerEnter = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    setBookOpen(prev => !prev)
  }, [])

  const toggleBook = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    setBookOpen(prev => !prev)
  }, [])

  return (
    <section className="work-room" id="work" data-cursor-theme="ember" aria-labelledby="work-heading">
      <div className="folio-measure">
        <motion.header
          className="work-mast"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: REVEAL_EASE }}
        >
          <h2 className="folio-display" id="work-heading">Selected work</h2>
          <a className="folio-link" href="https://github.com/abdulmueezdev">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </motion.header>

        <motion.div
          className="folio-stage-area"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay: 0.06, ease: REVEAL_EASE }
          }
        >
          {/* Fluid Shared-Layout Tablist */}
          <div className="reel-switch" role="tablist" aria-label="Selected projects">
            {tabs.map((tab, i) => {
              const isSelected = i === activeTab
              return (
                <button
                  key={tab.id}
                  ref={el => { tabRefs.current[i] = el }}
                  type="button"
                  id={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={tab.panelId}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleTabClick(i)}
                  onKeyDown={e => handleTabKeyDown(e, i)}
                >
                  <span className="tab-indicator-box" aria-hidden="true">
                    {isSelected && (
                      <motion.span
                        layoutId="activeProjectIndicator"
                        className="tab-indicator-active"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 380, damping: 30 }
                        }
                      />
                    )}
                  </span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Smooth Project Switcher */}
          <AnimatePresence mode="wait">
            {activeTab === 0 ? (
              <motion.article
                key="project-alucard"
                className="folio-project"
                id="project-alucard"
                role="tabpanel"
                aria-labelledby="tab-alucard"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
                }
              >
                <div
                  className={`project-plate plate-kafka${bookOpen ? ' book-open' : ''}`}
                  ref={setPlateRef(0)}
                  onPointerEnter={handlePlatePointerEnter}
                >
                  <div className="kafka-type" aria-hidden="true">KAFKA</div>
                  <div className="book-prop" onClick={toggleBook} aria-hidden="true">
                    <div className="book-leaves">
                      <span>PRAGUE, 1922</span>
                      <strong>Franz<br />Kafka</strong>
                      <i>Enter your defense…</i>
                    </div>
                    <div className="book-cover">
                      <div className="jacket-front">
                        <small>FRANZ KAFKA</small>
                        <strong>K.</strong>
                        <small>ALUCARD AI</small>
                      </div>
                      <div className="jacket-back"><i>K.</i></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="plate-control"
                    onClick={toggleBook}
                    aria-expanded={bookOpen}
                    aria-label={bookOpen ? 'Close book' : 'Open book'}
                  >
                    <span aria-hidden="true">{bookOpen ? '−' : '+'}</span>{' '}
                    <span>{bookOpen ? 'Close' : 'Open'} book</span>
                  </button>
                </div>
                <div className="folio-caption">
                  <p className="folio-category">Conversational AI</p>
                  <h3 id="alucard-name">Alucard AI</h3>
                  <p>Ask Franz Kafka a question. Alucard retrieves passages from his writing and uses them to answer in character.</p>
                  <p className="folio-stack">Gemini embeddings · Supabase pgvector · Groq</p>
                  <div className="folio-actions">
                    <a className="folio-link" href="https://ai-bot-psi-three.vercel.app/">
                      Talk to Kafka <span aria-hidden="true">↗</span>
                    </a>
                    <a className="folio-link secondary-link" href="https://github.com/abdulmueezdev/AI-Bot">
                      Source code <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </motion.article>
            ) : (
              <motion.article
                key="project-cncf"
                className="folio-project"
                id="project-cncf"
                role="tabpanel"
                aria-labelledby="tab-cncf"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
                }
              >
                <CncfStage plateRef={setPlateRef(1)} />
                <div className="folio-caption">
                  <p className="folio-category">Community Platform</p>
                  <h3 id="cncf-name">CNCF Peshawar</h3>
                  <p>Redesigned web platform for Peshawar's official Cloud Native Computing Foundation community chapter, serving local meetups, speaker proposals, and developer resources.</p>
                  <p className="folio-stack">Astro · TypeScript · Tailwind CSS · GitHub Pages</p>
                  <div className="folio-actions">
                    <a className="folio-link" href="https://cncf-peshawar-redesign.vercel.app/">
                      Visit platform <span aria-hidden="true">↗</span>
                    </a>
                    <a className="folio-link secondary-link" href="https://github.com/cncf-peshawar/cncf-peshawar.github.io">
                      Source code <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="work-index"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: REVEAL_EASE }}
        >
          <h3>Other work</h3>
          <div className="other-work-list">
            <div className={`other-work-item${leadMapOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                id="other-work-leadmap-trigger"
                className="other-work-trigger"
                onClick={() => setLeadMapOpen(prev => !prev)}
                aria-expanded={leadMapOpen}
                aria-controls="other-work-leadmap-panel"
              >
                <span className="other-work-title">LeadMap</span>
                <motion.span
                  className="other-work-icon"
                  aria-hidden="true"
                  animate={{ rotate: leadMapOpen ? 45 : 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, ease: [0.32, 0.72, 0, 1] }
                  }
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {leadMapOpen && (
                  <motion.div
                    id="other-work-leadmap-panel"
                    role="region"
                    aria-labelledby="other-work-leadmap-trigger"
                    className="other-work-panel"
                    initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
                    }
                  >
                    <p>
                      A lead research tool that enriches Google Places business listings with contact details and ranks them using configurable scoring rules.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
