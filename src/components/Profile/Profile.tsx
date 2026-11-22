import { usePointPrint } from '../../hooks/usePointPrint'
import portrait from '../../assets/portrait.webp'
import cvPdf from '../../assets/abdulmueez-cv.pdf'

export function Profile() {
  const { imgRef, canvasRef, frameRef, isPrinting, ready, togglePrint } = usePointPrint()

  return (
    <section className="portrait-room" id="profile" aria-labelledby="profile-heading">
      <div className="folio-measure profile-layout">
        <figure className="profile-photo">
          <div
            className={`point-frame${isPrinting ? ' printing-points' : ''}`}
            ref={frameRef}
          >
            <img
              ref={imgRef}
              src={portrait}
              width={900}
              height={1600}
              alt="Black-and-white side profile of Abdul-Mueez Shahid"
              loading="lazy"
            />
            <canvas
              id="profile-point-print"
              className="point-print"
              ref={canvasRef}
              aria-hidden="true"
            />
            {ready && (
              <button
                type="button"
                className="point-switch"
                aria-pressed={isPrinting}
                aria-controls="profile-point-print"
                onClick={togglePrint}
              >
                Point print
              </button>
            )}
          </div>
          <figcaption>
            <span>Abdul-Mueez Shahid</span>
            <span>Peshawar, PK</span>
          </figcaption>
        </figure>
        <div className="profile-text">
          <h2 className="folio-display" id="profile-heading">Profile</h2>
          <p>I'm Abdul-Mueez Shahid, a computer science student in Peshawar.</p>
          <p>I like tracing an application from the interface back to the systems that run it. Outside my coursework, I lead the AWS Student Builder Group.</p>
          <dl>
            <div>
              <dt>Education</dt>
              <dd>BS Computer Science<br /><span>FAST-NUCES Peshawar · Batch of 2024</span></dd>
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
