import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './components/AppRouter.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>