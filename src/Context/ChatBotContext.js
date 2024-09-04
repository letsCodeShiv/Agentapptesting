import React, { createContext, useState, useEffect } from "react";
import { useZafClient } from "../utils/zafClient";
import axios from "axios";
import { ApiConfig } from "../Config/ApiConfig";
const ChatbotContext = createContext();

const ChatbotProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [queryCountLeft, setQueryCountLeft] = useState(0);
  const [maxQueryCount, setMaxQueryCount] = useState(0);
  const [chatID, setChatID] = useState("");
  const [copied, setCopied] = useState("");
  const [download, setDownload] = useState(false);
  const [error, setError] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

  const client = useZafClient();

  useEffect(() => {
    if (client !== null) {
      const fetchChats = async () => {
        const contextData = await client?.context?.();
        const currentUser = await client?.get?.(["currentUser"]);
        const chatData = {
          subdomain: contextData?.account?.subdomain,
          email: currentUser?.currentUser?.email,
        };
        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };
        try {
          setIsLoadingMessages(true);
          const response = await axios.post(
            ApiConfig.getChats,
            chatData,
            config
          );
          const chatDetails = response?.data?.data?.details;
          setQueryCountLeft(chatDetails?.query_count_left);
          setMaxQueryCount(chatDetails?.max_query_count);
          setChatID(chatDetails?.chat_id_key);
          setMessages(
            chatDetails?.chat_id[chatDetails?.chat_id_key]?.qna || []
          );
        } catch (error) {
          setError(true);
          if (error?.response) {
            if (error?.response?.status === 500) {
              setApiError("Internal Server Error. Please try again later.");
            } else {
              setApiError(
                error?.response?.data?.detail?.masked_error ||
                  "An error occurred."
              );
            }
          } else {
            setApiError("Network error. Please check your connection.");
          }
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchChats();
    }
  }, [client]);

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        setMessages,
        userInput,
        setUserInput,
        charCount,
        setCharCount,
        queryCountLeft,
        setQueryCountLeft,
        maxQueryCount,
        setMaxQueryCount,
        chatID,
        setChatID,
        copied,
        setCopied,
        download,
        setDownload,
        error,
        setError,
        apiError,
        setApiError,
        isLoadingMessages,
        setIsLoadingMessages,
        isLoadingResponse,
        setIsLoadingResponse,
        userScrolledUp,
        setUserScrolledUp,
        isStreaming,
        setIsStreaming,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export { ChatbotContext, ChatbotProvider };
