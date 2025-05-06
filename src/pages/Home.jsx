import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('chat')
  const [mode, setMode] = useState('ai')
  const [message, setMessage] = useState('')

  const sendMessage = () => {
    if (mode === 'ai') {
      alert('Sending to AI: ' + message)
    } else {
      alert('Sending to Human: ' + message)
    }
    setMessage('')
  }

  return (
    <div className="text-white bg-gray-900 min-h-screen p-4">
      <div className="flex justify-center gap-4 mb-4">
        <button onClick={() => setTab('chat')} className={tab === 'chat' ? 'font-bold' : ''}>Chat</button>
        <button onClick={() => setTab('community')} className={tab === 'community' ? 'font-bold' : ''}>Community</button>
      </div>

      {tab === 'chat' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>AI</span>
            <input type="checkbox" checked={mode === 'human'} onChange={() => setMode(mode === 'ai' ? 'human' : 'ai')} />
            <span>Human</span>
          </div>
          <div className="flex gap-2">
            <input className="flex-1 bg-gray-700 p-2 rounded" value={message} onChange={e => setMessage(e.target.value)} />
            <button onClick={sendMessage} className="bg-green-500 px-4 rounded">Send</button>
          </div>
        </div>
      )}

      {tab === 'community' && (
        <div>
          <p>Prefilled Cisco-style forum content will appear here.</p>
        </div>
      )}
    </div>
  )
}
