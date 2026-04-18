import { useState, useRef, useEffect } from 'react'
import { fetchLatestReadings, fetchAlerts, rootCause } from '../api.js'
import { MACHINES } from '../supabase.js'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am the **JNANIK Predictive Maintenance Agent**. I continuously monitor your sensor streams and alert logs. How can I assist you today?" },
    { role: 'user', text: "Can you analyze PUMP_03 for me?" },
    { role: 'ai', text: "**Deep Dive: PUMP_03**\n\nCurrent Status: **WARNING**\n- Temperature: 92.1°C\n- Vibration: 4.85 mm/s\n\n**AI Diagnosis:** Predicted root cause is *Vibration anomaly*. Over the last 24 hours, there have been 2 recorded alerts for this machine. The drift rate indicates accelerating wear. Recommended action is to schedule a preventative maintenance window within 48 hours." },
    { role: 'user', text: "Is the rest of the fleet healthy?" },
    { role: 'ai', text: "Analyzing fleet parameters...\n\nAll other machines (**CNC_01, CNC_02, CONVEYOR_04**) are currently operating within their normal Z-score baselines. Secondary systems are nominal." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const analyzeFleet = async () => {
    const [readings, alerts] = await Promise.all([fetchLatestReadings(), fetchAlerts(5)])
    const faults = readings.filter(r => r.status === 'fault')
    const warnings = readings.filter(r => r.status === 'warning')
    
    let analysis = `**Fleet Analysis Complete:**\n\n`
    if (faults.length === 0 && warnings.length === 0) {
      analysis += `All ${readings.length} machines are currently operating within normal parameters. No immediate maintenance is required.`
    } else {
      if (faults.length > 0) {
        analysis += `⚠️ **CRITICAL:** ${faults.length} machine(s) are in a fault state (${faults.map(f => f.machine_id).join(', ')}). Immediate shutdown and inspection is recommended.\n\n`
      }
      if (warnings.length > 0) {
        analysis += `⚠️ **WARNING:** ${warnings.length} machine(s) show elevated risk (${warnings.map(w => w.machine_id).join(', ')}).\n\n`
      }
    }
    
    if (alerts.length > 0) {
      analysis += `*Recent Log Context:* The most recent alert was on ${alerts[0].machine_id} for "${alerts[0].reason}".`
    }

    return analysis
  }

  const analyzeMachine = async (machineId: string) => {
    const [readings, alerts] = await Promise.all([fetchLatestReadings(), fetchAlerts(20)])
    const r = readings.find(r => r.machine_id === machineId)
    if (!r) return `I cannot find active stream data for ${machineId}.`

    const mAlerts = alerts.filter(a => a.machine_id === machineId)
    const cause = rootCause(r)
    
    return `**Deep Dive: ${machineId}**\n\nCurrent Status: **${r.status.toUpperCase()}**\n- Temperature: ${Number(r.temperature_c).toFixed(1)}°C\n- Vibration: ${Number(r.vibration_mm_s).toFixed(2)} mm/s\n- Current: ${Number(r.current_a).toFixed(1)} A\n\n**AI Diagnosis:** Predicted root cause is *${cause}*. Over the last 24 hours, there have been ${mAlerts.length} recorded alerts for this machine. Recommended action is to schedule a preventative maintenance window.`
  }

  const getSimulatedResponse = async (query: string) => {
    const q = query.toLowerCase()
    
    if (q.includes('fleet') || q.includes('all') || q.includes('health')) {
      return await analyzeFleet()
    }
    
    for (const m of MACHINES) {
      if (q.includes(m.toLowerCase())) {
        return await analyzeMachine(m)
      }
    }

    return "I am specialized in analyzing sensor telemetry. Try asking me for a 'Fleet Health Report' or to 'Analyze PUMP_03'."
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return
    
    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate network delay and "thinking" time
    setTimeout(async () => {
      const responseText = await getSimulatedResponse(text)
      setMessages(prev => [...prev, { role: 'ai', text: responseText }])
      setLoading(false)
    }, 1500)
  }

  // Helper to format bold text as actual <strong> tags in a simple way
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--accent)' }}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
          JNANIK AI AGENT
        </h1>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          Autonomous diagnostic assistant · Connected to real-time streams
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
            }}>
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, flexShrink: 0, borderRadius: 4,
                background: m.role === 'user' ? 'var(--border2)' : 'rgba(0, 212, 255, 0.1)',
                border: m.role === 'user' ? 'none' : '1px solid rgba(0, 212, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: m.role === 'user' ? 'var(--text)' : 'var(--accent)'
              }}>
                {m.role === 'user' ? '👤' : '✦'}
              </div>

              {/* Message Bubble */}
              <div style={{
                background: m.role === 'user' ? 'var(--bg3)' : 'transparent',
                border: m.role === 'user' ? '1px solid var(--border)' : 'none',
                padding: m.role === 'user' ? '12px 16px' : '6px 0',
                borderRadius: 6,
                color: 'var(--text)',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                maxWidth: '85%'
              }}>
                {formatText(m.text)}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 4,
                background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
              }}>✦</div>
              <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.4s infinite ease-in-out both' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '0 28px', maxWidth: 800, margin: '0 auto', width: '100%', display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {["Analyze Fleet Health", "Deep Dive: PUMP_03", "Deep Dive: CNC_02"].map(chip => (
          <button key={chip} 
            onClick={() => handleSend(chip)}
            disabled={loading}
            style={{
              padding: '6px 12px', background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 20, fontSize: 11, color: 'var(--muted)', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)' } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)' } }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ padding: '0 28px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex', background: 'var(--bg3)', borderRadius: 6,
          border: '1px solid var(--border)', padding: '6px'
        }}>
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask about machine status, anomalies, or fleet health..."
            disabled={loading}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text)',
              padding: '10px 14px', outline: 'none', fontSize: 13
            }}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg2)',
              color: input.trim() && !loading ? '#000' : 'var(--muted)',
              border: 'none', borderRadius: 4, padding: '0 20px',
              fontWeight: 700, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  )
}
