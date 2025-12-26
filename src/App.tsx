import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Game } from './pages/Game'
import { Admin } from './pages/Admin'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
