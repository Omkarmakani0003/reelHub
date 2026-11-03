import viteLogo from './assets/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />


      <Route path="/*" element={<NotFound />} />
    </Routes>

  )
}

export default App
