import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Animation effect when component mounts
  useEffect(() => {
    const loginContainer = document.querySelector('.login-container')
    if (loginContainer) {
      loginContainer.classList.add('fade-in')
    }
  }, [])

  const handleLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || 'Ошибка входа')
        setIsLoading(false)
        return
      }
      localStorage.setItem('auth', 'true')
      navigate('/home')
    } catch (e) {
      setError('Ошибка соединения с сервером')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="login-container opacity-0 transition-opacity duration-1000 p-8 bg-gray-100 rounded-lg shadow-lg space-y-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 mb-4">
            {/* Using the actual logo image */}
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <p className="text-center text-gray-600 italic mb-6">Техподдержка будущего, сегодня.</p>
          <h2 className="text-2xl font-bold text-center text-gray-800">Войти</h2>
        </div>
        <div className="space-y-4">
          <div className="group">
            <input 
              className="w-full p-3 bg-white border border-gray-300 rounded-md transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-black" 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="group">
            <input 
              className="w-full p-3 bg-white border border-gray-300 rounded-md transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-black" 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          {error && <div className="text-red-500 text-sm -mt-2">{error}</div>}
          <button 
            onClick={handleLogin} 
            disabled={isLoading || !email || !password}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-md transition-colors duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Войти'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
