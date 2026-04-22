import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Utils/fetchAuth'; // Inject global auth fetch wrapper
import App from './App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
