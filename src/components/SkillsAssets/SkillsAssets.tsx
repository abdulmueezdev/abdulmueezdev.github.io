import { motion, useReducedMotion } from 'motion/react'
import { TechGlobe } from './TechGlobe'
import { HoverExpandServices } from './HoverExpandServices'
import { RetroGrid } from './RetroGrid'

const REVEAL_VIEWPORT = { once: true, amount: 'some' } as const
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

export function SkillsAssets() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="skills-room" id="skills" data-cursor-theme="ember" aria-labelledby="skills-heading">
      {/* Magic UI RetroGrid Background strictly mounted at z-index 0 behind content */}
      <RetroGrid />

      <div className="folio-measure skills-measure">
        <motion.header
          className="skills-mast"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: REVEAL_EASE }}
        >
          <h2 className="folio-display" id="skills-heading">
            SKILLS <span className="ember-text">&amp;</span> ASSETS
          </h2>
          <span className="skills-meta">SYSTEMS · CODE · ARCHITECTURE</span>
        </motion.header>

        <div className="skills-vertical-flow">
          {/* Top / Center: True 3D Brand Logo Icon Cloud */}
          <motion.div
            className="skills-globe-showcase"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={REVEAL_VIEWPORT}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay: 0.06, ease: REVEAL_EASE }
            }
          >
            <TechGlobe />
          </motion.div>

          {/* Bottom: HoverExpand_001 Services Visual Strip */}
          <motion.div
            className="skills-services-showcase"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay: 0.12, ease: REVEAL_EASE }
            }
          >
            <HoverExpandServices />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
