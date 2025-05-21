// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";  // <-- only named import
import App from "./App";
import { AuthProvider } from "./AuthContext";
import "./index.css";


const container = document.getElementById("root"); // grab your root div
const root = createRoot(container);               // create the React root

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
