import React, { createContext, useState, useEffect, useCallback } from "react";
import { useZafClient } from "../utils/zafClient";
import axios from "axios";
import { ApiConfig } from "../Config/ApiConfig";
const SearchXContext = createContext();

const SearchXProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [resolutions, setResolutions] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [noResolution, setNoResolution] = useState(false);
  const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("Search your query...");
  const [entitySuggestions, setEntitySuggestions] = useState([]);
  const [aspectSuggestions, setAspectSuggestions] = useState([]);
  const [searchTagsEntity, setSearchTagsEntity] = useState([]);
  const [searchTagsAspect, setSearchTagsAspect] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const client = useZafClient();

  const fetchData = useCallback(async () => {
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);

    const location = contextData?.location || "Unknown Location";
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const searchData = {
      query: title,
      assignee_id:
        location !== "modal"
          ? ticketData?.ticket?.assignee?.user?.id
          : localStorage.getItem("assigneeId"),
      groupName:
        location !== "modal"
          ? ticketData?.ticket?.assignee?.group?.name
          : localStorage.getItem("groupName"),
    };
    try {
      setIsLoadingResolution(true);
      setNoResolution(false);
      setHasError(false);

      const response = await axios.post(
        ApiConfig.querySearch,
        searchData,
        config
      );
      if (response.data?.length === 0) {
        const message = "Nothing relevant found";
        setErrorMessage(message);
        setNoResolution(true);
      } else {
        setResolutions(response.data);
        setNoResolution(false);
      }
    } catch (error) {
      const message =
        error.response?.data?.detail?.masked_error ||
        "An unexpected error occurred.";
      setErrorMessage(message);
      setHasError(true);
    } finally {
      setIsLoadingResolution(false);
    }
  }, [client, title]);

  useEffect(() => {
    if (client !== null) {
      const fetchResolutions = async () => {
        setIsLoadingResolution(true);
        setNoResolution(false);
        setHasError(false);
        try {
          const contextData = await client?.context?.();
          const ticketData = await client?.get?.(["ticket"]);

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
            feature_name: "searchx",
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

          setTitle(response?.data?.topcx_customer_query);
          await fetchData();
        } catch (error) {
          const message =
            error.response?.data?.detail?.masked_error ||
            "An unexpected error occurred.";
          setErrorMessage(message);
          setHasError(true);
        } finally {
          setIsLoadingResolution(false);
        }
      };
      fetchResolutions();
    }
  }, [client]);

  return (
    <SearchXContext.Provider
      value={{
        fetchData,
        errorMessage,
        setErrorMessage,
        resolutions,
        setResolutions,
        hasError,
        setHasError,
        noResolution,
        setNoResolution,
        isLoadingResolution,
        setIsLoadingResolution,
        copied,
        setCopied,
        title,
        setTitle,
        entitySuggestions,
        setEntitySuggestions,
        aspectSuggestions,
        setAspectSuggestions,
        searchTagsEntity,
        setSearchTagsEntity,
        searchTagsAspect,
        setSearchTagsAspect,
        inputValue,
        setInputValue,
      }}
    >
      {children}
    </SearchXContext.Provider>
  );
};

export { SearchXContext, SearchXProvider };
