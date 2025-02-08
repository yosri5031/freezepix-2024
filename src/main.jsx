import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { I18nextProvider } from 'react-i18next';
import { LanguageProvider } from './contexts/LanguageContext';
import i18n from './contexts/LanguageContext'; // Import the i18n instance
import MetaUpdater from './components/metaupdater';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <MetaUpdater />
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>
);