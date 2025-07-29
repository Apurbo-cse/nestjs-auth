import { useState } from 'react'
import './index.css'
import ChatPage from './pages/ChatPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatPage />
    </>
  )
}

export default App
