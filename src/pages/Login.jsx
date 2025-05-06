import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    if (username === 'admin' && password === 'networks123') {
      localStorage.setItem('auth', 'true')
      navigate('/home')
    } else {
      alert('Invalid login')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg space-y-4 w-full max-w-sm">
        <h2 className="text-xl font-bold text-center">Login</h2>
        <input className="w-full p-2 bg-gray-700 rounded" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="w-full p-2 bg-gray-700 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded">Login</button>
      </div>
    </div>
  )
}