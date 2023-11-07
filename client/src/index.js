import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
// Context
import UserContextProvider from './context/UserContext';
import ToggleContextProvider from './context/ToggleContext';
// Styles
import './styles/index.css';
import './styles/backgrounds.css';
import './styles/components.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
      <UserContextProvider>
        <ToggleContextProvider>
          <App />
        </ToggleContextProvider>
      </UserContextProvider>
    </BrowserRouter>
);