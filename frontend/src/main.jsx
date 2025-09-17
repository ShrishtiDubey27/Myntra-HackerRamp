import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext.jsx";
import WishlistContextProvider from "./context/WishlistContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ShopContextProvider>
        <WishlistContextProvider>
          <App />
        </WishlistContextProvider>
      </ShopContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
