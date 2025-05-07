// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Community from './Community'; // Import the Community component

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [expertMode, setExpertMode] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Chat history management
  const [chats, setChats] = useState([
    { id: 'chat1', title: 'Проблема на WS-C9300-24P-A', messages: [] },
    { id: 'chat2', title: 'Настройка VPN на Juniper', messages: [
      { role: 'user', content: 'Как настроить VPN на Juniper SRX?' },
      { role: 'assistant', content: 'Для настройки VPN на Juniper SRX, вам необходимо выполнить следующие шаги...' }
    ]},
    { id: 'chat3', title: 'Обновление прошивки', messages: [
      { role: 'user', content: 'Как обновить прошивку на Cisco Catalyst?' },
      { role: 'assistant', content: 'Для обновления прошивки на Cisco Catalyst вам потребуется...' }
    ]}
  ]);
  
  const [activeChat, setActiveChat] = useState('chat1');
  const messagesEndRef = useRef(null);

  // Check authentication
  useEffect(() => {
    if (localStorage.getItem('auth') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  // Animation effect when component mounts
  useEffect(() => {
    const homeContainer = document.querySelector('.home-container');
    if (homeContainer) {
      homeContainer.classList.add('fade-in');
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChat]);

  const logout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  // Get current chat
  const currentChat = chats.find(chat => chat.id === activeChat) || chats[0];

  // Create new chat
  const createNewChat = () => {
    const newChatId = `chat${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: 'Новый запрос',
      messages: []
    };
    
    setChats([newChat, ...chats]);
    setActiveChat(newChatId);
    setMessage('');

    // Close mobile sidebar after creating new chat
    if (window.innerWidth < 768) {
      setShowMobileSidebar(false);
    }
  };

  // Simulate sending message and getting a response
  const sendMessage = () => {
    if (!message.trim()) return;

    // Add user message to current chat
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, { role: 'user', content: message }]
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
    
    // Update chat title if it's the first message
    if (currentChat.messages.length === 0) {
      const updatedChatsWithTitle = updatedChats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            title: message.length > 25 ? message.substring(0, 25) + '...' : message
          };
        }
        return chat;
      });
      setChats(updatedChatsWithTitle);
    }
    
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const responseText = expertMode
        ? 'Ваш запрос был направлен специалисту по сетевому оборудованию. Ожидайте ответа в течение 15 минут.'
        : 'Это симуляция ответа от системы. Для получения реальной технической поддержки требуется интеграция с базой знаний.';
      
      const chatsWithResponse = chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'user', content: message }, { role: 'assistant', content: responseText }]
          };
        }
        return chat;
      });
      
      setChats(chatsWithResponse);
    }, 1500);
  };

  return (
    <div className="home-container opacity-0 transition-opacity duration-1000 flex h-screen overflow-hidden bg-white text-gray-800">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div 
          className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={() => setShowMobileSidebar(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-0'} 
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        fixed md:relative z-20 h-full transition-all duration-300 ease-in-out
        bg-gray-100 border-r border-gray-200 flex flex-col overflow-hidden
      `}>
        <div className="p-4 border-b border-gray-200 flex items-center shrink-0">
          <div className="w-8 h-8 mr-2">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-xl font-semibold">Техподдержка</h1>
        </div>
        
        <div className="p-3 shrink-0">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center justify-center py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Новый чат
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto sidebar-chats">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => {
                setActiveChat(chat.id);
                if (window.innerWidth < 768) {
                  setShowMobileSidebar(false);
                }
              }}
              className={`p-3 cursor-pointer hover:bg-gray-200 transition-colors border-b border-gray-200 chat-item ${
                activeChat === chat.id ? 'active' : ''
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-sm truncate">{chat.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden main-content-area">
        {/* Header */}
        <header className="bg-gray-100 border-b border-gray-200 p-3 flex justify-between items-center shrink-0">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="md:hidden mr-2 text-gray-600"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Desktop sidebar toggle */}
            <button
              className="hidden md:block mr-2 text-gray-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Tabs */}
            <div className="flex">
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeTab === 'chat' 
                    ? 'text-gray-600 border-b-2 border-gray-400' 
                    : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                Чат
              </button>
              <button 
                onClick={() => setActiveTab('community')} 
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeTab === 'community' 
                    ? 'text-gray-600 border-b-2 border-gray-400' 
                    : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                Сообщество
              </button>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md"
          >
            Выйти
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center overflow-hidden">
                <div className="flex flex-col w-full max-w-3xl h-full">
                  {currentChat.messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center px-4 py-4 md:py-8 overflow-auto empty-state-container">
                      <div className="max-w-2xl w-full">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800">Опишите свою проблему</h2>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Проблема с потерей пакетов на Cisco WS-C9300-24P-A"
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
                        <div className="flex justify-center mt-6">
                          <div className="flex items-center px-4 py-2 space-x-3 border border-gray-300 rounded-md">
                            <span className={`text-sm ${!expertMode ? 'font-medium' : ''} text-gray-600`}>AI</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={expertMode}
                                onChange={() => setExpertMode(!expertMode)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-
