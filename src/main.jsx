import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ModalContextProvider } from "./providers/ModalProvider.jsx";
import { LazyMotionProvider } from "./providers/LazyMotionProvider.jsx";
import { NotificationProvider } from "./providers/NotificationProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LazyMotionProvider>
      <NotificationProvider>
        <ModalContextProvider>
          <App />
        </ModalContextProvider>
      </NotificationProvider>
    </LazyMotionProvider>
  </React.StrictMode>,
);
