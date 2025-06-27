import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@App";
import { BrowserRouter } from "react-router-dom";
import "@styles/main.scss";
import { AuthProvider } from "@context/AuthContext";
import { ServiceProvider } from "@services/ServiceProvider";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ServiceProvider>
      <AuthProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </AuthProvider>
    </ServiceProvider>
  </BrowserRouter>
);
