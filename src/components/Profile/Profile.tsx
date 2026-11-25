import { useGatherPortrait } from '../../hooks/usePointPrint'
import cvPdf from '../../assets/abdulmueez-cv.pdf'

export function Profile() {
  const { canvasRef, frameRef } = useGatherPortrait()

  return (
    <section className="portrait-room" id="profile" data-cursor-theme="ember" aria-labelledby="profile-heading">
      <div className="folio-measure profile-layout">
        <figure className="profile-photo">
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
              aria-hidden="true"
            />
          </div>
          <figcaption>
            <span>Abdul Mueez</span>
            <span>Systems & Cloud</span>
          </figcaption>
        </figure>
        <div className="profile-text">
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
        </div>
      </div>
    </section>
  )
}
