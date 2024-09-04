/* eslint-disable no-undef */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaLink } from "react-icons/fa6";
import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegClipboard,
  FaCheck,
} from "react-icons/fa";
import { LiaSearchengin } from "react-icons/lia";
import Markdown from "../Helper/MarkdownRenderer";
import { ApiConfig } from "../../Config/ApiConfig";
import { useZafClient } from "../../utils/zafClient";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { TicketContext } from "../../Context/TicketContext";
import { ResolutionContext } from "../../Context/ResolutionContext";
import Loader from "../Loader/Loader";
import { IoInformationCircleOutline } from "react-icons/io5";

export default function ResolutionScreen() {
  const { setCustomerQuery, setCustomerSentiment } = useContext(TicketContext);

  const {
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
  } = useContext(ResolutionContext);

  // const [hasError, setHasError] = useState(false);
  // const [noResolution, setNoResolution] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  // const [resolutions, setResolutions] = useState([]);
  // const [regenerateCount, setRegenerateCount] = useState(null);
  // const [copied, setCopied] = useState(false);

  const client = useZafClient();

  const [tooltipData, setTooltipData] = useState(null);

  const fetchTooltipData = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      const response = await axios.get(ApiConfig.tooltips, config);
      setTooltipData(response?.data?.topx);
    } catch (error) {
      console.error("Error fetching tooltip data:", error);
    }
  };
  useEffect(() => {
    fetchTooltipData();
  }, []);

  // const fetchResolutions = useCallback(async () => {
  //   if (!client) return;

  //   setIsLoadingResolution(true);
  //   setNoResolution(false);
  //   setHasError(false);

  //   try {
  //     // Fetch Data from Zendesk
  //     const contextData = await client.context();
  //     const ticketData = await client.get(["ticket"]);

  //     const location = contextData?.location || "Unknown Location";

  //     const resolutionData = {
  //       subdomain:
  //         location !== "modal"
  //           ? contextData?.account?.subdomain
  //           : localStorage.getItem("subdomain"),
  //       ticketId:
  //         location !== "modal"
  //           ? contextData?.ticketId
  //           : localStorage.getItem("ticketId"),
  //       ticketStatus:
  //         location !== "modal"
  //           ? ticketData?.ticket?.status
  //           : localStorage.getItem("ticketStatus"),
  //       tags:
  //         location !== "modal"
  //           ? ticketData?.ticket?.tags
  //           : JSON.parse(localStorage.getItem("tags")),
  //       comments:
  //         location !== "modal"
  //           ? ticketData?.ticket?.comments
  //           : JSON.parse(localStorage.getItem("comments")),
  //       assignee_id:
  //         location !== "modal"
  //           ? ticketData?.ticket?.assignee?.user?.id
  //           : localStorage.getItem("assigneeId"),
  //       requester_id:
  //         location !== "modal"
  //           ? ticketData?.ticket?.requester?.id
  //           : localStorage.getItem("requesterId"),
  //       groupName:
  //         location !== "modal"
  //           ? ticketData?.ticket?.assignee?.group?.name
  //           : localStorage.getItem("groupName"),
  //       groupId:
  //         location !== "modal"
  //           ? ticketData?.ticket?.assignee?.group?.id
  //           : localStorage.getItem("groupId"),
  //       feature_name: "topx",
  //     };

  //     const config = {
  //       headers: { "Access-Control-Allow-Origin": "*" },
  //       withCredentials: true,
  //     };

  //     const response = await axios.post(
  //       ApiConfig.getResolution,
  //       resolutionData,
  //       config
  //     );

  //     const ticketResolutions = response?.data?.ticket_base_resolutions;

  //     if (Object.keys(ticketResolutions)?.length === 0) {
  //       setErrorMessage("Nothing relevant found");
  //       setNoResolution(true);
  //     } else {
  //       setResolutions(
  //         Object.entries(ticketResolutions)?.map(([key, value]) => ({
  //           ...value,
  //           key: key,
  //         }))
  //       );
  //     }

  //     setRegenerateCount(
  //       response?.data?.topcx_remaining_intelligent_search_count
  //     );
  //     setCustomerQuery(response?.data?.topcx_customer_query);
  //     setCustomerSentiment(response?.data?.topcx_sentiment);
  //   } catch (error) {
  //     setErrorMessage(
  //       error.response?.data?.detail?.masked_error ||
  //         "An unexpected error occurred."
  //     );
  //     setHasError(true);
  //   } finally {
  //     setIsLoadingResolution(false);
  //   }
  // }, [client, setCustomerQuery, setCustomerSentiment]);

  // useEffect(() => {
  //   fetchResolutions();
  // }, [fetchResolutions]);

  const sendFeedback = async (key, value, type) => {
    const contextData = await client?.context?.();
    const location = contextData?.location || "Unknown Location";

    // Find the current resolution and store its current feedback
    const currentResolution = resolutions?.find((res) => res.key === key);
    const previousFeedback = currentResolution ? currentResolution.feedback : 0;

    // Optimistically update the feedback for the specific resolution
    const optimisticUpdatedResolutions = resolutions?.map((res) => {
      if (res.key === key) {
        return { ...res, feedback: value };
      }
      return res;
    });
    setResolutions(optimisticUpdatedResolutions);

    const feedbackData = {
      uuid: key,
      feedback: value,
      subdomain: contextData?.account?.subdomain,
      ticketId:
        location !== "modal"
          ? contextData?.ticketId
          : localStorage.getItem("ticketId"),
      ticketType: type,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      await axios.post(ApiConfig.resolutionFeedback, feedbackData, config);
      const updatedResolutions = resolutions?.map((res) => {
        if (key === res.key) {
          return { ...res, feedback: value };
        }
        return res;
      });
      setResolutions(updatedResolutions);
    } catch (error) {
      const revertedResolutions = resolutions?.map((res) => {
        if (res.key === key) {
          return { ...res, feedback: previousFeedback };
        }
        return res;
      });
      setResolutions(revertedResolutions);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {}
  };

  // Regenerate
  const regenerateResolutions = async () => {
    setIsLoadingResolution(true);
    setNoResolution(false);
    setHasError(false);

    // fetch Data from zendesk
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);

    const location = contextData?.location || "Unknown Location";

    // api data
    const regenerateData = {
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
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      const response = await axios.post(
        ApiConfig.regenerate,
        regenerateData,
        config
      );
      const ticketResolutions = response?.data?.ticket_base_resolutions;

      if (Object.keys(ticketResolutions)?.length === 0) {
        const message = "Nothing relevant found";
        setErrorMessage(message);
        setNoResolution(true);
      }
      setResolutions(
        Object.entries(ticketResolutions).map(([key, value]) => ({
          ...value,
          key: key, // Adding the unique identifier as `key`
        }))
      );
      setRegenerateCount(
        response?.data?.topcx_remaining_intelligent_search_count
      );
      setCustomerQuery(response?.data?.topcx_customer_query);
      setCustomerSentiment(response?.data?.topcx_sentiment);
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

  return (
    <div
      className="container-fluid p-1 mt-1 mx-auto w-100"
      style={{
        backgroundColor: "#f2f2f2",
        borderRadius: "5px",
      }}
    >
      <nav className="navbar sticky-top bg-body-tertiary mb-2 p-0">
        <div className="d-flex justify-content-between w-100 mx-2">
          <button
            data-tooltip-id="regenerate"
            type="button"
            className="btn btn-link text-black my-auto p-0 m-0 grow-icon position-relative"
            style={{ fontSize: "1.5rem" }}
            disabled={regenerateCount <= 0 || isLoadingResolution || hasError}
            onClick={() => regenerateResolutions()}
          >
            <LiaSearchengin className="p-0" />
            <span
              id="regenerateCount"
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger"
              style={{ padding: " 0.125rem 0.175rem", fontSize: "0.8rem" }}
            >
              {regenerateCount >= 0 ? regenerateCount : 0}
            </span>
          </button>
          <ReactTooltip
            id="regenerate"
            place="bottom"
            style={{ zIndex: "9999" }}
            delayShow={200}
          >
            <div
              style={{
                fontSize: "14px",
                wordWrap: "break-word",
                whiteSpace: "normal",
                maxWidth: "500px",
              }}
            >
              <p>{tooltipData?.topx_regenerate}</p>
            </div>
          </ReactTooltip>

          <div className="my-auto" data-tooltip-id="Remaining">
            <h6 className="my-auto fw-bold">
              <span>{resolutions?.length}</span>&nbsp;Resolutions Based on
              Historical Tickets
            </h6>
            <ReactTooltip
              id="Remaining"
              place="bottom"
              style={{ zIndex: "9999" }}
              delayShow={200}
            >
              <div
                style={{
                  fontSize: "14px",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "500px",
                }}
              >
                <p>{tooltipData?.topx_resolution_ticket_subject}</p>
              </div>
            </ReactTooltip>
          </div>

          <span></span>
        </div>
      </nav>
      {isLoadingResolution ? (
        <div className="resolution-container">
          <Loader />
        </div>
      ) : hasError || noResolution ? (
        <div
          className="alert alert-danger text-center text-danger my-3"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : (
        <div className="accordion accordion-flush" id="accordionFlushExample">
          {resolutions?.map((resolution, index) => (
            <div className="accordion-item mb-2" key={resolution?.link}>
              <h2
                className="accordion-header"
                data-tooltip-id="resolution-subject"
              >
                <button
                  className="accordion-button collapsed p-2 m-0"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#flush-collapse${index}`}
                  aria-expanded="false"
                  aria-controls={`flush-collapse${index}`}
                >
                  <div className="w-100 d-flex justify-content-between">
                    <span
                      // data-tooltip-id="resolution-subject"
                      className="fw-semibold text-wrap my-auto"
                    >
                      {index + 1}. {resolution?.topcx_subject}
                    </span>
                    <ReactTooltip
                      id="resolution-subject"
                      place="bottom"
                      content={`Subject of the ticket with the most relevant resolution to the current ticket.`}
                      style={{ zIndex: "9999" }}
                      delayShow={200}
                    />
                    <span
                      data-tooltip-id="cross-encoder-score"
                      className="me-3"
                      style={{
                        maxWidth: "40px",
                      }}
                    >
                      <CircularProgressbar
                        value={resolution.score * 100}
                        text={`${(resolution?.score * 100)?.toFixed(0)}%`}
                        styles={buildStyles({
                          strokeLinecap: "butt",
                          textSize: "28px",
                          pathTransitionDuration: 0.5,
                          textColor: "#000",
                          trailColor: "#d6d6d6",
                          pathColor: "#ffb648",
                        })}
                      />
                    </span>
                    {/* <ReactTooltip
                      id="cross-encoder-score"
                      place="bottom"
                      style={{ zIndex: "9999" }}
                      delayShow={200}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          maxWidth: "400px",
                        }}
                      >
                        <p>{getTooltipContent(resolution.score)}</p>
                      </div>
                    </ReactTooltip> */}
                  </div>
                </button>
              </h2>
              <div
                id={`flush-collapse${index}`}
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFlushExample"
              >
                <div className="accordion-body p-3">
                  <ul>
                    {resolution?.topcx_refined_resolution?.map(
                      (refinedRes, resIndex) => (
                        <li key={resIndex}>{refinedRes}</li>
                      )
                    )}
                  </ul>
                  <nav className="navbar bg-body-tertiary p-0 mb-3 rounded rounded-4">
                    <div className="d-flex justify-content-between w-100 mx-2">
                      <div className="ms-3">
                        <span className="my-auto fw-semibold">
                          Was this helpful?
                        </span>
                        &nbsp;&nbsp;
                        <button
                          type="button"
                          className={`btn btn-link text-black grow-icon ${
                            resolution?.feedback === 1 ? "text-success" : ""
                          }`}
                          style={{ fontSize: "1.125rem" }}
                          onClick={() =>
                            sendFeedback(resolution?.key, 1, resolution?.type)
                          }
                        >
                          <FaRegThumbsUp
                            className={`thumbs-up-hover ${
                              resolution?.feedback === 1 ? "text-success" : ""
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          className={`btn btn-link text-black grow-icon ${
                            resolution?.feedback === -1 ? "text-danger" : ""
                          }`}
                          style={{ fontSize: "1.125rem" }}
                          onClick={() =>
                            sendFeedback(resolution?.key, -1, resolution?.type)
                          }
                        >
                          <FaRegThumbsDown
                            className={`thumbs-down-hover ${
                              resolution?.feedback === -1 ? "text-danger" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <div className="me-3">
                        <button
                          data-tooltip-id="clipboard"
                          type="button"
                          className="btn btn-link text-black grow-icon"
                          style={{ fontSize: "1.125rem" }}
                          onClick={() =>
                            copyToClipboard(
                              resolution?.topcx_refined_resolution?.join("\n")
                            )
                          }
                        >
                          {copied ? <FaCheck /> : <FaRegClipboard />}
                        </button>
                        <ReactTooltip
                          id="clipboard"
                          place="bottom"
                          content={`Click to copy this resolution to your clipboard.`}
                          style={{ zIndex: "9999" }}
                          delayShow={200}
                        />
                        <button
                          data-tooltip-id="ticket-link"
                          type="button"
                          className="btn btn-link text-black grow-icon"
                          style={{ fontSize: "1.125rem" }}
                          onClick={() => window.open(resolution.link, "_blank")}
                        >
                          <FaLink />
                        </button>
                        <ReactTooltip
                          id="ticket-link"
                          place="bottom"
                          content={`Click to view the original ticket.`}
                          style={{ zIndex: "9999" }}
                          delayShow={200}
                        />
                      </div>
                    </div>
                  </nav>
                  <div
                    className="accordion accordion-flush"
                    id="nestedAccordionFlushExample"
                  >
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed m-0 p-1 fw-semibold border-bottom"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#flush-collapseNested${index}`}
                          aria-expanded="false"
                          aria-controls={`flush-collapseNested${index}`}
                        >
                          More information...
                        </button>
                      </h2>
                      <div
                        id={`flush-collapseNested${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#nestedAccordionFlushExample"
                      >
                        <div className="accordion-body">
                          <Markdown markdown={resolution?.topcx_resolution} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div> </div>
        <p
          className="text-center text-muted m-0"
          style={{ fontSize: " 0.5rem" }}
        >
          TopCX can make mistakes. Consider checking important information.
        </p>

        <ReactTooltip
          id="Suggest"
          place="bottom"
          style={{ zIndex: "99999999" }}
          delayShow={500}
        >
          <div
            style={{
              fontSize: "10px",
              wordWrap: "break-word",
              whiteSpace: "normal",
              maxWidth: "400px",
            }}
          >
            <p>{tooltipData?.topx_overview}</p>
          </div>
        </ReactTooltip>
        <IoInformationCircleOutline data-tooltip-id="Suggest" />
      </div>
    </div>
  );
}
