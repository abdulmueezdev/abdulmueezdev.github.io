import { CRTMonitor } from '../CRTMonitor/CRTMonitor'
import { useHeroParallax } from '../../hooks/useHeroParallax'
import { usePeshawarClock } from '../../hooks/usePeshawarClock'

export function Hero() {
  const { sceneRef, stageRef } = useHeroParallax()
  const time = usePeshawarClock()

  return (
    <section className="opening" id="home" data-cursor-theme="dark" aria-labelledby="hero-title" ref={sceneRef}>
      <div className="hero-frame">
        <header className="masthead">
          <a className="wordmark" href="#home">
            <b aria-hidden="true">A<span>/</span>M</b>
            <span className="brand-name">Abdul Mueez</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#skills">Skills</a>
            <a href="#profile">Profile</a>
            <a href="#contact">Contact <span aria-hidden="true">↗</span></a>
          </nav>
        </header>
        <div className="hero-stage" ref={stageRef}>
          <div className="hero-register">
            <span><i aria-hidden="true"></i> Developer portfolio</span>
            <span>PKT · UTC+5 <b aria-hidden="true">/</b> <time>{time}</time></span>
          </div>
          <h1 id="hero-title" className="hero-name">
            <span>Abdul Mueez</span>
          </h1>
          <div className="hero-field" aria-hidden="true"></div>
          <CRTMonitor />
          <div className="hero-notes">
            <p className="discipline">Code<span>.</span> Cloud<span>.</span><br />Craft<span>.</span></p>
            <div className="hero-bio">
              <p>I'm Abdul Mueez, a computer science student building web apps and working with <span className="ember-text">AWS</span>.</p>
              <a href="#work">Selected work <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
