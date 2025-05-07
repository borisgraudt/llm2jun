// src/pages/Community.jsx
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// Sample forum data based on Cisco community forums
const INITIAL_FORUM_DATA = {
  categories: [
    { 
      id: 'networking', 
      name: 'Сетевое оборудование',
      description: 'Обсуждение маршрутизаторов, коммутаторов и другого сетевого оборудования',
      topics: 345,
      posts: 1287
    },
    { 
      id: 'security', 
      name: 'Безопасность',
      description: 'Решения безопасности, файрволы, VPN и соответствующие продукты',
      topics: 189,
      posts: 720 
    },
    { 
      id: 'ucs', 
      name: 'Unified Computing',
      description: 'Unified Computing System (UCS), серверы и вычислительная инфраструктура',
      topics: 112,
      posts: 405
    },
    { 
      id: 'aci', 
      name: 'ACI и центры обработки данных',
      description: 'Application Centric Infrastructure и технологии центров обработки данных',
      topics: 98,
      posts: 376
    },
    { 
      id: 'wireless', 
      name: 'Беспроводные технологии',
      description: 'Беспроводные контроллеры, точки доступа и мобильные решения',
      topics: 156,
      posts: 612
    },
  ],
  threads: [
    {
      id: 1,
      categoryId: 'networking',
      title: 'Cisco 2960X зависает при обновлении',
      author: 'Алексей П.',
      date: '2025-02-15T14:32:00',
      views: 347,
      replies: 12,
      content: `У меня возникла проблема с коммутатором Cisco 2960X. При попытке обновления прошивки устройство зависает и не отвечает на команды. Пробовал различные версии прошивки, но результат одинаковый. Подскажите, как решить эту проблему?`,
      tags: ['коммутаторы', 'обновление', '2960X', 'зависание'],
      solved: true,
      likes: 8,
      comments: [
        {
          id: 101,
          author: 'Максим В.',
          date: '2025-02-15T15:10:00',
          content: 'Попробуйте сначала сделать сброс настроек и очистить загрузочную флеш-память.',
          likes: 2
        },
        {
          id: 102,
          author: 'Сергей О.',
          date: '2025-02-15T16:05:00',
          content: 'У нас была похожая проблема. Причина оказалась в недостаточном объеме памяти. Проверьте свободное место перед обновлением.',
          likes: 5
        },
        {
          id: 103,
          author: 'Артем К.',
          date: '2025-02-16T09:22:00',
          content: 'Судя по описанию, это может быть известный баг в определенных версиях прошивки. Проверьте в документации Cisco список совместимости и известные проблемы.',
          likes: 7
        }
      ]
    },
    {
      id: 2,
      categoryId: 'aci',
      title: 'Показатель Health Score в Cisco ACI не меняется',
      author: 'Ирина С.',
      date: '2025-03-01T10:15:00',
      views: 215,
      replies: 7,
      content: `После обновления инфраструктуры ACI до версии 5.2(3), показатель Health Score перестал обновляться и остается постоянным на уровне 100, несмотря на возникающие проблемы. Логи системы не показывают ошибок. Кто-нибудь сталкивался с подобной проблемой?`,
      tags: ['ACI', 'мониторинг', 'health score', 'обновление'],
      solved: false,
      likes: 5,
      comments: [
        {
          id: 201,
          author: 'Дмитрий Н.',
          date: '2025-03-01T11:40:00',
          content: 'Проверьте настройки мониторинга и статистики. Возможно, сбросились настройки сбора данных после обновления.',
          likes: 3
        },
        {
          id: 202,
          author: 'Михаил Г.',
          date: '2025-03-01T14:22:00',
          content: 'В новых версиях ACI изменились некоторые метрики. Попробуйте перенастроить политики сбора данных.',
          likes: 1
        }
      ]
    },
    {
      id: 3,
      categoryId: 'security',
      title: 'Firepower 4110 не открывается веб-интерфейс управления',
      author: 'Владимир Д.',
      date: '2025-03-10T09:27:00',
      views: 432,
      replies: 15,
      content: `После перезагрузки Firepower 4110 не могу получить доступ к веб-интерфейсу управления. SSH работает нормально, но при попытке подключения по HTTPS браузер выдает ошибку подключения. Что может быть причиной и как это исправить?`,
      tags: ['firepower', '4110', 'веб-интерфейс', 'HTTPS'],
      solved: true,
      likes: 12,
      comments: [
        {
          id: 301,
          author: 'Елена В.',
          date: '2025-03-10T10:05:00',
          content: 'Проверьте настройки TLS и сертификатов. Возможно, истек срок действия сертификата после перезагрузки.',
          likes: 8
        },
        {
          id: 302,
          author: 'Андрей П.',
          date: '2025-03-10T11:30:00',
          content: 'Попробуйте сбросить настройки управления через SSH командой: "configure manager local"',
          likes: 6
        },
        {
          id: 303,
          author: 'Максим К.',
          date: '2025-03-10T14:15:00',
          content: 'Проверьте, что служба HTTPS запущена и указаны правильные порты. Иногда после обновлений сбрасываются настройки доступа.',
          likes: 10
        }
      ]
    },
    {
      id: 4,
      categoryId: 'wireless',
      title: 'Cisco AIR-AP1852i не подключается к контроллеру WLC',
      author: 'Наталья Р.',
      date: '2025-02-28T16:40:00',
      views: 187,
      replies: 8,
      content: `Установили новые точки доступа Cisco AIR-AP1852i, но они не подключаются к контроллеру WLC. В логах видно, что точки получают IP-адреса, но не проходят авторизацию. Контроллер - Cisco 5508. Есть идеи, как решить проблему?`,
      tags: ['беспроводные сети', 'AP1852i', 'WLC', 'авторизация'],
      solved: false,
      likes: 4,
      comments: [
        {
          id: 401,
          author: 'Сергей К.',
          date: '2025-02-28T17:15:00',
          content: 'Проверьте версии прошивок. Точки 1852i требуют определенной минимальной версии на контроллере 5508.',
          likes: 2
        },
        {
          id: 402,
          author: 'Александр М.',
          date: '2025-02-28T18:30:00',
          content: 'Проблема может быть в настройках безопасности. Проверьте настройки авторизации AP на контроллере и наличие сертификатов.',
          likes: 3
        }
      ]
    },
    {
      id: 5,
      categoryId: 'ucs',
      title: 'Проблема с загрузкой голосовой почты CUE на UC520',
      author: 'Денис Л.',
      date: '2025-03-05T11:20:00',
      views: 156,
      replies: 6,
      content: `После сбоя питания система голосовой почты CUE на маршрутизаторе UC520 не загружается. Система выдает ошибку при инициализации модуля. Пытался сбросить настройки, но это не помогло. Как можно восстановить работу голосовой почты?`,
      tags: ['UC520', 'CUE', 'голосовая почта', 'сбой'],
      solved: true,
      likes: 7,
      comments: [
        {
          id: 501,
          author: 'Олег В.',
          date: '2025-03-05T12:45:00',
          content: 'Возможно, повреждена файловая система. Попробуйте выполнить команду "show tech-support"',
          likes: 1
        },
        {
          id: 502,
          author: 'Евгений С.',
          date: '2025-03-05T14:30:00',
          content: 'В таких случаях часто помогает переинициализация модуля CUE. Используйте команду "service-module service-engine 1/0 reload"',
          likes: 5
        },
        {
          id: 503,
          author: 'Алексей М.',
          date: '2025-03-06T09:15:00',
          content: 'Если не помогает переинициализация, то возможно повреждение образа. Попробуйте восстановить через TFTP.',
          likes: 6
        }
      ]
    }
  ]
};

export default function Community() {
  const [viewMode, setViewMode] = useState('categories'); // categories, threads, thread
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [forumData, setForumData] = useState(INITIAL_FORUM_DATA);
  const [newComment, setNewComment] = useState('');
  const [newThread, setNewThread] = useState({ title: '', content: '', tags: '' });
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);

  // Format date to relative time (e.g. "2 hours ago")
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setViewMode('threads');
  };

  // Handle thread selection
  const handleThreadClick = (threadId) => {
    const thread = forumData.threads.find(t => t.id === threadId);
    setActiveThread(thread);
    setViewMode('thread');
  };

  // Handle back button
  const handleBack = () => {
    if (viewMode === 'thread') {
      setViewMode('threads');
      setActiveThread(null);
    } else if (viewMode === 'threads') {
      setViewMode('categories');
      setActiveCategory(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  // Handle like/dislike thread
  const handleLikeThread = (threadId) => {
    setForumData(prevData => {
      const updatedThreads = prevData.threads.map(thread => {
        if (thread.id === threadId) {
          return { ...thread, likes: thread.likes + 1 };
        }
        return thread;
      });
      return { ...prevData, threads: updatedThreads };
    });
  };

  // Handle like/dislike comment
  const handleLikeComment = (threadId, commentId) => {
    setForumData(prevData => {
      const updatedThreads = prevData.threads.map(thread => {
        if (thread.id === threadId) {
          const updatedComments = thread.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, likes: comment.likes + 1 };
            }
            return comment;
          });
          return { ...thread, comments: updatedComments };
        }
        return thread;
      });
      return { ...prevData, threads: updatedThreads };
    });
  };

  // Handle new comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      author: 'Вы',
      date: new Date().toISOString(),
      content: newComment,
      likes: 0
    };

    setForumData(prevData => {
      const updatedThreads = prevData.threads.map(thread => {
        if (thread.id === activeThread.id) {
          return {
            ...thread,
            comments: [...thread.comments, newCommentObj],
            replies: thread.replies + 1
          };
        }
        return thread;
      });
      return { ...prevData, threads: updatedThreads };
    });

    setActiveThread(prev => ({
      ...prev,
      comments: [...prev.comments, newCommentObj],
      replies: prev.replies + 1
    }));
    
    setNewComment('');
  };

  // Handle new thread form change
  const handleNewThreadChange = (e) => {
    const { name, value } = e.target;
    setNewThread(prev => ({ ...prev, [name]: value }));
  };

  // Handle new thread submission
  const handleNewThreadSubmit = (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) return;

    const tagsArray = newThread.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const newThreadObj = {
      id: Date.now(),
      categoryId: activeCategory,
      title: newThread.title,
      author: 'Вы',
      date: new Date().toISOString(),
      views: 0,
      replies: 0,
      content: newThread.content,
      tags: tagsArray,
      solved: false,
      likes: 0,
      comments: []
    };

    setForumData(prevData => ({
      ...prevData,
      threads: [newThreadObj, ...prevData.threads]
    }));

    // Reset form and close modal
    setNewThread({ title: '', content: '', tags: '' });
    setShowNewThreadModal(false);
    
    // Navigate to the new thread
    setActiveThread(newThreadObj);
    setViewMode('thread');
  };

  // Get filtered threads based on active category
  const filteredThreads = activeCategory
    ? forumData.threads.filter(thread => thread.categoryId === activeCategory)
    : forumData.threads;

  return (
    <div className="bg-white min-h-screen">
      {/* Community Header */}
      <div className="bg-gray-100 border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Сообщество Техподдержки</h1>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по форуму..."
                  className="px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-gray-500 w-full md:w-64"
                />
                <button type="submit" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-r">
                  Поиск
                </button>
              </div>
            </form>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm mt-4">
            <button
              onClick={() => {
                setViewMode('categories');
                setActiveCategory(null);
                setActiveThread(null);
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Форум
            </button>
            
            {activeCategory && (
              <>
                <span className="mx-2 text-gray-400">/</span>
                <button
                  onClick={() => {
                    setViewMode('threads');
                    setActiveThread(null);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {forumData.categories.find(c => c.id === activeCategory)?.name}
                </button>
              </>
            )}
            
            {activeThread && (
              <>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-800 truncate max-w-xs">{activeThread.title}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Show back button if not on categories view */}
        {viewMode !== 'categories' && (
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Назад
          </button>
        )}
        
        {/* Categories View */}
        {viewMode === 'categories' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Категории</h2>
            
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {forumData.categories.map(category => (
                  <li key={category.id} className="block hover:bg-gray-50">
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className="px-4 py-4 sm:px-6 w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex">
                            <p className="truncate text-lg font-medium text-gray-800">{category.name}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="flex flex-col items-end text-sm text-gray-500">
                          <p>{category.topics} тем</p>
                          <p>{category.posts} сообщений</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Threads View */}
        {viewMode === 'threads' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {forumData.categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <button
                onClick={() => setShowNewThreadModal(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Новая тема
              </button>
            </div>
            
            {filteredThreads.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded">
                <p className="text-gray-600">Нет тем в этой категории</p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredThreads.map(thread => (
                    <li key={thread.id} className="block hover:bg-gray-50">
                      <button
                        onClick={() => handleThreadClick(thread.id)}
                        className="px-4 py-4 sm:px-6 w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="truncate max-w-lg">
                            <div className="flex items-center">
                              <p className="truncate text-lg font-medium text-gray-800">{thread.title}</p>
                              {thread.solved && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  Решено
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600 truncate">{thread.content}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {thread.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end text-sm text-gray-500">
                            <p className="mb-1">{thread.author}</p>
                            <p className="mb-1">{formatDate(thread.date)}</p>
                            <div className="flex items-center mt-1">
                              <span className="mr-4">👁️ {thread.views}</span>
                              <span className="mr-4">💬 {thread.replies}</span>
                              <span>👍 {thread.likes}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Thread Detail View */}
        {viewMode === 'thread' && activeThread && (
          <div className="space-y-6">
            {/* Thread header */}
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{activeThread.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-4">{activeThread.author}</span>
                    <span>{formatDate(activeThread.date)}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleLikeThread(activeThread.id)}
                    className="inline-flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {activeThread.likes}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 prose max-w-none text-gray-700">
                <p>{activeThread.content}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-1">
                {activeThread.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Thread comments */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Ответы ({activeThread.comments.length})</h3>
              
              {activeThread.comments.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded">
                  <p className="text-gray-600">Нет ответов. Будьте первым!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeThread.comments.map(comment => (
                    <div key={comment.id} className="bg-white p-4 rounded shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium mr-4">{comment.author}</span>
                          <span>{formatDate(comment.date)}</span>
                        </div>
                        <button
                          onClick={() => handleLikeComment(activeThread.id, comment.id)}
                          className="inline-flex items-center text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {comment.likes}
                        </button>
                      </div>
                      <div className="mt-2 prose max-w-none text-gray-700">
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* New comment form */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-2">Добавить ответ</h4>
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Введите ваш ответ..."
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    rows="4"
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className={`bg-gray-200 py-2 px-4 rounded ${
                        newComment.trim() ? 'hover:bg-gray-300 text-gray-800' : 'opacity-50 cursor-not-allowed text-gray-500'
                      }`}
                    >
                      Отправить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* New Thread Modal */}
        {showNewThreadModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowNewThreadModal(false)}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              {/* Modal */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <form onSubmit={handleNewThreadSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Заголовок
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={newThread.title}
                        onChange={handleNewThreadChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder="Введите заголовок темы"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Сообщение
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows="4"
                        value={newThread.content}
                        onChange={handleNewThreadChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder="Опишите вашу проблему или вопрос"
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Теги (через запятую)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        id="tags"
                        value={newThread.tags}
                        onChange={handleNewThreadChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder="например: cisco, маршрутизатор, настройка"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-800 hover:bg-gray-300 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Создать
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewThreadModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
