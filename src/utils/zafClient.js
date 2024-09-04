import { useEffect, useState } from "react";
let zafClient = null;
export function useZafClient() {
  const [client, setClient] = useState(zafClient);
  useEffect(() => {
    if (!client && typeof window.ZAFClient !== "undefined") {
      zafClient = window.ZAFClient.init();
      setClient(zafClient);
      // if (zafClient) {
      //   console.log(zafClient);
      // }
    }
  }, [client]);
  return client;
}
