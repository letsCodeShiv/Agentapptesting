import React, { createContext, useState } from "react";

const TicketContext = createContext();

const TicketProvider = ({ children }) => {
  const [customerQuery, setCustomerQuery] = useState(null);
  const [customerSentiment, setCustomerSentiment] = useState(null);

  return (
    <TicketContext.Provider
      value={{
        customerQuery,
        setCustomerQuery,
        customerSentiment,
        setCustomerSentiment,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export { TicketContext, TicketProvider };
