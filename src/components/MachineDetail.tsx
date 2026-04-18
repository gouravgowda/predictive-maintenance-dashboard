import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { fetchHistory, fetchAlerts, computeRisk, computeBaselines, riskColor, statusColor } from '../api.js'
import { MACHINE_META, COLS, THRESH } from '../supabase.js'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 3, padding: '8px 12px' }}>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize: 11, color: p.color }}>
          {p.name}: {Number(p.value).toFixed(2)}
        </div>
      ))}
    </div>
  )
}

export default function MachineDetail() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const [history,   setHistory]   = useState([])
  const [alerts,    setAlerts]    = useState([])
  const [baselines, setBaselines] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const meta = MACHINE_META[id] || {}

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [id])

  async function load() {
    const [h, a] = await Promise.all([fetchHistory(id, 120), fetchAlerts(100)])
    setHistory(h)
    setAlerts(a.filter(x => x.machine_id === id))
    setBaselines(computeBaselines(h))
  }

  const latest  = history[history.length - 1] || {}
  const risk    = computeRisk(latest, baselines)
  const color   = riskColor(risk)
  const status  = latest[COLS.status] || 'unknown'

  const chartData = history.map((r, i) => ({
    i,
    vib:  parseFloat((r[COLS.vibration]   || 0).toFixed(3)),
    temp: parseFloat((r[COLS.temperature] || 0).toFixed(1)),
    curr: parseFloat((r[COLS.current]     || 0).toFixed(2)),
    rpm:  Math.round(r[COLS.rpm] || 0),
    time: (r[COLS.timestamp] || '').slice(11, 16),
  }))

  const SENSORS = [
    { key: 'vib',  label: 'Vibration',   unit: 'mm/s', thresh: THRESH.vibration,   color: '#00d4ff', value: latest[COLS.vibration] },
    { key: 'temp', label: 'Temperature', unit: '°C',   thresh: THRESH.temperature, color: '#ff6b6b', value: latest[COLS.temperature] },
    { key: 'curr', label: 'Current',     unit: 'A',    thresh: THRESH.current,     color: '#f5a623', value: latest[COLS.current] },
    { key: 'rpm',  label: 'RPM',         unit: 'rpm',  thresh: 1600,               color: '#00e676', value: latest[COLS.rpm] },
  ]

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={() => navigate('/machines')} style={{
          padding: '7px 14px', background: 'transparent',
          border: '1px solid var(--border2)', borderRadius: 3,
          color: 'var(--muted)', fontSize: 11, letterSpacing: 1,
        }}>← BACK</button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{id}</span>
            <span style={{
              padding: '3px 12px', borderRadius: 2, fontSize: 10, fontWeight: 700, letterSpacing: 2,
              background: statusColor(status) + '22', color: statusColor(status),
              border: `1px solid ${statusColor(status)}44`,
            }}>{status.toUpperCase()}</span>
            <span style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'var(--font-head)' }}>
              {Math.round(risk * 100)}% RISK
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {meta.label} · Criticality {((meta.criticality || 0.7) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Sensor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {SENSORS.map(s => {
          const over = (s.value || 0) > s.thresh
          return (
            <div key={s.key} style={{
              background: 'var(--bg2)',
              border: `1px solid ${over ? s.color + '66' : 'var(--border)'}`,
              borderTop: `2px solid ${over ? s.color : 'var(--border2)'}`,
              borderRadius: 4, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: over ? s.color : 'var(--text)', lineHeight: 1 }}>
                {s.value != null ? Number(s.value).toFixed(s.key === 'rpm' ? 0 : 2) : '—'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                {s.unit} · thresh {s.thresh}
              </div>
              {over && (
                <div style={{ fontSize: 9, color: s.color, marginTop: 6, letterSpacing: 1 }}>
                  ⚠ ABOVE THRESHOLD
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['overview', 'history', 'alerts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 18px', borderRadius: 3, fontSize: 10,
            fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
            background: activeTab === tab ? 'rgba(0,212,255,0.1)' : 'transparent',
            border: `1px solid ${activeTab === tab ? 'var(--accent)' : 'var(--border2)'}`,
            color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
          }}>{tab.toUpperCase()}</button>
        ))}
      </div>

      {/* Tab: Overview charts */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: 'VIBRATION TREND', key: 'vib', color: '#00d4ff', thresh: THRESH.vibration, unit: 'mm/s' },
            { title: 'TEMPERATURE TREND', key: 'temp', color: '#ff6b6b', thresh: THRESH.temperature, unit: '°C' },
          ].map(chart => (
            <div key={chart.key} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '18px 20px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 14 }}>
                {chart.title}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: 'var(--muted)', fontSize: 9 }} interval={20} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={chart.thresh} stroke="var(--red)" strokeDasharray="4 2"
                    label={{ value: 'THRESH', fill: 'var(--red)', fontSize: 8, position: 'insideTopRight' }} />
                  <Line type="monotone" dataKey={chart.key} stroke={chart.color}
                    dot={false} strokeWidth={1.5} name={chart.title.split(' ')[0]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Full history table */}
      {activeTab === 'history' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 14 }}>
            SENSOR HISTORY — LAST {history.length} READINGS
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['TIMESTAMP', 'VIBRATION', 'TEMPERATURE', 'CURRENT', 'RPM', 'STATUS'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().slice(0, 50).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--muted)' }}>{(r[COLS.timestamp] || '').slice(0, 19)}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12, color: (r[COLS.vibration] || 0) > THRESH.vibration ? 'var(--red)' : 'var(--text)' }}>{Number(r[COLS.vibration] || 0).toFixed(3)}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12, color: (r[COLS.temperature] || 0) > THRESH.temperature ? 'var(--red)' : 'var(--text)' }}>{Number(r[COLS.temperature] || 0).toFixed(1)}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12 }}>{Number(r[COLS.current] || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12 }}>{Math.round(r[COLS.rpm] || 0)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 10, color: statusColor(r[COLS.status]), letterSpacing: 1 }}>
                        {(r[COLS.status] || '').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Alerts */}
      {activeTab === 'alerts' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 14 }}>
            ALERT HISTORY — {alerts.length} ALERTS
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 11 }}>No alerts for this machine</div>
          ) : alerts.map((a, i) => (
            <div key={i} style={{
              padding: '12px 14px', background: 'var(--bg3)', borderRadius: 3,
              borderLeft: '2px solid var(--red)', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 12 }}>{a.reason}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Risk: {Math.round((a.risk_score || 0) * 100)}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}