import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './i18n'; // Initialize and import i18next instance
import { I18nextProvider } from 'react-i18next';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <Suspense fallback={<div>Loading...</div>}>
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </Suspense>
    </React.StrictMode>
);