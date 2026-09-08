import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import { applyTheme, getTheme } from "./theme.js";
import "./index.css";

const urlTheme = new URLSearchParams(window.location.search).get("theme");
applyTheme(urlTheme === "light" || urlTheme === "dark" ? urlTheme : getTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
