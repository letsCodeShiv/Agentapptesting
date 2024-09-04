import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TextStreamer from "../Helper/TextStreamer";
import Markdown from "../Helper/MarkdownRenderer";
import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegClipboard,
  FaDownload,
  FaCheck,
} from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { IoMdRefresh, IoMdSend } from "react-icons/io";
import { ApiConfig } from "../../Config/ApiConfig";
import { useZafClient } from "../../utils/zafClient";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Loader from "../Loader/Loader";

const Chatbot = () => {
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
  const [isLaodingResponse, setIsLaodingResponse] = useState(false);

  const client = useZafClient();
  const messagesEndRef = useRef(null);

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

  const scroll = () => {
    const scrollHeight = messagesEndRef.current.scrollHeight;
    const height = messagesEndRef.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    messagesEndRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  };
  useEffect(() => {
    // if (messagesEndRef.current) {
    scroll();
    // }
  }, [messages]); // Only re-run this effect if the messages array changes

  const refreshChats = async () => {
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
      const response = await axios.post(ApiConfig.getChats, chatData, config);
      const chatDetails = response?.data?.data?.details;
      setQueryCountLeft(chatDetails?.query_count_left);
      setMaxQueryCount(chatDetails?.max_query_count);
      setChatID(chatDetails?.chat_id_key);
      setMessages(chatDetails?.chat_id[chatDetails?.chat_id_key]?.qna || []);
    } catch (error) {
      setError(true);
      if (error?.response) {
        if (error?.response?.status === 500) {
          setApiError("Internal Server Error. Please try again later.");
        } else {
          setApiError(
            error?.response?.data?.detail?.masked_error || "An error occurred."
          );
        }
      } else {
        setApiError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    setIsLaodingResponse(true);
    const contextData = await client?.context?.();
    const currentUser = await client?.get?.(["currentUser"]);
    const ticketData = await client?.get?.(["ticket"]);

    if (!userInput?.trim()) {
      setIsLaodingResponse(false);
      setUserInput("");
      setCharCount(0);
      return;
    }

    const tempId = new Date()?.getTime();

    const newMessage = {
      qna_id: tempId,
      type: "temp",
      question: userInput,
      answer: "thinking...",
      feedback: 0,
      error: false,
      links: {
        link: [],
        file_name: "Not Available",
      },
    };

    setMessages((messages) => [...messages, newMessage]);
    setUserInput("");
    setCharCount(0);

    const chatData = {
      subdomain: contextData?.account?.subdomain,
      email: currentUser?.currentUser?.email,
      chatId: chatID,
      question: userInput,
      ...(ticketData?.ticket?.assignee?.group
        ? { groupId: ticketData?.ticket?.assignee?.group?.id }
        : {}),
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      const response = await axios.post(ApiConfig.getConvo, chatData, config);
      // Update the message in the state with the actual response details
      setMessages((prevMessages) =>
        prevMessages?.map((msg) =>
          msg?.qna_id === tempId
            ? {
                ...msg,
                ...response?.data?.data?.details,
                qna_id: response?.data?.data?.details?.qna_id,
                stream: true,
                type: "response",
              }
            : msg
        )
      );
      setQueryCountLeft(response?.data?.data?.details?.query_count_left);
      setMaxQueryCount(response?.data?.data?.details?.max_query_count);
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages?.map((msg) =>
          msg?.qna_id === tempId
            ? {
                ...msg,
                answer: error?.response?.data?.detail?.masked_error
                  ? error?.response?.data?.detail?.masked_error
                  : "Something went wrong...",
                type: "response",
                error: true,
              }
            : msg
        )
      );
    } finally {
      setIsLaodingResponse(false);
    }
  };

  const handelFeedback = async (feedback, qnaId) => {
    const contextData = await client?.context?.();
    const currentUser = await client?.get?.(["currentUser"]);

    // Store the old feedback for possible rollback
    let oldFeedback = null;
    setMessages((prevMessages) =>
      prevMessages?.map((msg) => {
        if (msg?.qna_id === qnaId) {
          oldFeedback = msg?.feedback; // Capture old feedback
          return { ...msg, feedback: feedback };
        }
        return msg;
      })
    );

    const feedbackData = {
      subdomain: contextData?.account?.subdomain,
      email: currentUser?.currentUser?.email,
      chatId: chatID,
      feedback: feedback,
      qnaId: qnaId,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      await axios.post(ApiConfig.feedback, feedbackData, config);
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages?.map((msg) =>
          msg?.qna_id === qnaId ? { ...msg, feedback: oldFeedback } : msg
        )
      );
    }
  };

  const copyToClipboard = async (text, qnaId) => {
    try {
      setCopied(qnaId);
      await navigator?.clipboard?.writeText(text);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      // console.error("Failed to copy: ", err);
    }
  };

  const handleDownloadChat = async () => {
    const contextData = await client?.context?.();
    const currentUser = await client?.get?.(["currentUser"]);

    const downloadData = {
      subdomain: contextData?.account?.subdomain,
      email: currentUser?.currentUser?.email,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setDownload(true);
      const response = await axios.post(
        `${ApiConfig.download}/${chatID}`,
        downloadData,
        config
      );

      // setTimeout(() => {
      //   setDownload(false);
      // }, 1000);

      var textData = response?.data?.data?.details
        ?.map(function (detail) {
          return (
            "Question: " +
            detail?.question +
            "\nAnswer: " +
            detail?.answer +
            "\n\n"
          );
        })
        .join("");

      // Proceed with creating a Blob and downloading the file as before
      var blob = new Blob([textData], { type: "text/plain" });
      var fileUrl = URL.createObjectURL(blob);
      var downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = "QnA.txt";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
    } finally {
      setDownload(false);
    }
  };

  return (
    <div
      className="container-fluid p-1 mt-1 mx-auto"
      style={{ backgroundColor: "#f2f2f2", borderRadius: "5px" }}
    >
      <nav className="navbar sticky-top bg-body-tertiary mb-2 p-0">
        <div className="d-flex justify-content-between w-100 mx-2">
          <button
            data-tooltip-id="download-chat"
            type="button"
            className="btn btn-link text-black my-auto p-1 m-0 grow-icon position-relative"
            onClick={handleDownloadChat}
            disabled={error || isLoadingMessages || isLaodingResponse}
          >
            {download ? <FaCheck /> : <FaDownload />}
          </button>
          <ReactTooltip
            id="download-chat"
            place="bottom"
            content={`Click to download the current chat.`}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
          <h6 className="my-auto fw-bold" data-tooltip-id="Remaining">
            Remaining&nbsp;<span>{queryCountLeft}</span>&nbsp;of&nbsp;
            <ReactTooltip
              id="Remaining"
              place="bottom"
              content={`Shows today's question limit and remaining count for bot queries.`}
              style={{ zIndex: "9999" }}
              delayShow={200}
            />
            <span>{maxQueryCount}</span>
          </h6>
          <button
            data-tooltip-id="refresh-chat"
            type="button"
            className="btn btn-link text-black my-auto p-1 m-0 grow-icon"
            onClick={refreshChats}
            disabled={error || isLoadingMessages || isLaodingResponse}
          >
            <IoMdRefresh />
          </button>
          <ReactTooltip
            id="refresh-chat"
            place="bottom"
            content={`Click to refresh the chat.`}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
        </div>
      </nav>
      <div className="chat-container" ref={messagesEndRef}>
        {isLoadingMessages ? (
          <Loader />
        ) : error ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <span className="text-danger text-center w-100">{apiError}</span>
          </div>
        ) : (
          messages?.map((message, key) => (
            <React.Fragment key={key}>
              {message?.question && (
                <div className="message-bubble user-message">
                  {message?.question}
                </div>
              )}
              {message?.answer && (
                <div
                  className={`message-bubble bot-message ${
                    message?.error ? "error-text" : ""
                  }`}
                >
                  {message?.type === "temp" ? (
                    <div className="px-3 py-1">
                      <div className="dot-flashing" />
                    </div>
                  ) : message?.stream ? (
                    <TextStreamer
                      text={message?.answer}
                      speed={15}
                      onUpdate={scroll}
                    />
                  ) : (
                    <Markdown markdown={message?.answer} />
                  )}
                  {message?.error || message?.type === "temp" ? (
                    <></>
                  ) : (
                    <div className="d-flex">
                      <button
                        type="button"
                        className={`btn btn-link text-black grow-icon p-2 py-0 ${
                          message?.feedback === 1 ? "text-success" : ""
                        }`}
                        style={{ fontSize: "1rem" }}
                        onClick={() => handelFeedback(1, message.qna_id)}
                      >
                        <FaRegThumbsUp
                          className={`thumbs-up-hover ${
                            message?.feedback === 1 ? "text-success" : ""
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className={`btn btn-link text-black grow-icon p-2 py-0  ${
                          message?.feedback === -1 ? "text-danger" : ""
                        }`}
                        style={{ fontSize: "1rem" }}
                        onClick={() => handelFeedback(-1, message?.qna_id)}
                      >
                        <FaRegThumbsDown
                          className={`thumbs-down-hover ${
                            message?.feedback === -1 ? "text-danger" : ""
                          }`}
                        />
                      </button>
                      <button
                        data-tooltip-id="copy-clipboard"
                        type="button"
                        className="btn btn-link text-black grow-icon p-2 py-0 "
                        style={{ fontSize: "1rem" }}
                        onClick={() =>
                          copyToClipboard(message?.answer, message?.qna_id)
                        }
                      >
                        {copied === message?.qna_id ? (
                          <FaCheck />
                        ) : (
                          <FaRegClipboard />
                        )}
                      </button>
                      <ReactTooltip
                        id="copy-clipboard"
                        place="bottom"
                        content={`Click to copy the response to clipboard.`}
                        style={{ zIndex: "9999" }}
                        delayShow={200}
                      />
                      {message?.links?.link?.length > 0 ? (
                        <>
                          <button
                            data-tooltip-id="ticket-link"
                            type="button"
                            className="btn btn-link text-black grow-icon p-2 py-0 "
                            style={{ fontSize: "1rem" }}
                            onClick={() =>
                              window.open(message?.links?.link[0], "_blank")
                            }
                          >
                            <FaLink />
                          </button>
                          <ReactTooltip
                            id="ticket-link"
                            place="bottom"
                            content={`Click to reffer to original file`}
                            style={{ zIndex: "9999" }}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>

      <div className={`input-group ${charCount === 2000 ? "red-border" : ""}`}>
        <textarea
          className={`form-control ${
            charCount === 2000 ? "" : "border border-0"
          }`}
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setCharCount(e.target.value.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          maxLength={2000}
          placeholder="Type a message..."
          style={{ resize: "none", overflow: "auto" }}
          rows={1}
          disabled={
            queryCountLeft === 0 ||
            error ||
            isLoadingMessages ||
            isLaodingResponse
          }
        />
        <button
          className="btn bg-white"
          type="button"
          onClick={sendMessage}
          disabled={
            queryCountLeft === 0 ||
            error ||
            isLoadingMessages ||
            isLaodingResponse
          }
        >
          <span>
            <div
              className="mb-1"
              style={{
                color: charCount === 2000 ? "red" : "#3156d3",
              }}
            >
              <IoMdSend className="fs-5" />
            </div>
            <div
              style={{
                fontSize: "10px",
                color: charCount === 2000 ? "red" : "#3156d3",
              }}
            >
              {charCount}/2000
            </div>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
