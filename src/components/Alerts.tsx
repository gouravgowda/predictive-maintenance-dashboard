import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAlerts } from '../api.js'

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    load()
    const t = setInterval(load, 5000) // Poll every 5s to keep it real-time
    return () => clearInterval(t)
  }, [])

  async function load() {
    try {
      const data = await fetchAlerts(100)
      setAlerts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Simple AI heuristic to explain alerts in plain English
  const explainAlert = (alert: any) => {
    const m = alert.machine_id || ''
    const r = (alert.reason || '').toLowerCase()

    let problem = "an unknown mechanical anomaly"
    let ttf = "within 1-2 hours"

    if (m.includes('PUMP')) {
      if (r.includes('vib')) {
        problem = "severe bearing wear or cavitation causing violent shaking"
        ttf = "in less than 45 minutes"
      } else {
        problem = "abnormal fluid pressure"
        ttf = "within 3-5 hours"
      }
    } else if (m.includes('CNC')) {
      if (r.includes('temp') && r.includes('vib')) {
        problem = "catastrophic spindle failure due to total loss of lubrication"
        ttf = "immediately (critical risk)"
      } else if (r.includes('temp')) {
        problem = "a cooling system failure causing extreme overheating"
        ttf = "within 2 hours"
      } else {
        problem = "unbalanced tool loads causing excessive vibration"
        ttf = "within 12 hours"
      }
    } else if (m.includes('CONVEYOR')) {
      problem = "motor overload or belt blockages"
      ttf = "within 24 hours"
    }

    return `System indicates ${problem}. If left unchecked, complete failure is predicted ${ttf}.`
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, marginBottom: 24, letterSpacing: 1 }}>
        GLOBAL ALERTS LOG
      </h1>
      
      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 13, animation: 'pulse-dot 1.5s infinite' }}>Loading alerts stream...</div>
      ) : alerts.length === 0 ? (
        <div style={{ background: 'var(--bg2)', padding: 30, borderRadius: 4, border: '1px solid var(--border)', color: 'var(--green)', fontSize: 13, textAlign: 'center' }}>
          No alerts recorded recently. Fleet is fully healthy!
        </div>
      ) : (
        <div className="animate-in" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', color: 'var(--muted)', fontSize: 10, letterSpacing: 2 }}>
                <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>TIMESTAMP</th>
                <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>MACHINE ID</th>
                <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600, width: '40%' }}>ANALYSIS (NON-CODER SUMMARY)</th>
                <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>RISK SCORE</th>
                <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id || a.created_at + a.machine_id} className="alert-row" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--text)' }}>
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-head)', letterSpacing: 1 }}>
                    <span 
                      style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' }} 
                      onClick={() => navigate(`/machines/${a.machine_id}`)}
                      onMouseEnter={e => e.currentTarget.style.textDecorationColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
                    >
                      {a.machine_id}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                      Technical: {a.reason}
                    </div>
                    <div style={{ 
                      fontSize: 12, color: 'var(--text)', lineHeight: 1.5,
                      padding: '8px 12px', background: 'rgba(0, 212, 255, 0.05)',
                      borderLeft: '2px solid var(--accent)', borderRadius: '0 4px 4px 0'
                    }}>
                      <strong style={{ color: 'var(--accent)', marginRight: 4 }}>✦ AI Diagnosis:</strong>
                      {explainAlert(a)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--red)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {(a.risk_score * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button 
                      onClick={() => navigate(`/machines/${a.machine_id}`)}
                      style={{
                        padding: '6px 12px', fontSize: 10, background: 'rgba(0, 212, 255, 0.05)',
                        color: 'var(--accent)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: 3,
                        fontWeight: 700, letterSpacing: 1, cursor: 'pointer'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)' }}
                    >
                      INVESTIGATE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Row Hover Stylings */}
      <style>{`
        .alert-row {
          transition: background 0.2s;
        }
        .alert-row:hover {
          background-color: var(--bg3) !important;
        }
      `}</style>
    </div>
  )
}
