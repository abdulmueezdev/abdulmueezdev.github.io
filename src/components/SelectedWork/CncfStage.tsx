import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { PenguinMascot } from './PenguinMascot'

interface CncfStageProps {
  plateRef: (el: HTMLDivElement | null) => void
}

const MASCOT_MESSAGES = [
  'Welcome to CNCF Peshawar!',
  'Kubernetes & Cloud Native!',
  '100% free & open to all.',
  'Zero slop, pure engineering.',
  'Wheee! Nice boop! 🐧',
  'Deploying to cluster...',
]

export function CncfStage({ plateRef }: CncfStageProps) {
  const [showMeetupModal, setShowMeetupModal] = useState(false)
  const [rsvpCount, setRsvpCount] = useState(48)
  const [isRsvpd, setIsRsvpd] = useState(false)
  const [isMarqueePaused, setIsMarqueePaused] = useState(false)
  const [mascotMessageIndex, setMascotMessageIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  const handleMascotBoop = useCallback(() => {
    setMascotMessageIndex(prev => (prev + 1) % MASCOT_MESSAGES.length)
  }, [])

  const handleRsvpToggle = () => {
    if (isRsvpd) {
      setIsRsvpd(false)
      setRsvpCount(prev => prev - 1)
    } else {
      setIsRsvpd(true)
      setRsvpCount(prev => prev + 1)
    }
  }

  return (
    <div
      className="project-plate plate-cncf"
      ref={plateRef}
      aria-label="CNCF Peshawar interactive stage"
    >
      {/* Outer subtle backdrop grid */}
      <div className="cncf-stage-outer-grid" aria-hidden="true" />

      {/* Main Neo-Brutalist CNCF Peshawar Mini-UI Frame */}
      <div className="cncf-site-window">
        {/* Top White Neo-Brutalist Navbar */}
        <header className="cncf-nav" role="banner">
          <div className="cncf-nav-brand">
            <span className="cncf-brand-name">CNCF PESHAWAR</span>
            <span className="cncf-badge-pk" aria-label="Pakistan Chapter">
              PK
            </span>
          </div>

          <nav className="cncf-nav-links" aria-label="CNCF Peshawar mini-site navigation">
            <span className="cncf-nav-link is-active">HOME</span>
            <span className="cncf-nav-link">EVENTS</span>
            <span className="cncf-nav-link">SPEAK</span>
            <span className="cncf-nav-link">SPONSORS</span>
            <span className="cncf-nav-link">TEAM</span>
          </nav>

          <a
            href="https://cncf-peshawar-redesign.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="cncf-btn-ocg"
            aria-label="Join on Open Community Groups (opens in new tab)"
          >
            JOIN ON OCG
          </a>
        </header>

        {/* Vibrant CNCF Royal Blue Hero Stage Canvas */}
        <div className="cncf-hero-canvas">
          {/* Subtle vertical grid lines */}
          <div className="cncf-grid-lines" aria-hidden="true" />

          {/* Animated vertical white streak particles */}
          <div className="cncf-particles" aria-hidden="true">
            <span className="cncf-particle p1" />
            <span className="cncf-particle p2" />
            <span className="cncf-particle p3" />
            <span className="cncf-particle p4" />
            <span className="cncf-particle p5" />
          </div>

          {/* Hero Content Column */}
          <div className="cncf-hero-content">
            {/* Top Badges Row */}
            <div className="cncf-badge-row">
              <span className="cncf-pill-badge">CNCF COMMUNITY CHAPTER</span>
              <span className="cncf-sticker-badge">100% free & open to all</span>
            </div>

            {/* Bold Display Headline */}
            <h4 className="cncf-headline">BUILDING PESHAWAR'S CLOUD NATIVE FUTURE.</h4>

            {/* Subcopy */}
            <p className="cncf-subcopy">
              Empowering local engineers, developers, and students through hands-on Kubernetes,
              distributed systems, and open-source collaboration in Khyber Pakhtunkhwa.
            </p>

            {/* Interactive Neo-Brutalist CTAs */}
            <div className="cncf-actions-row">
              <a
                href="https://cncf-peshawar-redesign.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="cncf-cta-primary"
              >
                JOIN CHAPTER ON OCG ↗
              </a>

              <button
                type="button"
                className={`cncf-cta-secondary${showMeetupModal ? ' is-active' : ''}`}
                onClick={() => setShowMeetupModal(prev => !prev)}
                aria-expanded={showMeetupModal}
                aria-controls="cncf-meetup-panel"
              >
                {showMeetupModal ? 'CLOSE PREVIEW' : 'EXPLORE MEETUPS'}
              </button>
            </div>
          </div>

          {/* Real Mascot Interactive Pod */}
          <div className="cncf-mascot-pod">
            {/* Mascot Speech Bubble */}
            <div className="cncf-mascot-speech" aria-live="polite">
              <code>{MASCOT_MESSAGES[mascotMessageIndex]}</code>
            </div>

            {/* Authentic nilbuild/page-mascot Penguin Component */}
            <PenguinMascot
              size="clamp(80px, 12cqw, 114px)"
              label="CNCF Penguin mascot"
              onBoop={handleMascotBoop}
            />
            <span className="cncf-mascot-caption">CLICK TO BOOP TUX</span>
          </div>

          {/* Interactive Meetup Drawer / Preview Panel */}
          <AnimatePresence>
            {showMeetupModal && (
              <motion.div
                id="cncf-meetup-panel"
                className="cncf-meetup-overlay"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                role="region"
                aria-label="Upcoming CNCF Peshawar Meetup details"
              >
                <div className="cncf-meetup-card">
                  <div className="cncf-meetup-card-header">
                    <span className="cncf-meetup-badge">UPCOMING // CHAPTER #01</span>
                    <button
                      type="button"
                      className="cncf-meetup-close-btn"
                      onClick={() => setShowMeetupModal(false)}
                      aria-label="Close meetup details"
                    >
                      ✕
                    </button>
                  </div>
                  <h5 className="cncf-meetup-name">Cloud Native & Agentic AI Systems</h5>
                  <p className="cncf-meetup-info">
                    Deep dive into container orchestration, Helm production charts, and local AI
                    agents on Kubernetes.
                  </p>
                  <div className="cncf-meetup-meta-row">
                    <span>📍 CECOS / NIC Peshawar</span>
                    <span>🗓 Monthly Meetup</span>
                  </div>
                  <button
                    type="button"
                    className={`cncf-rsvp-action-btn${isRsvpd ? ' is-confirmed' : ''}`}
                    onClick={handleRsvpToggle}
                  >
                    {isRsvpd ? `RSVP'D ✓ [${rsvpCount} ATTENDING]` : `RSVP NOW [${rsvpCount} ATTENDING]`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Yellow Neo-Brutalist Marquee Bar */}
        <div
          className={`cncf-marquee-bar${isMarqueePaused || shouldReduceMotion ? ' is-paused' : ''}`}
          aria-label="CNCF community highlight marquee"
        >
          <div className="cncf-marquee-track">
            <span className="cncf-marquee-item">
              DEVOPS · MLOPS · AGENTIC AI · 100% FREE · OPEN TO ALL · KUBERNETES · CLOUD NATIVE PESHAWAR ·&nbsp;
            </span>
            <span className="cncf-marquee-item" aria-hidden="true">
              DEVOPS · MLOPS · AGENTIC AI · 100% FREE · OPEN TO ALL · KUBERNETES · CLOUD NATIVE PESHAWAR ·&nbsp;
            </span>
            <span className="cncf-marquee-item" aria-hidden="true">
              DEVOPS · MLOPS · AGENTIC AI · 100% FREE · OPEN TO ALL · KUBERNETES · CLOUD NATIVE PESHAWAR ·&nbsp;
            </span>
          </div>

          {/* Marquee Play/Pause Toggle Button */}
          <button
            type="button"
            className="cncf-marquee-control"
            onClick={() => setIsMarqueePaused(prev => !prev)}
            aria-label={isMarqueePaused ? 'Play marquee' : 'Pause marquee'}
            title={isMarqueePaused ? 'Play marquee' : 'Pause marquee'}
          >
            {isMarqueePaused ? '▶' : '⏸'}
          </button>
        </div>
      </div>
    </div>
  )
}
