import React, { createContext, useState, useEffect } from "react";
import queryString from "query-string";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState({
    agentId: null,
    email: null,
    orgName: null,
    orgId: null,
    domainName: null,
    caseId: null,
  });

  useEffect(() => {
    // Parse the query parameters from the URL
    const parsed = queryString.parse(window.location.search);

    setAppState({
      agentId: parsed.agentId || null,
      email: parsed.email || null,
      orgName: parsed.orgName || null,
      orgId: parsed.orgId || null,
      domainName: parsed.domainName || null,
      caseId: parsed.caseId || null,
    });
  }, []);

  return (
    <AppContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppContext.Provider>
  );
};
