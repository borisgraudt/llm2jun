// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Community from './Community'; // Import the Community component
import { itsmApi } from '../services/itsmApi';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [expertMode, setExpertMode] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Chat history management with ITSM integration
  const [chats, setChats] = useState([
    {
      id: uuidv4(),
      title: 'Проблема на WS-C9300-24P-A',
      messages: [],
      itsmIncidentId: null,
      itsmStatus: null,
      expertAssigned: false,
    }
  ]);
  
  const [activeChat, setActiveChat] = useState(chats[0].id);
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

  // Create new chat with unique ID
  const createNewChat = () => {
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: 'Новый запрос',
      messages: [],
      itsmIncidentId: null,
      itsmStatus: null,
      expertAssigned: false,
    };
    
    setChats([newChat, ...chats]);
    setActiveChat(newChatId);
    setMessage('');

    if (window.innerWidth < 768) {
      setShowMobileSidebar(false);
    }
  };

  // Handle expert mode toggle
  const handleExpertModeToggle = async (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    try {
      if (!chat.itsmIncidentId && expertMode) {
        // Create new ITSM incident when switching to expert mode
        const incidentData = {
          title: chat.title,
          description: chat.messages.map(m => `${m.role}: ${m.content}`).join('\n'),
          userId: 'default-user', // Replace with actual user ID when authentication is implemented
        };

        const incident = await itsmApi.createIncident(incidentData);
        
        setChats(chats.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              itsmIncidentId: incident.incidentId,
              itsmStatus: incident.status,
              expertAssigned: true,
            };
          }
          return c;
        }));

        // Add system message about expert assignment
        const updatedChats = chats.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              messages: [...c.messages, {
                role: 'system',
                content: `Ваш запрос был направлен эксперту. Номер инцидента: ${incident.incidentId}`,
              }],
            };
          }
          return c;
        });
        setChats(updatedChats);
      }
    } catch (error) {
      console.error('Error creating ITSM incident:', error);
      // Add error message to chat
      const updatedChats = chats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, {
              role: 'system',
              content: 'Произошла ошибка при создании запроса эксперту. Пожалуйста, попробуйте позже.',
            }],
          };
        }
        return c;
      });
      setChats(updatedChats);
    }
  };

  // Update sendMessage to handle expert mode
  const sendMessage = async () => {
    if (!message.trim()) return;

    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat) return;

    // Add user message to current chat
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, { role: 'user', content: message }],
          title: chat.messages.length === 0 ? (message.length > 25 ? message.substring(0, 25) + '...' : message) : chat.title,
        };
      }
      return chat;
    });
    setChats(updatedChats);
    setMessage('');

    if (expertMode && currentChat.itsmIncidentId) {
      try {
        // Update ITSM incident with new message
        await itsmApi.updateIncident(currentChat.itsmIncidentId, {
          work_notes: message,
        });

        // Add system message about expert notification
        const chatsWithResponse = chats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                { role: 'user', content: message },
                { role: 'system', content: 'Сообщение отправлено эксперту. Ожидайте ответа.' },
              ],
            };
          }
          return chat;
        });
        setChats(chatsWithResponse);
      } catch (error) {
        console.error('Error updating ITSM incident:', error);
        // Handle error
      }
    } else {
      // Regular AI response for non-expert mode
      setTimeout(() => {
        const responseText = expertMode
          ? 'Ваш запрос был направлен специалисту по сетевому оборудованию. Ожидайте ответа в течение 15 минут.'
          : 'Это симуляция ответа от системы. Для получения реальной технической поддержки требуется интеграция с базой знаний.';
        
        const chatsWithResponse = chats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [...chat.messages, { role: 'user', content: message }, { role: 'assistant', content: responseText }],
            };
          }
          return chat;
        });
        setChats(chatsWithResponse);
      }, 1500);
    }
  };

  // Add effect to periodically check ITSM incident status
  useEffect(() => {
    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat || !currentChat.itsmIncidentId) return;

    const checkIncidentStatus = async () => {
      try {
        const status = await itsmApi.getIncidentStatus(currentChat.itsmIncidentId);
        
        if (status.status !== currentChat.itsmStatus) {
          setChats(chats.map(chat => {
            if (chat.id === activeChat) {
              return {
                ...chat,
                itsmStatus: status.status,
                messages: [...chat.messages, {
                  role: 'system',
                  content: `Статус инцидента обновлен: ${status.status}${status.assignedTo ? `. Назначен: ${status.assignedTo}` : ''}`,
                }],
              };
            }
            return chat;
          }));
        }
      } catch (error) {
        console.error('Error checking incident status:', error);
      }
    };

    const intervalId = setInterval(checkIncidentStatus, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [activeChat, chats]);

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
                                onChange={() => {
                                  setExpertMode(!expertMode);
                                  handleExpertModeToggle(activeChat);
                                }}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                            </label>
                            <span className={`text-sm ${expertMode ? 'font-medium' : ''} text-gray-600`}>Эксперт</span>
                          </div>
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
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Messages List - Responsive height with scrolling */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-2 chat-messages-container">
                        {currentChat.messages.map((msg, index) => (
                          <div 
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-xs sm:max-w-md p-3 rounded-lg chat-message ${
                                msg.role === 'user' 
                                  ? 'bg-gray-300 text-gray-800 rounded-br-none' 
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input and AI/Expert toggle */}
                      <div className="w-full px-4 chat-input-wrapper">
                        {/* AI/Expert Toggle */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm ${!expertMode ? 'font-medium' : ''} text-gray-600`}>AI</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={expertMode}
                                onChange={() => {
                                  setExpertMode(!expertMode);
                                  handleExpertModeToggle(activeChat);
                                }}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                            </label>
                            <span className={`text-sm ${expertMode ? 'font-medium' : ''} text-gray-600`}>Эксперт</span>
                          </div>
                          
                          <button className="text-gray-500 text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              Поиск
                            </span>
                          </button>
                        </div>
                        
                        {/* Message input */}
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden mb-4">
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
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Community Tab Content
            <div className="overflow-auto h-full">
              <Community />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
