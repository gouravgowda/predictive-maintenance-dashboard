import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [err,  setErr]    = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // feel like auth

    // 🔴 HACKATHON DAY: Replace this with real auth if they provide it
    if (user === 'admin' && pass === 'admin123') {
      localStorage.setItem('pm_auth', '1')
      navigate('/dashboard')
    } else {
      setErr('ACCESS DENIED — use admin / admin123')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Corner accents */}
      {['top:0;left:0', 'top:0;right:0', 'bottom:0;left:0', 'bottom:0;right:0'].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', [pos.split(';')[0].split(':')[0]]: 24,
          [pos.split(';')[1].split(':')[0]]: 24,
          width: 40, height: 40,
          borderTop: i < 2 ? '1px solid rgba(0,212,255,0.3)' : 'none',
          borderBottom: i >= 2 ? '1px solid rgba(0,212,255,0.3)' : 'none',
          borderLeft: i % 2 === 0 ? '1px solid rgba(0,212,255,0.3)' : 'none',
          borderRight: i % 2 === 1 ? '1px solid rgba(0,212,255,0.3)' : 'none',
        }} />
      ))}

      <div style={{ width: 400, position: 'relative', animation: 'slide-in 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 4, marginBottom: 12 }}>
            HACK MALENADU 2026
          </div>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800,
            color: 'var(--text)', letterSpacing: 1
          }}>
            PREDICTIVE MAINTENANCE
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, letterSpacing: 2 }}>
            INDUSTRIAL INTELLIGENCE SYSTEM
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: 4,
          padding: '32px 32px',
        }}>
          {/* Status line */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 28, padding: '8px 12px',
            background: 'rgba(0,230,118,0.05)',
            border: '1px solid rgba(0,230,118,0.15)',
            borderRadius: 2,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse-dot 2s ease infinite'
            }} />
            <span style={{ fontSize: 11, color: 'var(--green)', letterSpacing: 1 }}>
              SYSTEM ONLINE — 4 MACHINES MONITORED
            </span>
          </div>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 6 }}>
                OPERATOR ID
              </div>
              <input
                value={user} onChange={e => setUser(e.target.value)}
                placeholder="admin"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 2, color: 'var(--text)', fontSize: 13,
                  outline: 'none', letterSpacing: 1,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 6 }}>
                ACCESS CODE
              </div>
              <input
                type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 2, color: 'var(--text)', fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>

            {err && (
              <div style={{
                color: 'var(--red)', fontSize: 11, letterSpacing: 1,
                marginBottom: 14, padding: '8px 12px',
                background: 'rgba(255,77,77,0.08)',
                border: '1px solid rgba(255,77,77,0.2)',
                borderRadius: 2,
              }}>{err}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? 'transparent' : 'var(--accent)',
              border: `1px solid ${loading ? 'var(--accent)' : 'var(--accent)'}`,
              borderRadius: 2, color: loading ? 'var(--accent)' : '#000',
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              transition: 'all 0.2s',
            }}>
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
          DEFAULT: admin / admin123
        </div>
      </div>
    </div>
  )
}