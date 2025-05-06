import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat')
  const [apiProvider, setApiProvider] = useState('gpt')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Привет! Я AI ассистент. Чем я могу вам помочь сегодня?' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [apiKey, setApiKey] = useState({
    gpt: localStorage.getItem('gpt-key') || '',
    claude: localStorage.getItem('claude-key') || '',
    grok: localStorage.getItem('grok-key') || ''
  })
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

  const handleApiKeyChange = (provider, key) => {
    setApiKey(prev => ({ ...prev, [provider]: key }))
    localStorage.setItem(`${provider}-key`, key)
  }

  const logout = () => {
    localStorage.removeItem('auth')
    navigate('/')
  }

  // Simulate sending message to AI and getting a response
  const sendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const updatedMessages = [
      ...messages, 
      { role: 'user', content: message }
    ]
    setMessages(updatedMessages)
    setMessage('')
    
    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      let aiResponse = ''
      
      switch(apiProvider) {
        case 'gpt':
          aiResponse = 'Это симуляция ответа от ChatGPT. Для настоящего ответа требуется интеграция API.'
          break
        case 'claude':
          aiResponse = 'Это симуляция ответа от Claude. Для настоящего ответа требуется интеграция API.'
          break
        case 'grok':
          aiResponse = 'Это симуляция ответа от Grok. Для настоящего ответа требуется интеграция API.'
          break
        default:
          aiResponse = 'Пожалуйста, выберите AI провайдера и добавьте API ключ.'
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`px-4 py-2 font-medium transition-colors duration-200 ${
            activeTab === 'chat' 
              ? 'text-gray-900 border-b-2 border-gray-700' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Чат
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`px-4 py-2 font-medium transition-colors duration-200 ${
            activeTab === 'settings' 
              ? 'text-gray-900 border-b-2 border-gray-700' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Настройки API
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex flex-col h-full">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-3 rounded-lg ${
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

            {/* API Provider Selection */}
            <div className="bg-gray-50 p-2 border-t border-gray-200">
              <div className="flex space-x-4 mx-4 mb-2">
                <button 
                  onClick={() => setApiProvider('gpt')} 
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    apiProvider === 'gpt' 
                      ? 'bg-gray-300 text-gray-800 border border-gray-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  ChatGPT
                </button>
                <button 
                  onClick={() => setApiProvider('claude')} 
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    apiProvider === 'claude' 
                      ? 'bg-gray-300 text-gray-800 border border-gray-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  Claude
                </button>
                <button 
                  onClick={() => setApiProvider('grok')} 
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    apiProvider === 'grok' 
                      ? 'bg-gray-300 text-gray-800 border border-gray-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  Grok
                </button>
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
          <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Настройки API</h2>
            
            <div className="space-y-6">
              {/* ChatGPT API Settings */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-3">OpenAI (ChatGPT)</h3>
                <div className="space-y-2">
                  <label className="block text-sm">API Ключ</label>
                  <input
                    type="password"
                    value={apiKey.gpt}
                    onChange={(e) => handleApiKeyChange('gpt', e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    Получите API ключ на <a href="https://platform.openai.com/account/api-keys" className="text-gray-700 hover:underline">OpenAI API</a>
                  </p>
                </div>
              </div>
              
              {/* Claude API Settings */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-3">Anthropic (Claude)</h3>
                <div className="space-y-2">
                  <label className="block text-sm">API Ключ</label>
                  <input
                    type="password"
                    value={apiKey.claude}
                    onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    Получите API ключ на <a href="https://console.anthropic.com/account/keys" className="text-gray-700 hover:underline">Anthropic Console</a>
                  </p>
                </div>
              </div>
              
              {/* Grok API Settings */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-3">xAI (Grok)</h3>
                <div className="space-y-2">
                  <label className="block text-sm">API Ключ</label>
                  <input
                    type="password"
                    value={apiKey.grok}
                    onChange={(e) => handleApiKeyChange('grok', e.target.value)}
                    placeholder="grok-..."
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    API доступ в стадии разработки
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
