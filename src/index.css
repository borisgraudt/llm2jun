/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
body {
  @apply bg-white text-gray-800 font-sans;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse {
  animation: pulse 2s infinite;
}

/* Form elements */
input, textarea {
  @apply bg-white text-gray-800 rounded-md p-2 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300;
}

button {
  @apply bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-4 rounded transition-colors duration-200;
}

.button-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800;
}

/* Message styles */
.message {
  @apply max-w-md p-3 rounded-lg mb-2;
}

.message-user {
  @apply bg-gray-300 text-gray-800 rounded-br-none ml-auto;
}

.message-ai {
  @apply bg-gray-100 text-gray-800 rounded-bl-none;
}

/* Tab styles */
.tab-active {
  @apply text-gray-600 border-b-2 border-gray-400;
}

.tab-inactive {
  @apply text-gray-500 hover:text-gray-600 transition;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* Typing indicator animation */
.typing-indicator span {
  @apply inline-block bg-gray-400 rounded-full w-2 h-2;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

/* AI/Expert toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #555;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* ChatGPT-style layout with improved responsiveness */
.home-container {
  display: flex;
  height: 100vh;
  min-height: 500px;
  overflow: hidden;
}

/* Make the chat container responsive */
.chat-messages-container {
  flex: 1;
  min-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  scroll-behavior: smooth;
}

/* Empty state container with responsive sizing */
.empty-state-container {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Make sidebar responsive */
.sidebar-chats {
  height: calc(100vh - 130px);
  min-height: 150px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* Sidebar styling */
.sidebar-chats::-webkit-scrollbar {
  width: 4px;
}

.sidebar-chats::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-chats::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}

/* For Firefox */
.sidebar-chats {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

/* Chat item styling */
.chat-item {
  transition: background-color 0.2s ease;
}

.chat-item:hover {
  background-color: #f3f4f6;
}

.chat-item.active {
  background-color: #e5e7eb;
}

/* Make sure the input doesn't disappear */
.chat-input-wrapper {
  padding: 0.5rem 1rem;
  background-color: white;
  position: relative;
  z-index: 10;
}

/* Add overflow protection to chat messages */
.chat-message {
  word-break: break-word;
  max-width: 100%;
}

/* Main content area */
.main-content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

/* Ensure content is centered in all views */
.max-w-3xl {
  margin-left: auto;
  margin-right: auto;
}

/* AI/Expert toggle in search bar row */
.search-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

/* Styling for the toggle container in the controls bar */
.toggle-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

/* Responsive fixes for small screens */
@media (max-height: 600px) {
  .sidebar-chats {
    height: calc(100vh - 110px);
  }
  
  .chat-messages-container {
    padding: 0.5rem;
  }
  
  .chat-input-wrapper {
    padding: 0.25rem 0.5rem;
  }
  
  .empty-state-container h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}

/* Small mobile screens */
@media (max-width: 640px) {
  .chat-messages-container {
    padding: 0.5rem;
  }
  
  .empty-state-container {
    padding: 1rem 0.5rem;
  }
  
  .chat-input-wrapper {
    padding: 0.5rem;
  }
  
  /* Make search and toggle stack on very small screens */
  .search-toggle-row {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}

/* Fix specific layout issues */
@media (min-width: 768px) and (max-height: 800px) {
  .sidebar-chats {
    height: calc(100vh - 120px);
  }
  
  .chat-messages-container {
    min-height: 150px;
  }
}

/* Ensure interface is visible on very small screens */
@media (max-height: 500px) {
  .empty-state-container h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .chat-input-wrapper, .border-t {
    padding: 0.25rem;
  }
  
  .sidebar-chats {
    max-height: 30vh;
  }
}

/* Ensure mobile layout works */
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
  }
  
  .sidebar-chats {
    max-height: 40vh;
  }
}

/* Fix for Firefox scrolling */
@-moz-document url-prefix() {
  .chat-messages-container, .sidebar-chats {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db transparent;
  }
}

/* Minimum dimensions for all containers */
.home-container > * {
  min-height: 0;
  min-width: 0;
}

/* Force scrollbars when needed */
.overflow-auto {
  overflow: auto !important;
}

/* Ensure header and footer don't collapse */
header, .chat-input-wrapper, .border-t {
  flex-shrink: 0;
}

/* Fix heights for flex items */
.flex-1 {
  flex: 1 1 0%;
  min-height: 0;
}

/* New chat animation */
@keyframes fadeInChat {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.new-chat-animation {
  animation: fadeInChat 0.3s ease-in-out forwards;
}
