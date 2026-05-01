import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Build trigger: rebuild to inject env vars
createRoot(document.getElementById("root")!).render(<App />);
