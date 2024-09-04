import { useEffect, useState } from "react";
import { ApiConfig } from "../Config/ApiConfig";

export const useThirdPartyCookieCheck = () => {
  const [isSupported, setIsSupported] = useState(null); // Initialize as null to indicate loading state

  useEffect(() => {
    const frame = document.createElement("iframe");
    frame.id = "3pc";
    frame.src = ApiConfig.tpCookieURL;
    frame.style.display = "none";
    frame.style.position = "fixed";
    document.body.appendChild(frame);

    const handleMessage = (event) => {
      if (event.data === "3pcSupported" || event.data === "3pcUnsupported") {
        setIsSupported(event.data === "3pcSupported");
        document.body.removeChild(frame);
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage, false);

    frame.onload = () => {
      frame.contentWindow.postMessage("checkCookie", "*");
    };

    frame.onerror = (err) => {
      setIsSupported(false);
      document.body.removeChild(frame);
      window.removeEventListener("message", handleMessage);
    };

    return () => {
      window.removeEventListener("message", handleMessage);
      if (document.body.contains(frame)) {
        document.body.removeChild(frame);
      }
    };
  }, []);
  return isSupported;
};
