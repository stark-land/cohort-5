import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "./providers.tsx";
import { GitHubCorner } from "./components/GitHubCorner";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <GitHubCorner />
    <App />
  </Providers>,
);
