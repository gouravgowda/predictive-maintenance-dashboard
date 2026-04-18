import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchLatestReadings, fetchHistory, computeRisk, computeBaselines, riskColor, statusColor } from '../api.js'
import { MACHINES, MACHINE_META, COLS } from '../supabase.js'

export default function Machines() {
  const [readings,  setReadings]  = useState([])
  const [baselines, setBaselines] = useState({})
  const [filter,    setFilter]    = useState('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [])

  async function load() {
    const r = await fetchLatestReadings()
    setReadings(r)
    const base = {}
    for (const mid of MACHINES) {
      const h = await fetchHistory(mid, 60)
      base[mid] = computeBaselines(h)
    }
    setBaselines(base)
  }

  const withRisk = MACHINES.map(mid => {
    const row  = readings.find(r => r[COLS.machine_id] === mid) || {}
    const risk = computeRisk(row, baselines[mid])
    return { mid, row, risk }
  })

  const filtered = withRisk.filter(({ risk, row }) => {
    if (filter === 'CRITICAL') return risk >= 0.7
    if (filter === 'WARNING')  return risk >= 0.3 && risk < 0.7
    if (filter === 'NORMAL')   return risk < 0.3
    return true
  })

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: 3, marginBottom: 4 }}>MACHINE REGISTRY</div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800 }}>ALL UNITS</h1>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Click a card to view full sensor detail</p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', 'CRITICAL', 'WARNING', 'NORMAL'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 2, fontSize: 10, fontWeight: 700,
            letterSpacing: 2, cursor: 'pointer',
            background: filter === f ? 'var(--accent)' : 'transparent',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border2)'}`,
            color: filter === f ? '#000' : 'var(--muted)',
          }}>{f}</button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filtered.map(({ mid, row, risk }) => {
          const color  = riskColor(risk)
          const status = row[COLS.status] || 'unknown'
          const meta   = MACHINE_META[mid] || {}

          return (
            <div key={mid} onClick={() => navigate(`/dashboard`)}
              style={{
                background: 'var(--bg2)',
                border: `1px solid ${color}44`,
                borderRadius: 4, padding: '16px 20px',
                cursor: 'pointer', transition: 'all 0.2s',
                animation: 'slide-in 0.35s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + 'aa'; e.currentTarget.style.background = 'var(--bg3)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = color + '44'; e.currentTarget.style.background = 'var(--bg2)' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{mid}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
                    Criticality: {((meta.criticality || 0.7) * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'block', padding: '4px 12px', borderRadius: 2,
                    fontSize: 10, fontWeight: 700, letterSpacing: 2,
                    background: statusColor(status) + '22',
                    color: statusColor(status),
                    border: `1px solid ${statusColor(status)}44`,
                    marginBottom: 6,
                  }}>{status.toUpperCase()}</span>
                </div>
              </div>

              {/* Sensor bars */}
              {[
                { label: 'Vibration',   value: row[COLS.vibration],   unit: 'mm/s', max: 6,   thresh: 3.5 },
                { label: 'Temperature', value: row[COLS.temperature],  unit: '°C',   max: 110, thresh: 88 },
                { label: 'Current',     value: row[COLS.current],      unit: 'A',    max: 20,  thresh: 16 },
              ].map(s => {
                const pct     = Math.min(((s.value || 0) / s.max) * 100, 100)
                const barColor = (s.value || 0) > s.thresh ? color : 'var(--accent)'
                return (
                  <div key={s.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>{s.label.toUpperCase()}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: (s.value || 0) > s.thresh ? color : 'var(--text)' }}>
                        {s.value != null ? Number(s.value).toFixed(2) : '—'} <span style={{ fontSize: 9, color: 'var(--muted)' }}>{s.unit}</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border2)', borderRadius: 2 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginBottom: 2 }}>RISK SCORE</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: 'var(--font-head)', lineHeight: 1 }}>
                    {Math.round(risk * 100)}%
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); navigate('/dashboard') }} style={{
                  padding: '8px 16px', borderRadius: 3, background: 'transparent',
                  border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer',
                  fontSize: 10, letterSpacing: 2, transition: 'all 0.2s'
                }}>DETAILS →</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}