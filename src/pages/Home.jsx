// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat')
  const [expertMode, setExpertMode] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Привет! Я AI ассистент. Чем я могу вам помочь сегодня?' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Check authentication
  useEffect(() => {
    if (localStorage.getItem('auth') !== 'true') {
      navigate('/')
    }
  }, [navigate])

  // Animation effect when component mounts
  useEffect(() => {
    const homeContainer = document.querySelector('.home-container')
    if (homeContainer) {
      homeContainer.classList.add('fade-in')
    }
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const logout = () => {
    localStorage.removeItem('auth')
    navigate('/')
  }

  // Simulate sending message and getting a response
  const sendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const updatedMessages = [
      ...messages, 
      { role: 'user', content: message }
    ]
    setMessages(updatedMessages)
    setMessage('')
    
    // Simulate response
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      
      if (expertMode) {
        response = 'Ваше сообщение отправлено эксперту. Ожидайте ответа в ближайшее время.'
      } else {
        response = 'Это симуляция ответа от AI. Для настоящего ответа требуется интеграция API.'
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="home-container opacity-0 transition-opacity duration-1000 bg-white text-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-xl font-semibold">AI Ассистент</h1>
        </div>
        <button 
          onClick={logout} 
          className="text-gray-600 hover:text-gray-800"
        >
          Выйти
        </button>
      </header>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 justify-center">
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`px-6 py-3 font-medium transition-colors duration-200 ${
            activeTab === 'chat' 
              ? 'text-gray-900 border-b-2 border-gray-700' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Чат
        </button>
        <button 
          onClick={() => setActiveTab('community')} 
          className={`px-6 py-3 font-medium transition-colors duration-200 ${
            activeTab === 'community' 
              ? 'text-gray-900 border-b-2 border-gray-700' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Сообщество
        </button>
      </div>

      {/* Content - Centered with max-width */}
      <div className="flex-1 overflow-hidden flex justify-center">
        <div className="w-full max-w-3xl flex flex-col">
          {activeTab === 'chat' ? (
            <div className="flex flex-col h-full">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs sm:max-w-md p-3 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-gray-300 text-gray-800 rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* AI/Expert Toggle */}
              <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-center">
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${!expertMode ? 'font-medium' : ''}`}>AI</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={expertMode}
                      onChange={() => setExpertMode(!expertMode)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                  <span className={`text-sm ${expertMode ? 'font-medium' : ''}`}>Эксперт</span>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-2 focus:outline-none text-gray-800"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className={`px-4 bg-gray-800 text-white transition-colors ${
                      message.trim() ? 'hover:bg-gray-900' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Сообщество</h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-center text-gray-600">Форум сообщества находится в разработке.</p>
                <p className="text-center text-gray-600 mt-2">Здесь будут отображаться вопросы и ответы от других пользователей.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
