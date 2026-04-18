import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login      from './components/login'
import Layout     from './components/Layout'
import Dashboard  from './components/Dashboard'
import Machines   from './components/Machines'
import MachineDetail from './components/MachineDetail'
import AlertsPage from './components/Alerts'
import AIAssistant from './components/AIAssistant'

const auth = () => localStorage.getItem('pm_auth') === '1'

function Guard({ children }) {
  return auth() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="machines"     element={<Machines />} />
          <Route path="machines/:id" element={<MachineDetail />} />
          <Route path="alerts"       element={<AlertsPage />} />
          <Route path="ai"           element={<AIAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}