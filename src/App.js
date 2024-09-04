import React, { useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navtab from "./Components/Navtab";
import LandingPage from "./Components/LandingPage";
import AccessDenied from "./Components/ErrorScreens/AccessDenied";
import ErrorPage from "./Components/ErrorScreens/ErrorPage";
import OAuthError from "./Components/ErrorScreens/OAuthError";
import SolvedTicketError from "./Components/ErrorScreens/SolvedTicketError";
import { AppContext } from "./Context/AppContext";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.min.css";

export default function App() {
  const { appState } = useContext(AppContext);

  useEffect(() => {
    // Log the fetched details from the AppContext
    console.log("Fetched Details from AppContext:", appState);
  }, [appState]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/navtab" element={<Navtab />} />
        <Route path="/accessdenied" element={<AccessDenied />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/oauthnotfound" element={<OAuthError />} />
        <Route path="/solvedticketerror" element={<SolvedTicketError />} />
      </Routes>
    </>
  );
}
