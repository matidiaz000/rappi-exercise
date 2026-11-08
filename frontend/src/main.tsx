import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "./styles/index.css";
import { App } from "./app/App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el elemento root.");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
