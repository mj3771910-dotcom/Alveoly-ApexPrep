import { StrictMode } from "react";
import { createRoot } from "react-dom/client"; // ✅ FIX
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx"; // ✅ MISSING BEFORE
import "./index.css"; // ✅ optional but recommended

const root = document.getElementById("root");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);