// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Community from './Community';
import { telegramApi } from '../services/telegramApi';
import { v4 as uuidv4 } from 'uuid';
import { websocketService } from '../services/websocketService';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [expertMode, setExpertMode] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Chat history management
  const [chats, setChats] = useState([
    {
      id: uuidv4(),
      title: 'Новый чат',
      messages: [],
      expertAssigned: false,
      expertName: null,
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
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: 'Новый запрос',
      messages: [],
      expertAssigned: false,
      expertName: null,
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

    // If expert mode is already assigned, do nothing or potentially handle deactivation later
    if (chat.expertAssigned) {
      console.log(`Expert already assigned to chat ${chatId}`);
      return;
    }

    try {
      // Find the last user message to send as the initial message to the expert
      const lastUserMessage = chat.messages.filter(msg => msg.role === 'user').pop();

      // Send chat history to expert via Telegram
      await telegramApi.sendMessageToExpert(chatId, lastUserMessage?.content || '', chat.messages);

      // Update chat state: set expertAssigned to true and add system message
      setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            expertAssigned: true,
            messages: [...c.messages, {
              role: 'system',
              content: 'Ваш запрос был направлен эксперту. Ожидайте ответа.',
              timestamp: new Date().toISOString(),
            }],
          };
        }
        return c;
      }));

    } catch (error) {
      console.error('Error sending chat to expert:', error);
      // Add error message to chat
      setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, {
              role: 'system',
              content: 'Произошла ошибка при отправке запроса эксперту. Пожалуйста, попробуйте позже.',
              timestamp: new Date().toISOString(),
            }],
          };
        }
        return c;
      }));
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat) return;

    // Optimistically add user message to current chat
    const newUserMessage = {
      id: uuidv4(), // Add a unique ID for the message
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      sender: 'Вы'
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, newUserMessage],
          title: chat.messages.length === 0 && message.length > 0 ? (message.length > 25 ? message.substring(0, 25) + '...' : message) : chat.title,
        };
      }
      return chat;
    }));

    setMessage('');

    if (expertMode && currentChat.expertAssigned) {
      console.log('Expert mode is active and expert is assigned.');
      console.log('Calling telegramApi.sendNewMessageToExpert with chatId:', currentChat.id, 'and message:', newUserMessage.content);
      try {
        // Send message to expert via Telegram
        await telegramApi.sendNewMessageToExpert(currentChat.id, newUserMessage.content);

        // Add system message about expert notification (optional, can be removed if not needed after successful send)
        // Keeping it for now for user feedback
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [
                ...chat.messages.filter(msg => msg.id !== newUserMessage.id), // Remove the optimistically added message
                newUserMessage, // Add it back to ensure order
                { 
                  role: 'system', 
                  content: 'Сообщение отправлено эксперту. Ожидайте ответа.',
                  timestamp: new Date().toISOString()
                },
              ],
            };
          }
          return chat;
        }));

      } catch (error) {
        console.error('Error sending message to expert:', error);
        // Handle error: maybe show an error message to the user
      }
    } else {
      // Regular AI response for non-expert mode
      setTimeout(() => {
        const responseText = expertMode
          ? 'Ваш запрос был направлен специалисту. Ожидайте ответа.' // This text might need adjustment as it's now handled by expert response via WS
          : 'Это симуляция ответа от системы.';
        
        const chatsWithResponse = chats.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [
                ...chat.messages, 
                // The user message was already added optimistically, no need to add again
                { 
                  role: 'assistant', 
                  content: responseText,
                  timestamp: new Date().toISOString(),
                  sender: expertMode ? 'Эксперт' : 'Ассистент'
                }
              ],
            };
          }
          return chat;
        });
        setChats(chatsWithResponse);
      }, 1500);
    }
  };

  useEffect(() => {
    // Connect to WebSocket when expert mode is activated
    if (currentChat?.expertAssigned) {
      websocketService.connect(currentChat.id);
      
      // Add message handler
      const handleExpertMessage = (message) => {
        if (message.role === 'expert') {
          setChats(prevChats => {
            const updatedChats = [...prevChats];
            const chatIndex = updatedChats.findIndex(c => c.id === currentChat.id);
            
            if (chatIndex !== -1) {
              updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                messages: [...updatedChats[chatIndex].messages, message]
              };
            }
            
            return updatedChats;
          });
        }
      };
      
      websocketService.addMessageHandler(handleExpertMessage);
      
      // Cleanup
      return () => {
        websocketService.removeMessageHandler(handleExpertMessage);
        websocketService.disconnect();
      };
    }
  }, [currentChat?.expertAssigned, currentChat?.id]);

  return (
    <div className="home-container opacity-0 transition-opacity duration-1000 flex h-screen overflow-hidden bg-white text-gray-800">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div 
          className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} md:w-64 transition-all duration-300 ease-in-out bg-gray-100 h-full flex flex-col`}>
        {/* Sidebar content */}
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Новый чат
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-4 cursor-pointer hover:bg-gray-200 transition-colors ${
                activeChat === chat.id ? 'bg-gray-200' : ''
              }`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-sm text-gray-500 truncate">
                {chat.messages[chat.messages.length - 1]?.content || 'Нет сообщений'}
              </div>
            </div>
          ))}
        </div>

        {/* Logout button */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-2"
              onClick={() => setShowMobileSidebar(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">{currentChat.title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={expertMode}
                onChange={() => handleExpertModeToggle(activeChat)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span>Экспертный режим</span>
            </label>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentChat.messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              {msg.role !== 'system' && (
                <div className="text-sm text-gray-500 mb-1">
                  {msg.sender || (msg.role === 'user' ? 'Вы' : 'Ассистент')}
                </div>
              )}
              <div className={`inline-block p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : msg.role === 'system'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
