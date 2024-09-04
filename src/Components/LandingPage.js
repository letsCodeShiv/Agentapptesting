/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ApiConfig } from "../Config/ApiConfig";
import { useZafClient } from "../utils/zafClient";
import Loader from "./Loader/Loader";

export default function LandingPage() {
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const navigate = useNavigate();
  const client = useZafClient();

  useEffect(() => {
    if (client !== null) {
      const auth = async () => {
        setIsLoadingLogin(true);
        // fetch Data from zendesk
        const contextData = await client?.context?.();
        const userData = await client?.get?.(["currentUser"]);
        const ticketData = await client?.get?.(["ticket"]);
        // api data
        const authData = {
          subdomain: contextData?.account?.subdomain,
          email: userData?.currentUser?.email,
          role: userData?.currentUser?.role,
          source: "resolution_screen",
          ticketStatus: ticketData?.ticket?.status,
        };

        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };

        try {
          // const response = await axios.post(ApiConfig.login, authData, config);
          // if (response.data.oauth) {
          //   navigate("/oauthnotfound");
          // } else {
          //   navigate("/navtab");
          // }
          navigate("/navtab");
        } catch (error) {
          if (error.response) {
            if (error.response.status === 401) {
              navigate("/accessdenied");
            } else if (error.response.status === 400) {
              navigate("/solvedticketerror");
            } else {
              navigate("/error");
            }
          } else {
            navigate("/error");
          }
        } finally {
          setIsLoadingLogin(false);
        }
      };
      auth();
    }
  }, [navigate, client]);
  return (
    <div style={{ height: "100vh" }}>
      {isLoadingLogin ? <Loader /> : <div />}
    </div>
  );
}
