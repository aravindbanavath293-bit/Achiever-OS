import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#FFFFFF',
                color: '#17243A',
                border: '1px solid #E3E0E7',
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              },
              success: {
                iconTheme: {
                  primary: '#4C9B73',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#D94B50',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
</React.StrictMode>
);
