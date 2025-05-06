// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat')
  const [expertMode, setExpertMode] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
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
      <header className="bg-gray-100 border-b border-gray-200 p-3 flex justify-between items-center">
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
        <div className="flex items-center">
          <button 
            onClick={logout} 
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 justify-center">
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`px-8 py-3 font-medium transition-colors duration-200 ${
            activeTab === 'chat' 
              ? 'text-gray-600 border-b-2 border-gray-400' 
              : 'text-gray-500 hover:text-gray-600'
          }`}
        >
          Чат
        </button>
        <button 
          onClick={() => setActiveTab('community')} 
          className={`px-8 py-3 font-medium transition-colors duration-200 ${
            activeTab === 'community' 
              ? 'text-gray-600 border-b-2 border-gray-400' 
              : 'text-gray-500 hover:text-gray-600'
          }`}
        >
          Сообщество
        </button>
      </div>

      {/* Content - Centered with max-width */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col w-full max-w-3xl">
          {activeTab === 'chat' ? (
            <>
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-3xl font-bold mb-8 text-gray-800">Чем я могу помочь?</h2>
                  <div className="w-full max-w-2xl">
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Спросите что-нибудь..."
                        className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className={`px-4 bg-gray-200 text-black transition-colors ${
                          message.trim() ? 'hover:bg-gray-300' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </div>
                  
                    <div className="flex justify-center mt-4 space-x-2">
                      <button className="text-gray-500 text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Поиск
                        </span>
                      </button>
                      
                      <button className="text-gray-500 text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Глубокое исследование
                        </span>
                      </button>
                      
                      <button className="text-gray-500 text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Создать изображение
                        </span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-center mt-4">
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm ${!expertMode ? 'font-medium' : ''} text-gray-600`}>AI</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={expertMode}
                            onChange={() => setExpertMode(!expertMode)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                        </label>
                        <span className={`text-sm ${expertMode ? 'font-medium' : ''} text-gray-600`}>Эксперт</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6">
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

                  {/* Message Input */}
                  <div className="w-full">
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Введите сообщение..."
                        className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className={`px-4 bg-gray-200 text-black transition-colors ${
                          message.trim() ? 'hover:bg-gray-300' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </div>
                  
                  {/* AI/Expert Toggle */}
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${!expertMode ? 'font-medium' : ''} text-gray-600`}>AI</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={expertMode}
                          onChange={() => setExpertMode(!expertMode)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                      </label>
                      <span className={`text-sm ${expertMode ? 'font-medium' : ''} text-gray-600`}>Эксперт</span>
                    </div>
                  </div>
                </div>
                </>
              )}
            </>
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
