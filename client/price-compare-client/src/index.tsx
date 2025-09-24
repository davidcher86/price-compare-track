import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { NotificationProvider } from './components/Notifications';
import { LoadingSpinnerProvider } from "./components/LoadingSpinner";
import { PopUpProvider } from './components/Modals';
import Home from './Home';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <LoadingSpinnerProvider>
      <PopUpProvider>
        <NotificationProvider>
          <Home />
        </NotificationProvider>
      </PopUpProvider>  
    </LoadingSpinnerProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
