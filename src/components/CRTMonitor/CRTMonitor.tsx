import { useState, useCallback } from 'react'
import { useCRTRenderer } from '../../hooks/useCRTRenderer'
import { useMonitorTilt } from '../../hooks/useMonitorTilt'
import fieldMonitor from '../../assets/field-monitor.webp'

export function CRTMonitor() {
  const { canvasRef, toggleSignal } = useCRTRenderer()
  const shellRef = useMonitorTilt()
  const [waveform, setWaveform] = useState(false)

  const handleSwitch = useCallback(() => {
    const isWaveform = toggleSignal()
    setWaveform(isWaveform)
  }, [toggleSignal])

  return (
    <div className="hero-monitor">
      <div className="monitor-shell" ref={shellRef}>
        <img src={fieldMonitor} alt="" width={900} height={900} fetchPriority="high" />
        <div className="crt-glass">
          <span className="bootline" aria-hidden="true">
            am@peshawar:~$ plot <span>{waveform ? 'waveform' : 'terrain'}</span>
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
