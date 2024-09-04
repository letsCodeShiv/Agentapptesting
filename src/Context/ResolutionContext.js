import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { ApiConfig } from "../Config/ApiConfig";
import { useZafClient } from "../utils/zafClient";
const ResolutionContext = createContext();

const ResolutionProvider = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [noResolution, setNoResolution] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  const [resolutions, setResolutions] = useState([]);
  const [regenerateCount, setRegenerateCount] = useState(null);
  const [copied, setCopied] = useState(false);

  const client = useZafClient();

  useEffect(() => {
    const fetchResolutions = async () => {
      if (!client) return;

      setIsLoadingResolution(true);
      setNoResolution(false);
      setHasError(false);

      try {
        // Fetch Data from Zendesk
        const contextData = await client.context();
        const ticketData = await client.get(["ticket"]);

        const location = contextData?.location || "Unknown Location";

        const resolutionData = {
          subdomain:
            location !== "modal"
              ? contextData?.account?.subdomain
              : localStorage.getItem("subdomain"),
          ticketId:
            location !== "modal"
              ? contextData?.ticketId
              : localStorage.getItem("ticketId"),
          ticketStatus:
            location !== "modal"
              ? ticketData?.ticket?.status
              : localStorage.getItem("ticketStatus"),
          tags:
            location !== "modal"
              ? ticketData?.ticket?.tags
              : JSON.parse(localStorage.getItem("tags")),
          comments:
            location !== "modal"
              ? ticketData?.ticket?.comments
              : JSON.parse(localStorage.getItem("comments")),
          assignee_id:
            location !== "modal"
              ? ticketData?.ticket?.assignee?.user?.id
              : localStorage.getItem("assigneeId"),
          requester_id:
            location !== "modal"
              ? ticketData?.ticket?.requester?.id
              : localStorage.getItem("requesterId"),
          groupName:
            location !== "modal"
              ? ticketData?.ticket?.assignee?.group?.name
              : localStorage.getItem("groupName"),
          groupId:
            location !== "modal"
              ? ticketData?.ticket?.assignee?.group?.id
              : localStorage.getItem("groupId"),
          feature_name: "topx",
        };

        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };

        const response = await axios.post(
          ApiConfig.getResolution,
          resolutionData,
          config
        );

        const ticketResolutions = response?.data?.ticket_base_resolutions;

        if (Object.keys(ticketResolutions)?.length === 0) {
          setErrorMessage("Nothing relevant found");
          setNoResolution(true);
        } else {
          setResolutions(
            Object.entries(ticketResolutions)?.map(([key, value]) => ({
              ...value,
              key: key,
            }))
          );
        }

        setRegenerateCount(
          response?.data?.topcx_remaining_intelligent_search_count
        );
      } catch (error) {
        setErrorMessage(
          error.response?.data?.detail?.masked_error ||
            "An unexpected error occurred."
        );
        setHasError(true);
      } finally {
        setIsLoadingResolution(false);
      }
    };

    fetchResolutions();
  }, [client]);

  return (
    <ResolutionContext.Provider
      value={{
        hasError,
        setHasError,
        noResolution,
        setNoResolution,
        errorMessage,
        setErrorMessage,
        isLoadingResolution,
        setIsLoadingResolution,
        resolutions,
        setResolutions,
        regenerateCount,
        setRegenerateCount,
        copied,
        setCopied,
      }}
    >
      {children}
    </ResolutionContext.Provider>
  );
};

export { ResolutionContext, ResolutionProvider };
