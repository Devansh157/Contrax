import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Hide preloader when video finishes playing or fallback timeout
const preloader = document.getElementById('preloader')
if (preloader) {
  const video = document.getElementById('preloader-video')
  const hidePreloader = () => preloader.classList.add('hide')

  if (video) {
    video.addEventListener('ended', hidePreloader)
    video.play().catch(() => {})
    // Fallback timeout in case video loading is delayed or blocked
    setTimeout(hidePreloader, 15000)
  } else {
    setTimeout(hidePreloader, 5000)
  }
}

