import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import axios from "axios";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";
import { API_BASE_URL } from "./config/api.js";

axios.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("http://localhost:5000")) {
    config.url = config.url.replace("http://localhost:5000", API_BASE_URL);
  }
  return config;
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </BrowserRouter>
);
