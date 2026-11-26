import { motion, useReducedMotion } from 'motion/react'
import { useGatherPortrait } from '../../hooks/usePointPrint'
import cvPdf from '../../assets/abdulmueez-cv.pdf'

const REVEAL_VIEWPORT = { once: true, amount: 'some' } as const
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

export function Profile() {
  const { canvasRef, frameRef } = useGatherPortrait()
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="portrait-room" id="profile" data-cursor-theme="ember" aria-labelledby="profile-heading">
      <div className="folio-measure profile-layout">
        <motion.figure
          className="profile-photo"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22, scale: 0.985 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: REVEAL_EASE }}
        >
          <div
            className="gather-frame"
            ref={frameRef}
            role="img"
            aria-label="Abdul Mueez — Gather interactive point-cloud portrait"
          >
            {/* Gather stochastic point-cloud + whisper-thin HUD overlay */}
            <canvas
              ref={canvasRef}
              className="gather-overlay"
              style={{ opacity: 1, backfaceVisibility: 'hidden' }}
              aria-hidden="true"
            />
          </div>
          <figcaption>
            <span>Abdul Mueez</span>
            <span>Systems & Cloud</span>
          </figcaption>
        </motion.figure>
        <motion.div
          className="profile-text"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay: 0.08, ease: REVEAL_EASE }
          }
        >
          <h2 className="folio-display" id="profile-heading">
            <span className="ember-text">PRO</span>FILE
          </h2>
          <p>I'm Abdul Mueez, a computer science student.</p>
          <p>
            I like tracing an application from the interface back to the systems that run it. Outside my coursework, I lead the{' '}
            <span className="ember-text">AWS</span> Student Builder Group.
          </p>
          <dl>
            <div>
              <dt>Education</dt>
              <dd>BS Computer Science<br /><span><span className="ember-text">FAST-NUCES</span> · Batch of 2024</span></dd>
            </div>
          </dl>
          <a className="folio-link" href={cvPdf} download="abdulmueez-cv.pdf">
            Download CV <span aria-hidden="true">↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
