import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import "./index.css";
import App from "./App.tsx";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./redux/store.ts";
import { QueryProvider } from "./api/providers/QueryProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BrowserRouter>
          <StoreProvider store={store}>
            <App />
          </StoreProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>,
);
