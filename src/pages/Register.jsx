import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const regContainer = document.querySelector('.register-container');
    if (regContainer) {
      regContainer.classList.add('fade-in');
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Ошибка регистрации');
        setLoading(false);
        return;
      }
      // успех: сразу авторизуем и редиректим на home
      localStorage.setItem('auth', 'true');
      navigate('/home');
    } catch (e) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="register-container opacity-0 transition-opacity duration-1000 p-8 bg-gray-100 rounded-lg shadow-lg space-y-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 mb-4">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <p className="text-center text-gray-600 italic mb-6">Техподдержка будущего, сегодня.</p>
          <h2 className="text-2xl font-bold text-center text-gray-800">Регистрация</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="group">
            <input
              type="email"
              className="w-full p-3 bg-white border border-gray-300 rounded-md transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-black"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="group">
            <input
              type="password"
              className="w-full p-3 bg-white border border-gray-300 rounded-md transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-black"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <div className="group">
            <input
              type="password"
              className="w-full p-3 bg-white border border-gray-300 rounded-md transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 text-black"
              placeholder="Повторите пароль"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm -mt-2">{error}</div>}
          <button
            type="submit"
            className={`w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-md transition-colors duration-300 flex items-center justify-center${(!email || !password || !confirm || loading) ? ' cursor-not-allowed' : ''}`}
            disabled={!email || !password || !confirm || loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>
        <div className="text-center text-gray-500 text-sm mt-2">
          Уже есть аккаунт?{' '}
          <Link to="/" className="text-blue-600 hover:underline">Войти</Link>
        </div>
      </div>
    </div>
  );
} 