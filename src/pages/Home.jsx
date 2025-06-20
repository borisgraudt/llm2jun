// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Community from './Community'; // Import the Community component
import { itsmApi } from '../services/itsmApi';
import { v4 as uuidv4 } from 'uuid';

// Добавить функцию для вызова FastAPI
async function fetchAiResponse(message) {
  try {
    const response = await fetch('http://localhost:8000/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      return '[Ошибка AI сервера]';
    }
    const data = await response.json();
    return data.reply || '[Нет ответа от AI]';
  } catch (e) {
    return '[Ошибка соединения с AI сервером]';
  }
}

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [expertMode, setExpertMode] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showExpertDisclaimer, setShowExpertDisclaimer] = useState(false);
  const [expertDisclaimerShown, setExpertDisclaimerShown] = useState(false);
  const [showDisclaimerInChat, setShowDisclaimerInChat] = useState(false);
  const [disclaimerMessageId, setDisclaimerMessageId] = useState(null);
  const [disclaimerButtonsVisible, setDisclaimerButtonsVisible] = useState(true);
  const [waitingForUserQuestion, setWaitingForUserQuestion] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(null); // id чата, для которого открыто меню
  
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
  const messagesContainerRef = useRef(null);
  const lastUserMessageRef = useRef(null); // Новый ref для последнего сообщения пользователя

  // Определяю currentChat сразу после хуков useState
  const currentChat = chats.find(chat => chat.id === activeChat) || chats[0];

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
    const lastMsg = currentChat.messages[currentChat.messages.length - 1];
    if (lastMsg && lastMsg.role === 'user' && lastUserMessageRef.current) {
      lastUserMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat.messages.length]);

  // Use effect for expert mode
  useEffect(() => {
    if (expertMode) {
      // Добавляем дисклеймер в конец сообщений при каждом включении expertMode
      const id = Date.now();
      setChats(chats => chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                role: 'disclaimer',
                id,
                content: 'Все вопросы будут отправлены инженеру. Инженеру потребуется время на ознакомление. Инженер направит ответ в течение 15 минут.',
                date: new Date(),
              },
            ],
          };
        }
        return chat;
      }));
      setDisclaimerMessageId(id);
      setShowDisclaimerInChat(true);
      setExpertDisclaimerShown(true);
      setDisclaimerButtonsVisible(true);
    }
  }, [expertMode, activeChat]);

  const logout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

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
    setChats(prevChats => {
      const updated = [newChat, ...prevChats];
      setActiveChat(newChatId); // Выделяем новый чат после обновления
      return updated;
    });
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
                date: new Date(),
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
              date: new Date(),
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
          messages: [...chat.messages, { role: 'user', content: message, date: new Date() }],
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
                { role: 'user', content: message, date: new Date() },
                { role: 'system', content: 'Сообщение отправлено эксперту. Ожидайте ответа.', date: new Date() },
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
      // AI режим: получаем ответ от FastAPI
      const aiReply = await fetchAiResponse(message);
      setChats(chats => chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { role: 'system', content: aiReply, date: new Date() },
            ],
          };
        }
        return chat;
      }));
    }

    if (waitingForUserQuestion) {
      setTimeout(() => {
        setChats(chats => chats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  role: 'engineer',
                  content: 'Здравствуйте, я отвечу вам в течение 15 минут.',
                  date: new Date(),
                },
              ],
            };
          }
          return chat;
        }));
        setWaitingForUserQuestion(false);
      }, 600);
      return;
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
                  date: new Date(),
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

  // Функции для кнопок дисклеймера:
  const handleDisclaimerAction = (action) => {
    setDisclaimerButtonsVisible(false);
    if (action === 'history') {
      setChats(chats => chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                role: 'engineer',
                content: 'Здравствуйте, я сейчас ознакомлюсь с историей чата и отвечу вам.',
                date: new Date(),
              },
            ],
          };
        }
        return chat;
      }));
    } else if (action === 'question') {
      setChats(chats => chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                role: 'system',
                content: 'Какой вопрос вы хотите задать?',
                date: new Date(),
              },
            ],
          };
        }
        return chat;
      }));
      setWaitingForUserQuestion(true);
    }
  };

  // Функция для удаления чата
  const handleDeleteChat = (chatId) => {
    setChats(chats => chats.filter(chat => chat.id !== chatId));
    if (activeChat === chatId && chats.length > 1) {
      // Переключаемся на первый оставшийся чат
      const nextChat = chats.find(chat => chat.id !== chatId);
      setActiveChat(nextChat.id);
    }
    if (activeChat === chatId && chats.length === 1) {
      setActiveChat(null);
    }
    setChatMenuOpen(null);
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
            style={{ backgroundColor: 'rgb(93, 143, 194)', color: 'white' }}
            className="w-full flex items-center justify-center py-2 px-3 border border-gray-300 rounded-md transition-colors hover:brightness-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Новый чат
          </button>
          <div className="flex justify-center mt-2 space-x-2">
            <button className="text-gray-500 text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 w-full">
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Поиск
              </span>
            </button>
          </div>
        </div>
        <div className="px-3 pt-8 pb-1">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Чаты</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto sidebar-chats px-2 py-3">
          <div className="flex flex-col">
            {chats.length === 0 ? (
              <div className="text-gray-400 text-center mt-8 select-none text-sm">Нет чатов</div>
            ) : (
              chats.map(chat => {
                const isActive = activeChat === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (!isActive) {
                        setActiveChat(chat.id);
                        if (window.innerWidth < 768) {
                          setShowMobileSidebar(false);
                        }
                      }
                    }}
                    className={`chat-item flex items-center px-4 py-2 rounded-xl transition-all duration-150 relative group select-none ${isActive ? 'bg-gray-300' : 'hover:bg-gray-100 cursor-pointer'}`}
                    style={{ minHeight: '44px' }}
                  >
                    <span className="text-sm truncate flex-1 text-gray-900">{chat.title}</span>
                    {/* Троеточие — без подложки, справа, только при наведении */}
                    <button
                      className={`ml-2 transition-opacity duration-150 ${chatMenuOpen === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={e => {
                        e.stopPropagation();
                        setChatMenuOpen(chatMenuOpen === chat.id ? null : chat.id);
                      }}
                      tabIndex={-1}
                      style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none', padding: 0, minWidth: 0, display: 'flex', alignItems: 'center', height: '32px' }}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>
                    {/* Выпадающее меню */}
                    {chatMenuOpen === chat.id && (
                      <div
                        className="absolute right-2 top-12 z-30 bg-white rounded-xl border border-gray-200 animate-fade-in"
                        style={{ minWidth: '130px' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors gap-2 rounded-lg text-base justify-center"
                          onClick={() => handleDeleteChat(chat.id)}
                        >
                          {/* Красный крестик (outline) */}
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeLinecap="round"/>
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeLinecap="round"/>
                          </svg>
                          <span>Удалить</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
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
            chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full w-full text-center select-none">
                <div className="text-2xl text-gray-400 mb-4">Нет чатов</div>
                <button
                  onClick={createNewChat}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
                >
                  Новый чат
                </button>
              </div>
            ) : (
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
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1 overflow-y-auto p-4 space-y-4 mb-2 chat-messages-container flex flex-col"
                          ref={messagesContainerRef}
                        >
                          {currentChat.messages.map((msg, index) => {
                            const date = msg.date ? new Date(msg.date) : null;
                            const timeStr = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                            const isUser = msg.role === 'user';
                            const isSystem = msg.role === 'system';
                            const isEngineer = msg.role === 'engineer';
                            const isShort = msg.content && msg.content.length <= 20;
                            const timeColor = isUser ? 'rgb(239, 248, 253)' : isSystem ? 'rgb(155, 155, 155)' : isEngineer ? 'rgb(255, 255, 255)' : undefined;
                            const isDisclaimer = msg.role === 'disclaimer';
                            const isLastUserMsg = isUser && index === currentChat.messages.length - 1;
                            return (
                              <div 
                                key={index}
                                ref={isLastUserMsg ? lastUserMessageRef : null}
                                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`max-w-xs sm:max-w-md p-3 rounded-lg chat-message ` +
                                    (isUser
                                      ? 'message-user-bubble'
                                      : isSystem
                                        ? 'message-system-bubble'
                                        : isEngineer
                                          ? 'message-engineer-bubble'
                                          : isDisclaimer
                                            ? 'message-disclaimer-bubble'
                                            : '')
                                  }
                                  style={
                                    isUser ? undefined : isSystem ? undefined : isEngineer ? undefined : isDisclaimer ? undefined : {}
                                  }
                                >
                                  {isDisclaimer ? (
                                    <>
                                      <div style={{ marginBottom: disclaimerButtonsVisible ? 18 : 0 }}>{msg.content}</div>
                                      {disclaimerButtonsVisible && (
                                        <div className="disclaimer-buttons">
                                          <button type="button" onClick={() => handleDisclaimerAction('history')}>Отправить историю чата</button>
                                          <button type="button" onClick={() => handleDisclaimerAction('question')}>Задать вопрос</button>
                                        </div>
                                      )}
                                      {msg.date && (
                                        <div style={{ fontSize: '0.82em', opacity: 0.6, marginTop: 8, textAlign: 'center', color: '#888' }}>
                                          {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                      )}
                                    </>
                                  ) : isEngineer ? (
                                    <>
                                      <div>{msg.content}</div>
                                      {msg.date && (
                                        <div style={{ fontSize: '0.82em', opacity: 0.6, marginTop: 8, textAlign: 'right', color: '#888' }}>
                                          {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    isShort ? (
                                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                        <span style={{ flex: '1 1 auto', wordBreak: 'break-word' }}>{msg.content}</span>
                                        {timeStr && (
                                          <span style={{ fontSize: '0.85em', opacity: 0.7, marginLeft: 8, whiteSpace: 'nowrap', alignSelf: 'flex-end', color: timeColor }}>{timeStr}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ flex: '1 1 auto', wordBreak: 'break-word', width: '100%' }}>{msg.content}</span>
                                        {timeStr && (
                                          <span style={{ fontSize: '0.85em', opacity: 0.7, marginTop: 8, alignSelf: 'flex-end', textAlign: 'right', color: timeColor }}>{timeStr}</span>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
            )
          ) : (
            // Community Tab Content
            <div className="overflow-auto h-full">
              <Community />
            </div>
          )}
        </div>
      </div>

      {showExpertDisclaimer && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
            padding: '2.5rem 2rem',
            maxWidth: 400,
            textAlign: 'center',
            fontSize: '1.15rem',
            fontWeight: 500,
            color: '#222',
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 16 }}>⚠️</div>
            <div style={{ marginBottom: 24 }}>
              Все вопросы будут отправлены инженеру.<br/>
              Инженеру потребуется время на ознакомление.<br/>
              Инженер направит ответ в течение 15 минут.
            </div>
            <button
              onClick={() => setShowExpertDisclaimer(false)}
              style={{
                background: 'rgb(93, 143, 194)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >Понятно</button>
          </div>
        </div>
      )}
    </div>
  );
}
