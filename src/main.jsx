import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Form from './components/ChatBot/Form/Form'
import FormLogin from './components/User/Form/FormLogin'
import List from './components/ChatBot/Form/List'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Form />
  </StrictMode>,
)
