import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Header from './components/Header'
import Carousel from './components/Carousel.jsx'
import Body from './components/Body.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <Carousel/>
    <Body/>
  </StrictMode>
)
