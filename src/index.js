import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import { TicketProvider } from "./Context/TicketContext";
import { ResolutionProvider } from "./Context/ResolutionContext";
import { SearchXProvider } from "./Context/SearchXContext";
import { ChatbotProvider } from "./Context/ChatBotContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <ResolutionProvider>
        <SearchXProvider>
          <ChatbotProvider>
            <TicketProvider>
              <App />
            </TicketProvider>
          </ChatbotProvider>
        </SearchXProvider>
      </ResolutionProvider>
    </Router>
  </React.StrictMode>
);
