import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Animation effect when component mounts
  useEffect(() => {
    const loginContainer = document.querySelector('.login-container')
    if (loginContainer) {
      loginContainer.classList.add('fade-in')
    }
  }, [])

  const handleLogin = () => {
    if (username === 'admin' && password === 'networks123') {
      setIsLoading(true)
      // Simulate loading
      setTimeout(() => {
        localStorage.setItem('auth', 'true')
        navigate('/home')
      }, 1000)
    } else {
      alert('Неверный логин или пароль') // Invalid login in Russian
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
              type="text" 
              placeholder="Имя пользователя" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          
          <div className="group">
            <input 
              className="w-full p-3 bg-white border border-gray-300 rounded-md transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-black" 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            onClick={handleLogin} 
            disabled={isLoading}
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
