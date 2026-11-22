import { useState, useCallback } from 'react'

export function Contact() {
  const [copyStatus, setCopyStatus] = useState('')

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
    <footer className="contact-room" id="contact" aria-labelledby="contact-heading">
      <div className="folio-measure">
        <div className="contact-invite">
          <h2 className="folio-display" id="contact-heading">
            <a href="mailto:abdulmueezshahid550@gmail.com">
              Say hello<span className="contact-arrow" aria-hidden="true">↗</span>
            </a>
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
    </footer>
  )
}
