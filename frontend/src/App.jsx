import React, { useState } from "react";
import RefreshHandler from "./RefreshHandler";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import MinimalToast from "./components/MinimalToast";
import ChatWidget from "./components/ChatWidget";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} setIsLoading={setIsLoading} />
      <AppRoutes isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} isLoading={isLoading} />
      <ToastContainer />
      <MinimalToast />
      <ChatWidget isAuthenticated={isAuthenticated} />
    </div>
  );
};

export default App;
