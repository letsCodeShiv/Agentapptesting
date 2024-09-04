import React, { useEffect } from "react";

import { ApiConfig } from "../../Config/ApiConfig";
import { useZafClient } from "../../utils/zafClient";

const Help = () => {
  const client = useZafClient();

  useEffect(() => {
    if (client !== null) {
      const fetchChats = async () => {
        const contextData = await client?.context?.();
        const currentUser = await client?.get?.(["currentUser"]);
        const ticketData = await client?.get?.(["ticket"]);

        try {
        } catch (error) {
        } finally {
        }
      };
      fetchChats();
    }
  }, [client]);

  return <div></div>;
};

export default Help;
