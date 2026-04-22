import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { LoginProvider } from "./context/LoginContext.jsx";
import { DoctorProvider } from "./context/DoctorContext.jsx";
import { AppointmentProvider } from "./context/AppointmentContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <LoginProvider>
        <DoctorProvider>
          <AppointmentProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppointmentProvider>
        </DoctorProvider>
      </LoginProvider>
    </Provider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </React.StrictMode>
);
