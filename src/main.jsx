import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ModalContextProvider } from "./providers/ModalProvider.jsx";
import { LazyMotionProvider } from "./providers/LazyMotionProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LazyMotionProvider>
      <ModalContextProvider>
        <App />
      </ModalContextProvider>
    </LazyMotionProvider>
  </React.StrictMode>
);