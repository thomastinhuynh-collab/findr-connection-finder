import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Build trigger: rebuild to inject env vars
createRoot(document.getElementById("root")!).render(<App />);
