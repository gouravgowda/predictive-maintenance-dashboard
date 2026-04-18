import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import GlobalSyncer from './GlobalSyncer'
import { fetchAlerts } from '../api.js'

const NAV = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/machines',  icon: '⚙', label: 'Machines'  },
  { to: '/alerts',    icon: '⚠', label: 'Alerts'    },
  { to: '/ai',        icon: '✦', label: 'AI Assistant' },
]

export default function Layout() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [theme, setTheme] = useState(localStorage.getItem('pm_theme') || 'dark')
  
  // Notification State
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Apply Theme
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light')
    } else {
      document.body.classList.remove('light')
    }
    localStorage.setItem('pm_theme', theme)
  }, [theme])

  // Poll Alerts for Notification Bell
  useEffect(() => {
    const checkAlerts = async () => {
      const data = await fetchAlerts(5)
      setRecentAlerts(data)
    }
    checkAlerts()
    const t = setInterval(checkAlerts, 5000)
    return () => clearInterval(t)
  }, [])

  const criticalCount = recentAlerts.filter(a => a.risk_score >= 0.7).length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 210, flexShrink: 0,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: 3, marginBottom: 4 }}>
            HACK MALENADU
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>
            PM AGENT
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>

        {/* Live indicator */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--green)', animation: 'pulse-dot 1.5s ease infinite'
            }} />
            <span style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 2 }}>LIVE</span>
            <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>4 machines</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 3, marginBottom: 2,
              background:   isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              color:        isActive ? 'var(--accent)' : 'var(--text)',
              borderLeft:   isActive ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              letterSpacing: 1, transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{n.icon}</span>
              {n.label.toUpperCase()}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Logo */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            fontSize: 10, color: 'var(--muted)', letterSpacing: 1, padding: '0 4px'
          }}>
            JNANIK AI · POWERED
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOP BAR */}
        <header style={{
          height: 60, flexShrink: 0,
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', gap: 24
        }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              style={{
                background: 'transparent', border: 'none', color: 'var(--muted)',
                fontSize: 18, position: 'relative', transition: 'color 0.2s'
             }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              🔔
              {criticalCount > 0 && (
                <div style={{
                  position: 'absolute', top: -2, right: -4,
                  width: 10, height: 10, borderRadius: '50%', background: 'var(--red)',
                  border: '2px solid var(--bg2)'
                }} />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div style={{
                position: 'absolute', top: 40, right: -10, width: 320,
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                  Critical Alerts ({criticalCount})
                </div>
                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                  {recentAlerts.length === 0 ? (
                     <div style={{ padding: 16, color: 'var(--muted)', textAlign: 'center' }}>No recent alerts.</div>
                  ) : recentAlerts.map((a, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                         <span style={{ color: a.risk_score >= 0.7 ? 'var(--red)' : 'var(--yellow)', fontWeight: 'bold' }}>{a.machine_id}</span>
                         <span style={{ color: 'var(--muted)', fontSize: 10 }}>
                           {new Date(a.created_at).toLocaleTimeString()}
                         </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text)' }}>
                         {a.reason}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: 8, textAlign: 'center', background: 'var(--bg2)', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                   <Link to="/alerts" onClick={() => setShowNotifs(false)} style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 'bold' }}>VIEW ALL ALERTS</Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Theme"
            style={{
              background: 'transparent', border: 'none', color: 'var(--muted)',
              fontSize: 18, transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* (Settings icon removed) */}

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          {/* Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
               width: 32, height: 32, borderRadius: '50%', background: 'var(--border2)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
            }}>
              👨‍💼
            </div>
            <span style={{ fontWeight: 'bold', fontSize: 14 }}>admin</span>
            <button 
              onClick={() => { localStorage.removeItem('pm_auth'); navigate('/login') }} 
              title="Logout"
              style={{
                background: 'transparent', border: 'none', color: 'var(--muted)',
                fontSize: 18, marginLeft: 8, transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              🚪
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <GlobalSyncer />
          <Outlet />
        </div>
      </main>
    </div>
  )
}