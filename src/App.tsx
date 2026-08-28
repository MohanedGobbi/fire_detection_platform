import { Routes, Route } from 'react-router'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import ReportFire from './pages/ReportFire'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/report" element={<ReportFire />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
