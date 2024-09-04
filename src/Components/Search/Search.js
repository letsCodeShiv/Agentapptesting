import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Markdown from "../Helper/MarkdownRenderer";
import { ApiConfig } from "../../Config/ApiConfig";
import { useZafClient } from "../../utils/zafClient";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Loader from "../Loader/Loader";
import { FaLink } from "react-icons/fa6";
import { FaRegClipboard, FaCheck } from "react-icons/fa";
import { LuFilter } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import { VscClearAll } from "react-icons/vsc";
import { RxCross2 } from "react-icons/rx";
import { IoInformationCircleOutline } from "react-icons/io5";
import { SearchXContext } from "../../Context/SearchXContext";
// import debounce from "lodash/debounce";

export default function Result() {
  const {
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
  } = useContext(SearchXContext);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [resolutions, setResolutions] = useState([]);
  // const [hasError, setHasError] = useState(false);
  // const [noResolution, setNoResolution] = useState(false);
  // const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  // const [copied, setCopied] = useState(false);
  // const [title, setTitle] = useState(customerQuery || "Search your query...");;

  // const [entitySuggestions, setEntitySuggestions] = useState([]);
  // const [aspectSuggestions, setAspectSuggestions] = useState([]);
  // const [searchTagsEntity, setSearchTagsEntity] = useState([]);
  // const [searchTagsAspect, setSearchTagsAspect] = useState([]);
  // const [inputValue, setInputValue] = useState("");

  const client = useZafClient();
  const inputRef = useRef(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);

  const fetchTooltipData = useCallback(async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      const response = await axios.get(ApiConfig.tooltips, config);
      setTooltipData(response?.data?.searchx);
    } catch (error) {
      console.error("Error fetching tooltip data:", error);
    }
  }, [setTooltipData]);

  useEffect(() => {
    fetchTooltipData();
  }, [fetchTooltipData]);

  // const fetchData = useCallback(async () => {
  //   const contextData = await client?.context?.();
  //   const ticketData = await client?.get?.(["ticket"]);

  //   const location = contextData?.location || "Unknown Location";
  //   const config = {
  //     headers: { "Access-Control-Allow-Origin": "*" },
  //     withCredentials: true,
  //   };
  //   const searchData = {
  //     query: title,
  //     assignee_id:
  //       location !== "modal"
  //         ? ticketData?.ticket?.assignee?.user?.id
  //         : localStorage.getItem("assigneeId"),
  //     groupName:
  //       location !== "modal"
  //         ? ticketData?.ticket?.assignee?.group?.name
  //         : localStorage.getItem("groupName"),
  //   };
  //   try {
  //     setIsLoadingResolution(true);
  //     setNoResolution(false);
  //     setHasError(false);

  //     const response = await axios.post(
  //       ApiConfig.querySearch,
  //       searchData,
  //       config
  //     );
  //     if (response.data?.length === 0) {
  //       const message = "Nothing relevant found";
  //       setErrorMessage(message);
  //       setNoResolution(true);
  //     } else {
  //       setResolutions(response.data);
  //       setNoResolution(false);
  //     }
  //   } catch (error) {
  //     const message =
  //       error.response?.data?.detail?.masked_error ||
  //       "An unexpected error occurred.";
  //     setErrorMessage(message);
  //     setHasError(true);
  //   } finally {
  //     setIsLoadingResolution(false);
  //   }
  // }, [client, title]);

  // useEffect(() => {
  //   if (client !== null) {
  //     const fetchResolutions = async () => {
  //       setIsLoadingResolution(true);
  //       setNoResolution(false);
  //       setHasError(false);
  //       try {
  //         const contextData = await client?.context?.();
  //         const ticketData = await client?.get?.(["ticket"]);

  //         const location = contextData?.location || "Unknown Location";

  //         const resolutionData = {
  //           subdomain:
  //             location !== "modal"
  //               ? contextData?.account?.subdomain
  //               : localStorage.getItem("subdomain"),
  //           ticketId:
  //             location !== "modal"
  //               ? contextData?.ticketId
  //               : localStorage.getItem("ticketId"),
  //           ticketStatus:
  //             location !== "modal"
  //               ? ticketData?.ticket?.status
  //               : localStorage.getItem("ticketStatus"),
  //           tags:
  //             location !== "modal"
  //               ? ticketData?.ticket?.tags
  //               : JSON.parse(localStorage.getItem("tags")),
  //           comments:
  //             location !== "modal"
  //               ? ticketData?.ticket?.comments
  //               : JSON.parse(localStorage.getItem("comments")),
  //           assignee_id:
  //             location !== "modal"
  //               ? ticketData?.ticket?.assignee?.user?.id
  //               : localStorage.getItem("assigneeId"),
  //           requester_id:
  //             location !== "modal"
  //               ? ticketData?.ticket?.requester?.id
  //               : localStorage.getItem("requesterId"),
  //           groupName:
  //             location !== "modal"
  //               ? ticketData?.ticket?.assignee?.group?.name
  //               : localStorage.getItem("groupName"),
  //           groupId:
  //             location !== "modal"
  //               ? ticketData?.ticket?.assignee?.group?.id
  //               : localStorage.getItem("groupId"),
  //           feature_name: "searchx",
  //         };

  //         const config = {
  //           headers: { "Access-Control-Allow-Origin": "*" },
  //           withCredentials: true,
  //         };

  //         const response = await axios.post(
  //           ApiConfig.getResolution,
  //           resolutionData,
  //           config
  //         );

  //         setTitle(response?.data?.topcx_customer_query);
  //         await fetchData();
  //       } catch (error) {
  //         const message =
  //           error.response?.data?.detail?.masked_error ||
  //           "An unexpected error occurred.";
  //         setErrorMessage(message);
  //         setHasError(true);
  //       } finally {
  //         setIsLoadingResolution(false);
  //       }
  //     };
  //     fetchResolutions();
  //   }
  // }, [client]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsTooltipVisible(false);
  };

  const handleTitleKeyPress = async (e) => {
    if (e.key === "Enter") {
      await fetchData();
    }
  };

  // //Debouncing to prevent redundant api call
  // const debouncedHandleInputChange = useCallback(
  //   debounce((value) => {
  //     handleInputChange(value);
  //   }, 300), // Adjust the debounce delay as needed
  //   []
  // );

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);
    // debouncedHandleInputChange(inputValue);
    handleInputChange(inputValue);
    setIsTooltipVisible(false);
  };

  const handleInputChange = async (inputValue) => {
    const contextData = await client.context();
    const ticketData = await client.get(["ticket"]);

    const location = contextData?.location || "Unknown Location";

    const apidata = {
      query: title,
      assignee_id:
        location !== "modal"
          ? ticketData?.ticket?.assignee?.user?.id
          : localStorage.getItem("assigneeId"),
      groupName:
        location !== "modal"
          ? ticketData?.ticket?.assignee?.group?.name
          : localStorage.getItem("groupName"),
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
    } catch (error) {
      console.error(error);
    }
  };

  const updateResolutions = async (entities, aspects) => {
    const contextData = await client.context();
    const ticketData = await client.get(["ticket"]);

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
      operation: "ticket_search",
      additional_entity: entities,
      additional_aspects: aspects,
    };
    try {
      setIsLoadingResolution(true);
      setNoResolution(false);
      setHasError(false);

      const response = await axios.post(
        ApiConfig.keywordSearch,
        searchData,
        config
      );
      if (response.data.data?.length === 0) {
        const message = "Nothing relevant found";
        setErrorMessage(message);
        setNoResolution(true);
      } else {
        setResolutions(response.data.data);
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
  };

  const handleTagsEntity = async (tag) => {
    const newTags = [...searchTagsEntity, tag];
    setSearchTagsEntity(newTags);
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
    await updateResolutions(newTags, searchTagsAspect);
  };

  const handleTagsAspect = async (tag) => {
    const newTags = [...searchTagsAspect, tag];
    setSearchTagsAspect(newTags);
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
    await updateResolutions(searchTagsEntity, newTags);
  };

  const handleRemoveTags = async (tag) => {
    const newEntityTags = searchTagsEntity.filter((prevTag) => prevTag !== tag);
    const newAspectTags = searchTagsAspect.filter((prevTag) => prevTag !== tag);
    setSearchTagsEntity(newEntityTags);
    setSearchTagsAspect(newAspectTags);
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
    await updateResolutions(newEntityTags, newAspectTags);
  };

  const clearAll = async () => {
    setSearchTagsEntity([]);
    setSearchTagsAspect([]);
    setEntitySuggestions([]);
    setAspectSuggestions([]);
    setInputValue("");
    await updateResolutions([], []);
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
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // Show tooltip on hover
  const handleMouseEnter = () => setIsTooltipVisible(true);

  // Hide tooltip on interaction (focus/blur)
  const handleFocus = () => setIsTooltipVisible(false);
  const handleBlur = () => setIsTooltipVisible(false);

  return (
    <div
      className="container-fluid p-1 mt-1 mx-auto w-100"
      style={{
        backgroundColor: "#f2f2f2",
        borderRadius: "5px",
      }}
    >
      <nav className="navbar sticky-top bg-body-tertiary px-2">
        <div className="d-flex justify-content-center w-100">
          <div className="input-group w-100">
            <span
              className="input-group-text bg-white border-end-0"
              id="basic-addon1"
            >
              <IoSearch />
            </span>
            <input
              ref={inputRef}
              type="text"
              className="form-control my-auto border-start-0"
              placeholder="Search your query..."
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyPress}
              onMouseEnter={handleMouseEnter}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={isLoadingResolution || hasError}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              data-tooltip-id="main-search-input"
            />
            {isTooltipVisible && (
              <ReactTooltip
                id="main-search-input"
                place="bottom"
                content={tooltipData?.main_search_input}
                style={{ zIndex: "9999" }}
                delayShow={200}
              />
            )}
            <button
              className="btn btn-success"
              disabled={title.length <= 0}
              onClick={() => {
                fetchData();
                setIsTooltipVisible(true);
              }}
            >
              Search
            </button>
          </div>
        </div>
      </nav>

      <>
        <div className=" ">
          <div className="d-flex justify-content-center my-2">
            <div className="input-group w-75">
              <span className="input-group-text bg-white border-end-0">
                <LuFilter />
              </span>
              <input
                type="text"
                className="form-control border-start-0 border-end-0"
                id="search-input"
                aria-label="enter_query"
                placeholder="enter tag..."
                aria-describedby="basic-addon1"
                autoComplete="off"
                value={inputValue}
                onChange={(e) => handleChange(e)}
                onMouseEnter={handleMouseEnter}
                onFocus={handleFocus}
                onBlur={handleBlur}
                data-tooltip-id="filter-input"
              />
              {isTooltipVisible && (
                <ReactTooltip
                  id="filter-input"
                  place="bottom"
                  content={tooltipData?.filter_input}
                  style={{ zIndex: "9999" }}
                  delayShow={200}
                />
              )}
              <button
                className="input-group-text bg-white border-start-0"
                onClick={() => setInputValue("")}
              >
                <RxCross2 />
              </button>
            </div>
            <button
              data-tooltip-id="clear-button"
              className="btn mx-3"
              onClick={() => {
                clearAll();
              }}
            >
              <VscClearAll />
            </button>
            <ReactTooltip
              id="clear-button"
              place="bottom"
              content={tooltipData?.clear_button}
              style={{ zIndex: "9999" }}
              delayShow={200}
            />
          </div>
          {searchTagsEntity?.map((tag, index) => (
            <button
              key={index}
              type="button"
              className="btn btn-outline-primary p-0 px-1 m-1"
              onClick={() => handleRemoveTags(tag)}
            >
              {tag}&nbsp;&nbsp;x
            </button>
          ))}
          {searchTagsAspect?.map((tag, index) => (
            <button
              key={index}
              type="button"
              className="btn btn-outline-success p-0 px-1 m-1"
              onClick={() => handleRemoveTags(tag)}
            >
              {tag}&nbsp;&nbsp;x
            </button>
          ))}

          {(entitySuggestions?.length > 0 || aspectSuggestions?.length > 0) &&
            inputValue !== "" && (
              <div className="border rounded p-1 mb-2">
                {entitySuggestions?.length > 0 && inputValue !== "" && (
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: "120px", overflowY: "scroll" }}
                  >
                    {entitySuggestions?.map((entity, index) => (
                      <button
                        type="button"
                        className="list-group-item list-group-item-action text-primary py-2"
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
                    className="list-group list-group-flush "
                    style={{ maxHeight: "120px", overflowY: "scroll" }}
                  >
                    {aspectSuggestions?.map((aspect, index) => (
                      <button
                        type="button"
                        className="list-group-item list-group-item-action text-success py-2"
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
      </>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div> </div>
        <p
          className="text-center text-muted m-0"
          style={{ fontSize: " 0.5rem" }}
        >
          TopCX can make mistakes. Consider checking important information.
        </p>
        {/* <button
          data-tooltip-id="Suggest"
          type="button"
          className="btn btn-link text-black my-auto p-1 m-0 grow-icon"
        > */}
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
            <p>{tooltipData?.searchx_overview}</p>
          </div>
        </ReactTooltip>
        <IoInformationCircleOutline data-tooltip-id="Suggest" />
        {/* </button> */}
      </div>
    </div>
  );
}
