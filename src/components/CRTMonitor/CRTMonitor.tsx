import { useCallback } from 'react'
import { useCRTRenderer } from '../../hooks/useCRTRenderer'
import { useMonitorTilt } from '../../hooks/useMonitorTilt'
import fieldMonitor from '../../assets/field-monitor.webp'

export function CRTMonitor() {
  const { canvasRef, waveform, toggleSignal } = useCRTRenderer()
  const shellRef = useMonitorTilt()

  const handleSwitch = useCallback(() => {
    toggleSignal()
  }, [toggleSignal])

  return (
    <div className="hero-monitor">
      <div className="monitor-shell" ref={shellRef}>
        <img src={fieldMonitor} alt="" width={900} height={900} fetchPriority="high" />
        <div className="crt-glass">
          <span className="bootline" aria-hidden="true">
            am@cloud:~$ plot <span>{waveform ? 'waveform' : 'terrain'}</span>
          </span>
          <canvas ref={canvasRef} aria-hidden="true"></canvas>
          <span className="phosphor" aria-hidden="true"></span>
        </div>
      </div>
      <button
        className="signal-switch"
        type="button"
        onClick={handleSwitch}
        aria-pressed={waveform}
        aria-label={`Switch signal to ${waveform ? 'terrain' : 'waveform'}`}
      >
        <span aria-hidden="true">⇄</span> Switch signal
      </button>
    </div>
  )
}
