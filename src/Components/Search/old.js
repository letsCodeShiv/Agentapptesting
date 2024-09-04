import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ApiConfig } from "../../Config/ApiConfig";
import { useZafClient } from "../../utils/zafClient";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Loader from "../Loader/Loader";
import { FaLink } from "react-icons/fa6";
import { FaRegClipboard, FaCheck, FaTrashAlt } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { LuFilter } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";

export default function Result() {
  const [errorMessage, setErrorMessage] = useState("");
  const [resolutions, setResolutions] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [noResolution, setNoResolution] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("Search your query...");

  const [entitySuggestions, setEntitySuggestions] = useState([]);
  const [aspectSuggestions, setAspectSuggestions] = useState([]);
  const [searchTagsEntity, setSearchTagsEntity] = useState([]);
  const [searchTagsAspect, setSearchTagsAspect] = useState([]);
  const [ogSearchTagsEntity, setOgSearchTagsEntity] = useState([]);
  const [ogSearchTagsAspect, setOgSearchTagsAspect] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const client = useZafClient();
  const inputRef = useRef(null);

  const fetchData = useCallback(async () => {
    const ticketData = await client?.get?.(["ticket"]);

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const searchData = {
      query: title,
      assignee_id: ticketData?.ticket?.assignee?.user?.id,
      groupName: ticketData?.ticket?.assignee?.group?.name,
    };
    try {
      setIsLoadingResolution(true);
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
      }
    } catch (error) {
      const message =
        error.response?.data?.detail?.masked_error ||
        "An unexpected error occurred.";
      setErrorMessage(message);
      setHasError(true);
    } finally {
      setIsEditing(false);
      setIsLoadingResolution(false);
    }
  }, [client, title]);

  useEffect(() => {
    if (client !== null) {
      const fetchResolutions = async () => {
        setIsLoadingResolution(true);

        // fetch Data from zendesk
        const contextData = await client?.context?.();
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
          feature_name: "searchx",
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

          setTitle(response?.data?.topcx_customer_query);
          fetchData();
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
  }, [client, fetchData]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleKeyPress = async (e) => {
    if (e.key === "Enter") {
      await fetchData();
    }
  };

  const handleInputChange = async (event) => {
    const ticketData = await client?.get?.(["ticket"]);
    const inputValue = event.target.value;
    setInputValue(inputValue);

    const apidata = {
      query: title,
      assignee_id: ticketData?.ticket?.assignee?.user?.id,
      groupName: ticketData?.ticket?.assignee?.group?.name,
      operation: "keyword_search",
      selected_keywords: [...searchTagsEntity, ...searchTagsAspect],
      search_phrase: inputValue,
      max_result_count: 20,
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

      const newSuggestions = response.data.data;
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
    setSearchTagsEntity((prevTags) =>
      prevTags.filter((prevTag) => prevTag !== tag)
    );

    setSearchTagsAspect((prevTags) =>
      prevTags.filter((prevTag) => prevTag !== tag)
    );
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {}
  };

  const searchResolutions = async () => {
    const ticketData = await client?.get?.(["ticket"]);
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const searchData = {
      query: title,
      assignee_id: ticketData?.ticket?.assignee?.user?.id,
      groupName: ticketData?.ticket?.assignee?.group?.name,
      operation: "ticket_search",
      additional_entity: searchTagsEntity,
      additional_aspects: searchTagsAspect,
    };
    setOgSearchTagsEntity(searchTagsEntity);
    setOgSearchTagsAspect(searchTagsAspect);
    try {
      setIsLoadingResolution(true);
      const response = await axios.post(
        ApiConfig.searchResolution,
        searchData,
        config
      );
      if (response.data.data?.length === 0) {
        const message = "Nothing relevant found";
        setErrorMessage(message);
        setNoResolution(true);
      } else {
        setResolutions(response.data.data);
      }
    } catch (error) {
      const message =
        error.response?.data?.detail?.masked_error ||
        "An unexpected error occurred.";
      setErrorMessage(message);
      setHasError(true);
    } finally {
      setIsLoadingResolution(false);
      setSearchTagsAspect([]);
      setSearchTagsEntity([]);
      setIsFilter(false);
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
        <div className="d-flex justify-content-between w-100">
          <button
            data-tooltip-id="regenerate"
            type="button"
            className="btn btn-link text-black my-auto p-0 m-0 grow-icon position-relative ms-3"
            disabled={isLoadingResolution || hasError}
            style={{ fontSize: "1.125rem" }}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <LuPencil className="p-0" />
          </button>
          <ReactTooltip
            id="regenerate"
            place="bottom"
            content={`Click to regenerate resolutions based on the latest ticket information`}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
          {isEditing ? (
            <div
              className="input-group w-75"
              onBlur={(e) => {
                // Check if the related target is not within the current div
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsEditing(false);
                }
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="form-control my-auto"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyPress}
                disabled={isLoadingResolution || hasError}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
              <button
                className="btn btn-success"
                disabled={title.length <= 0}
                onClick={() => {
                  fetchData();
                }}
              >
                <IoSearch />
              </button>
            </div>
          ) : (
            <h6 className="my-auto fw-semibold title-overflow" title={title}>
              {title}
            </h6>
          )}
          <button
            data-tooltip-id="vector-search"
            type="button"
            className="btn btn-link text-black my-auto p-1 m-0 grow-icon me-3"
            style={{ fontSize: "1.125rem" }}
            disabled={
              isLoadingResolution || hasError || resolutions.length <= 0
            }
            onClick={() => setIsFilter((prev) => !prev)}
          >
            <LuFilter />
          </button>
          <ReactTooltip
            id="vector-search"
            place="bottom"
            content={`Click to perform a keyword based search for more specific resolutions.`}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
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
        <>
          {isFilter && (
            <div className="mb-3">
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
                <ReactTooltip
                  id="clear-all"
                  place="bottom"
                  content={`Click to clear all selected keywords.`}
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
                  }}
                >
                  <IoSearch />
                </button>
                <ReactTooltip
                  id="search-entity-aspect"
                  place="bottom"
                  content={`Click to search resolutions with the selected keywords.`}
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

              {(entitySuggestions?.length > 0 ||
                aspectSuggestions?.length > 0) &&
                inputValue !== "" && (
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
                )}
            </div>
          )}
          <div className="accordion accordion-flush" id="accordionFlushExample">
            {resolutions?.map((resolution, index) => (
              <div className="accordion-item mb-2" key={resolution?.link}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed p-2 m-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#flush-collapse${index}`}
                    aria-expanded="false"
                    aria-controls={`flush-collapse${index}`}
                  >
                    <div className="w-100 d-flex justify-content-between">
                      <span className="fw-semibold text-wrap my-auto">
                        {index + 1}. {resolution?.topcx_subject}
                      </span>
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
                      <ReactTooltip
                        id="cross-encoder-score"
                        place="bottom"
                        content={`This is the confidence score of the resolution.`}
                        style={{ zIndex: "9999" }}
                        delayShow={200}
                      />
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
                            onClick={() =>
                              window.open(resolution.link, "_blank")
                            }
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
                            <ReactMarkdown
                              children={resolution?.topcx_resolution}
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ node, children, ...props }) => (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children || "Link"}
                                  </a>
                                ),
                                img: ({ node, ...props }) => (
                                  <img
                                    {...props}
                                    style={{
                                      maxWidth: "100%",
                                      height: "auto",
                                    }}
                                    alt={props.alt}
                                  />
                                ),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p
        className="text-center text-muted m-0 mt-1"
        style={{ fontSize: " 0.5rem" }}
      >
        TopCX can make mistakes. Consider checking important information.
      </p>
    </div>
  );
}
