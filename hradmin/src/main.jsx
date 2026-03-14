import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';    // browser reset — must be first
import './global.css';   // shared styles for all pages
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);