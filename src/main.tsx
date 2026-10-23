import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import TokencontextProvider from "./commponents/context/Tokencontext.tsx";
import UserContexProvider from "./commponents/context/UserContex.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TokencontextProvider>
      <QueryClientProvider client={queryClient}>
      <UserContexProvider>
        
       
          <App />
        
      </UserContexProvider>
      </QueryClientProvider>
    </TokencontextProvider>
  </StrictMode>,
);
