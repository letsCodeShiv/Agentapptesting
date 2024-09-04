/* eslint-disable no-undef */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IoMdRefresh } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { FaLink } from "react-icons/fa6";
import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegClipboard,
  FaTrashAlt,
  FaCheck,
} from "react-icons/fa";
import { LiaSearchengin } from "react-icons/lia";
import Markdown from "../Helper/MarkdownRenderer";
import { ApiConfig } from "../../Config/ApiConfig";
import { useZafClient } from "../../utils/zafClient";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { TicketContext } from "../../Context/TicketContext";
import Loader from "../Loader/Loader";
import { IoInformationCircleOutline } from "react-icons/io5";

export default function ResolutionScreen() {
  const { setCustomerQuery, setCustomerSentiment } = useContext(TicketContext);

  const [hasError, setHasError] = useState(false);
  const [noResolution, setNoResolution] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  const [currentTicket, setCurrentTicket] = useState();
  const [resolutions, setResolutions] = useState([]);
  const [regenerateCount, setRegenerateCount] = useState(null);
  const [copied, setCopied] = useState(false);

  // Entity Aspect search
  const [showModal, setShowModal] = useState(false);
  const [entitySuggestions, setEntitySuggestions] = useState([]);
  const [aspectSuggestions, setAspectSuggestions] = useState([]);
  const [searchTagsEntity, setSearchTagsEntity] = useState([]);
  const [searchTagsAspect, setSearchTagsAspect] = useState([]);
  const [ogSearchTagsEntity, setOgSearchTagsEntity] = useState([]);
  const [ogSearchTagsAspect, setOgSearchTagsAspect] = useState([]);
  const [inputValue, setInputValue] = useState("");

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
      setErrorMessage(error.response?.data?.detail?.masked_error);
    }
  };

  useEffect(() => {
    fetchTooltipData();
  }, []);

  useEffect(() => {
    if (client !== null) {
      const fetchResolutions = async () => {
        setIsLoadingResolution(true);

        // fetch Data from zendesk
        const contextData = await client?.context?.();
        // console.log(contextData.location);
        const ticketData = await client?.get?.(["ticket"]);
        // api data
        const resolutionData = {
          subdomain: contextData?.account?.subdomain,
          ticketId: contextData?.ticketId,
          ticketStatus: ticketData?.ticket?.status,
          tags: ticketData?.ticket?.tags,
          comments: ticketData?.ticket?.comments,
          assignee_id: ticketData?.ticket?.assignee?.user
            ? ticketData?.ticket?.assignee?.user?.id
            : 0,
          requester_id: ticketData?.ticket?.requester
            ? ticketData?.ticket?.requester?.id
            : 0,
          ...(ticketData?.ticket?.assignee?.group
            ? {
                groupName: ticketData?.ticket?.assignee?.group?.name,
                groupId: ticketData?.ticket?.assignee?.group?.id,
              }
            : {}),
          feature_name: "topx",
        };

        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };

        try {
          const response = await axios.post(
            ApiConfig.getResolution,
            resolutionData,
            config
          );

          setCurrentTicket(response?.data);
          const ticketResolutions = response?.data?.ticket_base_resolutions;
          if (Object.keys(ticketResolutions)?.length === 0) {
            const message = "Nothing relevant found";
            setErrorMessage(message);
            setNoResolution(true);
          }
          setResolutions(
            Object.entries(ticketResolutions)?.map(([key, value]) => ({
              ...value,
              key: key,
            }))
          );
          setRegenerateCount(
            response?.data?.topcx_remaining_intelligent_search_count
          );
          setCustomerQuery(response?.data?.topcx_customer_query);
          setCustomerSentiment(response?.data?.topcx_sentiment);

          // Adding entities to searchTagsEntity
          setSearchTagsEntity([]);
          setOgSearchTagsEntity([]);
          response?.data?.topcx_entities?.forEach((entity) => {
            setSearchTagsEntity((prevTags) => [...prevTags, entity]);
            setOgSearchTagsEntity((prevTags) => [...prevTags, entity]);
          });

          // Adding aspects to searchTagsAspect
          setSearchTagsAspect([]);
          setOgSearchTagsAspect([]);
          response?.data?.topcx_aspects?.forEach((aspect) => {
            setSearchTagsAspect((prevTags) => [...prevTags, aspect]);
            setOgSearchTagsAspect((prevTags) => [...prevTags, aspect]);
          });
        } catch (error) {
          const message =
            error.response?.status >= 500
              ? "Internal Server Error. Please try again later."
              : error.response?.data?.detail?.masked_error ||
                "An unexpected error occurred.";
          setErrorMessage(message);
          setHasError(true);
        } finally {
          setIsLoadingResolution(false);
        }
      };
      fetchResolutions();
    }
  }, [client, setCustomerQuery, setCustomerSentiment]);

  const sendFeedback = async (key, value, type) => {
    const contextData = await client?.context?.();

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
      ticketId: contextData?.ticketId,
      subdomain: contextData?.account?.subdomain,
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

    // fetch Data from zendesk
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);
    // api data
    const regenerateData = {
      subdomain: contextData?.account?.subdomain,
      ticketId: contextData?.ticketId,
      ticketStatus: ticketData?.ticket?.status,
      tags: ticketData?.ticket?.tags,
      comments: ticketData?.ticket?.comments,
      assignee_id: ticketData?.ticket?.assignee?.user
        ? ticketData?.ticket?.assignee?.user?.id
        : 0,
      requester_id: ticketData?.ticket?.requester
        ? ticketData?.ticket?.requester?.id
        : 0,
      ...(ticketData?.ticket?.assignee?.group
        ? {
            groupName: ticketData?.ticket?.assignee?.group?.name,
            groupId: ticketData?.ticket?.assignee?.group?.id,
          }
        : {}),
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
      setCurrentTicket(response?.data);
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

      // Adding entities to searchTagsEntity
      setSearchTagsEntity([]);
      response?.data?.topcx_entities.forEach((entity) => {
        setSearchTagsEntity((prevTags) => [...prevTags, entity]);
      });

      // Adding aspects to searchTagsAspect
      setSearchTagsAspect([]);
      response?.data?.topcx_aspects?.forEach((aspect) => {
        setSearchTagsAspect((prevTags) => [...prevTags, aspect]);
      });
    } catch (error) {
      const message =
        error.response?.status >= 500
          ? "Internal Server Error. Please try again later."
          : error.response?.data?.detail?.masked_error ||
            "An unexpected error occurred.";
      setErrorMessage(message);
      setHasError(true);
    } finally {
      setIsLoadingResolution(false);
    }
  };

  //Entity Aspect search

  const handleInputChange = async (event) => {
    const contextData = await client?.context?.();
    const inputValue = event.target.value;
    setInputValue(inputValue);

    const apidata = {
      search_phrase: inputValue,
      selected_keywords: [...searchTagsEntity, ...searchTagsAspect],
      max_result_count: 50,
      subdomain: contextData?.account?.subdomain,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      const response = await axios.post(
        ApiConfig.keywordSearch,
        apidata,
        config
      );

      const newSuggestions = response.data;
      setEntitySuggestions(newSuggestions?.entity);
      setAspectSuggestions(newSuggestions?.aspects);
    } catch (error) {}
  };

  const handleTagsEntity = (tag) => {
    setSearchTagsEntity((prevTags) => [...prevTags, tag]);
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
  };

  const handleTagsAspect = (tag) => {
    setSearchTagsAspect((prevTags) => [...prevTags, tag]);
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
  };

  const handleRemoveTags = (tag) => {
    // Remove the tag from searchTagsEntity if it exists
    setSearchTagsEntity((prevTags) =>
      prevTags.filter((prevTag) => prevTag !== tag)
    );

    // Remove the tag from searchTagsAspect if it exists
    setSearchTagsAspect((prevTags) =>
      prevTags.filter((prevTag) => prevTag !== tag)
    );
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
    // document.getElementById("inputField").value = "";
  };

  const highlightMatch = (text, query) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query?.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const searchResolutions = async () => {
    setIsLoadingResolution(true);
    setNoResolution(false);

    // fetch Data from zendesk
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);
    // api data
    const regenerateData = {
      subdomain: contextData?.account?.subdomain,
      ticketId: contextData?.ticketId,
      ticketStatus: ticketData?.ticket?.status,
      tags: ticketData?.ticket?.tags,
      ...(ticketData?.ticket?.assignee?.group
        ? {
            groupName: ticketData?.ticket?.assignee?.group?.name,
            groupId: ticketData?.ticket?.assignee?.group?.id,
          }
        : {}),
      query: currentTicket?.topcx_customer_query,
      information: currentTicket?.topcx_customer_information,
      subject: currentTicket?.topcx_subject,
      entity: currentTicket?.topcx_entities,
      aspects: currentTicket?.topcx_aspects,
      additional_entity: searchTagsEntity,
      additional_aspects: searchTagsAspect,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      const response = await axios.post(
        ApiConfig.searchResolution,
        regenerateData,
        config
      );
      setCurrentTicket(response?.data);

      const ticketResolutions = response?.data?.ticket_base_resolutions;
      if (Object.keys(ticketResolutions)?.length === 0) {
        const message = "Nothing relevant found";
        setErrorMessage(message);
        setNoResolution(true);
      }
      setResolutions(
        Object.entries(ticketResolutions)?.map(([key, value]) => ({
          ...value,
          key: key,
        }))
      );
      setRegenerateCount(
        response?.data?.topcx_remaining_intelligent_search_count
      );
      setCustomerQuery(response?.data?.topcx_customer_query);
      setCustomerSentiment(response?.data?.topcx_sentiment);

      // Adding entities to searchTagsEntity
      setSearchTagsEntity([]);
      setOgSearchTagsEntity([]);
      response?.data?.topcx_entities.forEach((entity) => {
        setSearchTagsEntity((prevTags) => [...prevTags, entity]);
        setOgSearchTagsEntity((prevTags) => [...prevTags, entity]);
      });

      // Adding aspects to searchTagsAspect
      setSearchTagsAspect([]);
      setOgSearchTagsAspect([]);
      response?.data?.topcx_aspects.forEach((aspect) => {
        setSearchTagsAspect((prevTags) => [...prevTags, aspect]);
        setOgSearchTagsAspect((prevTags) => [...prevTags, aspect]);
      });
    } catch (error) {
      const message =
        error.response?.status >= 500
          ? "Internal Server Error. Please try again later."
          : error.response?.data?.message || "An unexpected error occurred.";
      setErrorMessage(message);
      setHasError(true);
    } finally {
      setIsLoadingResolution(false);
    }
  };
  // const getTooltipContent = (score) => {
  //   const percentage = (score * 100).toFixed(0);
  //   return `We're ${percentage}% confident that this resolution matches your current ticket.`;
  // };

  // // Retrieve and print data from localStorage
  // const storedSubdomain = localStorage.getItem("subdomain");
  // const storedTicketId = localStorage.getItem("ticketId");
  // const storedTicketStatus = localStorage.getItem("ticketStatus");
  // const storedTags = JSON.parse(localStorage.getItem("tags"));
  // const storedComments = JSON.parse(localStorage.getItem("comments"));
  // const storedAssigneeId = localStorage.getItem("assigneeId");
  // const storedRequesterId = localStorage.getItem("requesterId");
  // const storedGroupName = localStorage.getItem("groupName");
  // const storedGroupId = localStorage.getItem("groupId");

  // console.log("Stored Subdomain: ", storedSubdomain);
  // console.log("Stored Ticket ID: ", storedTicketId);
  // console.log("Stored Ticket Status: ", storedTicketStatus);
  // console.log("Stored Tags: ", storedTags);
  // console.log("Stored Comments: ", storedComments);
  // console.log("Stored Assignee ID: ", storedAssigneeId);
  // console.log("Stored Requester ID: ", storedRequesterId);
  // console.log("Stored Group Name: ", storedGroupName);
  // console.log("Stored Group ID: ", storedGroupId);

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
            {/* <IoMdRefresh /> */}
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

          {/* <button
            data-tooltip-id="vector-search"
            type="button"
            className="btn btn-link text-black my-auto p-1 m-0 grow-icon"
            style={{ fontSize: "1.125rem" }}
            disabled={isLoadingResolution || hasError}
            onClick={() => setShowModal(true)}
          >
            <IoSearch />
          </button> */}
          {/* <ReactTooltip
            id="vector-search"
            place="bottom"
            content={`Click to perform a keyword based search for more specific resolutions.`}
            style={{ zIndex: "9999" }}
            delayShow={200}
          /> */}
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
      {showModal && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
          {/* SearchModal */}
          <div
            className="modal fade show"
            id="searchModal"
            tabindex="-1"
            aria-labelledby="searchModalLabel"
            style={{ display: "block" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="d-flex justify-content-between mb-1">
                    <h1 className="modal-title fs-5 mb-2">
                      Entity Aspect Search
                    </h1>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <p className="text-muted" style={{ fontSize: "0.65rem" }}>
                    Tags displayed are based on Historical Ticket Conversation.
                    Please select any more existing tags you feel are relatable
                    to this conversation. These tags help us provide you better
                    resolutions.
                  </p>
                  <div className="input-group mb-3">
                    <span
                      className="input-group-text bg-white border-end-0"
                      id="basic-addon1"
                    >
                      <IoSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      id="search-input"
                      aria-label="enter_query"
                      placeholder="enter tag..."
                      aria-describedby="basic-addon1"
                      autocomplete="off"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        handleInputChange(e);
                      }}
                    />
                    <button
                      data-tooltip-id="clear-all"
                      className="btn btn-danger"
                      onClick={() => {
                        setSearchTagsEntity([]);
                        setSearchTagsAspect([]);
                        setEntitySuggestions([]);
                        setAspectSuggestions([]);
                        setInputValue("");
                      }}
                    >
                      <FaTrashAlt />
                    </button>
                    <ReactTooltip
                      id="clear-all"
                      place="bottom"
                      content={`Click to clear all selected keywords.`}
                      style={{ zIndex: "9999" }}
                      delayShow={200}
                    />
                    <button
                      data-tooltip-id="revert"
                      className="btn btn-warning"
                      onClick={() => {
                        setSearchTagsEntity(ogSearchTagsEntity);
                        setSearchTagsAspect(ogSearchTagsAspect);
                      }}
                    >
                      <IoMdRefresh />
                    </button>
                    <ReactTooltip
                      id="revert"
                      place="bottom"
                      content={`Click to revert back to the original keywords.`}
                      style={{ zIndex: "9999" }}
                      delayShow={200}
                    />
                    <button
                      data-tooltip-id="search-entity-aspect"
                      className="btn btn-success"
                      disabled={
                        searchTagsAspect.length === 0 &&
                        searchTagsEntity.length === 0
                      }
                      onClick={() => {
                        searchResolutions();
                        setShowModal(false);
                      }}
                    >
                      <IoSearch />
                    </button>
                    <ReactTooltip
                      id="search-entity-aspect"
                      place="bottom"
                      content={`Click to search resolutions with the selected keywards.`}
                      style={{ zIndex: "9999" }}
                      delayShow={200}
                    />
                  </div>

                  {searchTagsEntity?.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      className="btn btn-outline-primary p-1 m-1"
                      onClick={() => handleRemoveTags(tag)}
                    >
                      {tag}&nbsp;&nbsp;x
                    </button>
                  ))}
                  {searchTagsAspect?.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      className="btn btn-outline-success p-1 m-1"
                      onClick={() => handleRemoveTags(tag)}
                    >
                      {tag}&nbsp;&nbsp;x
                    </button>
                  ))}
                  <div className="border rounded p-1">
                    {entitySuggestions?.length > 0 && inputValue !== "" && (
                      <div
                        className="list-group list-group-flush"
                        style={{ maxHeight: "120px", overflowY: "scroll" }}
                      >
                        {entitySuggestions?.map((entity, index) => (
                          <button
                            type="button"
                            className="list-group-item list-group-item-action text-primary"
                            key={index}
                            onClick={() => handleTagsEntity(entity)}
                          >
                            {highlightMatch(entity, inputValue)}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* <hr /> */}
                    {aspectSuggestions?.length > 0 && inputValue !== "" && (
                      <div
                        className="list-group list-group-flush"
                        style={{ maxHeight: "120px", overflowY: "scroll" }}
                      >
                        {aspectSuggestions?.map((aspect, index) => (
                          <button
                            type="button"
                            className="list-group-item list-group-item-action text-success"
                            key={index}
                            onClick={() => handleTagsAspect(aspect)}
                          >
                            {highlightMatch(aspect, inputValue)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
