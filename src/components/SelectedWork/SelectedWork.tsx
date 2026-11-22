import { useState, useCallback, useRef, useEffect } from 'react'
import { useArtworkParallax } from '../../hooks/useArtworkParallax'

interface Tab {
  id: string
  label: string
  panelId: string
}

const tabs: Tab[] = [
  { id: 'tab-alucard', label: 'Alucard AI', panelId: 'project-alucard' },
  { id: 'tab-research', label: 'Research Opportunity Portal', panelId: 'project-research' },
]

export function SelectedWork() {
  const [activeTab, setActiveTab] = useState(0)
  const [bookOpen, setBookOpen] = useState(false)
  const { setPlateRef } = useArtworkParallax()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

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

  const toggleBook = useCallback(() => setBookOpen(prev => !prev), [])

  return (
    <section className="work-room" id="work" aria-labelledby="work-heading">
      <div className="folio-measure">
        <header className="work-mast">
          <h2 className="folio-display" id="work-heading">Selected work</h2>
          <a className="folio-link" href="https://github.com/abdulmueezdev">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </header>

        <div>
          <div className="reel-switch" role="tablist" aria-label="Selected projects">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[i] = el }}
                type="button"
                id={tab.id}
                role="tab"
                aria-selected={i === activeTab}
                aria-controls={tab.panelId}
                tabIndex={i === activeTab ? 0 : -1}
                onClick={() => handleTabClick(i)}
                onKeyDown={e => handleTabKeyDown(e, i)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alucard AI */}
          <article
            className="folio-project"
            id="project-alucard"
            role="tabpanel"
            aria-labelledby="tab-alucard"
            hidden={activeTab !== 0}
          >
            <div
              className={`project-plate plate-kafka${bookOpen ? ' book-open' : ''}`}
              ref={setPlateRef(0)}
            >
              <div className="kafka-type" aria-hidden="true">KAFKA</div>
              <div className="book-prop" aria-hidden="true">
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
          </article>

          {/* Research Opportunity Portal */}
          <article
            className="folio-project"
            id="project-research"
            role="tabpanel"
            aria-labelledby="tab-research"
            hidden={activeTab !== 1}
          >
            <div className="project-plate plate-portal" ref={setPlateRef(1)}>
              <div className="portal-grid" aria-hidden="true"></div>
              <div className="portal-folder" aria-hidden="true">
                <div className="folder-back"></div>
                <div className="folder-sheet sheet-one"><span>Faculty</span></div>
                <div className="folder-sheet sheet-two"><span>Students</span></div>
                <div className="folder-front">
                  <span>Research</span>
                  <strong>Open<br />calls.</strong>
                  <i>Opportunity portal</i>
                </div>
              </div>
            </div>
            <div className="folio-caption">
              <p className="folio-category">Academic software</p>
              <h3 id="research-name">Research Opportunity Portal</h3>
              <p>Students can find research projects with faculty mentors. Faculty can publish and manage their own listings.</p>
              <p className="folio-stack">React · TypeScript · Express · MySQL</p>
              <div className="folio-actions">
                <a className="folio-link" href="https://github.com/abdulmueezdev/research-opportunity-portal">
                  Explore the source <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        </div>

        <div className="work-index">
          <h3>Other work</h3>
          <div>
            <details>
              <summary>LeadMap<span aria-hidden="true"></span></summary>
              <p>A lead research tool that enriches Google Places business listings with contact details and ranks them using configurable scoring rules.</p>
            </details>
            <details>
              <summary>Nabeel Photographic Moments<span aria-hidden="true"></span></summary>
              <p>A photography portfolio built around a gallery of the photographer's work.</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  )
}
