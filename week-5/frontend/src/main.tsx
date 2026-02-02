import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "./providers.tsx";
import { GitHubCorner } from "./components/GitHubCorner";
import eruda from "eruda";

// Initialize eruda with default settings (only in development)
if (import.meta.env.DEV) {
  eruda.init();
}

createRoot(document.getElementById("root")!).render(
  <Providers>
    <GitHubCorner />
    <App />
  </Providers>,
);
