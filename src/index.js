import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider }         from "./context/AuthContext";
import { SocketProvider }       from "./context/SocketContext";
import { CartProvider }         from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
//import ErrorBoundary            from "./components/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <ErrorBoundary> */}
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
   { /*</ErrorBoundary> */}
  </React.StrictMode>
);