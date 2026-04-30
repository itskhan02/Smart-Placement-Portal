import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext'
import { Toaster } from "react-hot-toast";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: "smartplace-toast",
            duration: 3600,
            style: {
              background: "rgba(255, 255, 255, 0.92)",
              color: "#10233f",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "14px 16px",
              borderRadius: "18px",
            },
            success: {
              iconTheme: {
                primary: "#0f9f6e",
                secondary: "#ecfdf5",
              },
            },
            error: {
              iconTheme: {
                primary: "#e11d48",
                secondary: "#fff1f2",
              },
            },
          }}
        />
    </AuthProvider>
  </StrictMode>,
);
