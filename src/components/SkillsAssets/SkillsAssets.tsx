import { TechGlobe } from './TechGlobe'
import { HoverExpandServices } from './HoverExpandServices'
import { RetroGrid } from './RetroGrid'

export function SkillsAssets() {
  return (
    <section className="skills-room" id="skills" data-cursor-theme="ember" aria-labelledby="skills-heading">
      {/* Magic UI RetroGrid Background strictly mounted at z-index 0 behind content */}
      <RetroGrid />

      <div className="folio-measure skills-measure">
        <header className="skills-mast">
          <h2 className="folio-display" id="skills-heading">
            SKILLS <span className="ember-text">&amp;</span> ASSETS
          </h2>
          <span className="skills-meta">SYSTEMS · CODE · ARCHITECTURE</span>
        </header>

        <div className="skills-vertical-flow">
          {/* Top / Center: True 3D Brand Logo Icon Cloud */}
          <div className="skills-globe-showcase">
            <TechGlobe />
          </div>

          {/* Bottom: HoverExpand_001 Services Visual Strip */}
          <div className="skills-services-showcase">
            <HoverExpandServices />
          </div>
        </div>
      </div>
    </section>
  )
}
