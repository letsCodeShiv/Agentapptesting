import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Accordion, Modal } from "react-bootstrap";
import { useZafClient } from "../../utils/zafClient";
import axios from "axios";
// import ReactMarkdown from "react-markdown";
import Markdown from "../Helper/MarkdownRenderer";
import Clipboard from "clipboard";
import Loader from "../Loader/Loader";
import { ApiConfig } from "../../Config/ApiConfig";
import { IoInformationCircleOutline } from "react-icons/io5";
import { Tooltip as ReactTooltip } from "react-tooltip";

import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegClipboard,
  FaCheck,
} from "react-icons/fa";

export default function Index() {
  const client = useZafClient();
  // const clientId = client._context?.ticketId;
  const [clientId, setClientId] = useState(null);
  const [accordionData, setAccordionData] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [resolutions2, setResolutions2] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [descriptions2, setDescriptions2] = useState({});
  const [number, setNumber] = useState("");
  const [allCount, setAllCount] = useState(0);
  const [counts, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  const [allCount2, setAllCount2] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");
  const [error2, setError2] = useState("");
  const [error3, setError3] = useState("");
  const [errorbotx, setErrorBotx] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openAccordionIndexes, setOpenAccordionIndexes] = useState([]);
  const [customText, setCustomText] = useState("");
  const [apiStart, setApiStart] = useState("");
  const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  const [botxData, setBotxData] = useState({});

  const [smartResponseUsed, setSmartResponseUsed] = useState({
    describe_what_you_want_count: 0,
    empathize_with_feedback_count: 0,
    request_more_information_count: 0,
    resolve_customer_problem_count: 0,
    suggest_a_call_count: 0,
  });
  const [feedback, setFeedback] = useState({});
  const [copyStatus, setCopyStatus] = useState(false);

  const [tooltipData, setTooltipData] = useState(null);
  const [toolloading, setToolLoading] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);
  const [openIndexes, setOpenIndexes] = useState([]);

  // ............................................................................................Accordion Open

  console.log(clientId, "client");
  useEffect(() => {
    // Retrieve
    const savedKey = localStorage.getItem("activeAccordionKey");
    if (savedKey) {
      setActiveKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (activeKey !== null) {
      localStorage.setItem("activeAccordionKey", activeKey);
    }
  }, [activeKey]);

  // .............................................................................................. Response Store;

  // const storeDescriptions = (apiDescriptions) => {
  //   if (clientId) {
  //     localStorage.setItem(
  //       `apiDescriptions_${clientId}`,
  //       JSON.stringify(apiDescriptions)
  //     );
  //   }
  // };
  // useEffect(() => {
  //   const storedDescriptions = localStorage.getItem("descriptions");
  //   if (storedDescriptions) {
  //     setDescriptions(JSON.parse(storedDescriptions));
  //   }

  //   const storedDescriptions2 = localStorage.getItem("descriptions2");
  //   if (storedDescriptions2) {
  //     setDescriptions2(JSON.parse(storedDescriptions2));
  //   }
  // }, []);
  useEffect(() => {
    // Get ticket ID
    const ticketId = client._context?.ticketId;
    setClientId(ticketId);
    const storedDescriptions = localStorage.getItem(`descriptions_${ticketId}`);
    if (storedDescriptions) {
      setDescriptions(JSON.parse(storedDescriptions));
    }

    const storedDescriptions2 = localStorage.getItem(
      `descriptions2_${ticketId}`
    );
    if (storedDescriptions2) {
      setDescriptions2(JSON.parse(storedDescriptions2));
    }
  }, [client]);

  useEffect(() => {
    if (clientId) {
      localStorage.setItem(
        `descriptions_${clientId}`,
        JSON.stringify(descriptions)
      );
      localStorage.setItem(
        `descriptions2_${clientId}`,
        JSON.stringify(descriptions2)
      );
    }
  }, [descriptions, descriptions2, clientId]);

  // ...............................................................................................

  useEffect(() => {
    if (count2 !== undefined && count2 !== null) {
      setCount(count2);
    }
  }, [count2]);

  const fetchTooltipData = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    setToolLoading(true);
    try {
      const response = await axios.get(ApiConfig.tooltips, config);
      setTooltipData(response?.data?.emailx);
    } catch (error) {
      console.error("Error fetching tooltip data:", error);
      setError(error.response?.data?.detail?.masked_error);
    } finally {
      setToolLoading(false);
    }
  };

  useEffect(() => {
    fetchTooltipData();
  }, []);

  useEffect(() => {
    const fetchBotxData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      setToolLoading(true);
      try {
        const response = await axios.get(ApiConfig.botxDatas, config);
        setBotxData(response?.data?.solution);
      } catch (error) {
        console.error("Error fetching tooltip data:", error);
        setErrorBotx(error.response?.data?.detail?.masked_error);
      } finally {
        setToolLoading(false);
      }
    };

    fetchBotxData();
  }, []);

  const accordionRef = useRef(null);
  useEffect(() => {
    if (accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [error3]);
  useEffect(() => {
    if (accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [error]);

  // useEffect(() => {
  //   fetchData();
  // }, [descriptions, count2]);

  useEffect(() => {}, [resolutions, number, smartResponseUsed]);

  useEffect(() => {
    const fetchAccordionData = async () => {
      setIsLoadingResolution(true);
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      try {
        const response = await axios.get(ApiConfig.smartResponseTypes, config);
        const data = response.data;
        setAccordionData(data?.slice(0, 4));

        const counts = data[data.length - 1];
        const leftCount = counts?.leftCount;
        const totalCount = counts?.totalCount;
        setAllCount(totalCount);
        setCount2(leftCount);
        setCount(leftCount);

        setSmartResponseUsed({
          describe_what_you_want_count: counts?.describe_what_you_want_count,
          empathize_with_feedback_count: counts?.empathize_with_feedback_count,
          request_more_information_count:
            counts?.request_more_information_count,
          resolve_customer_problem_count:
            counts?.resolve_customer_problem_count,
          suggest_a_call_count: counts?.suggest_a_call_count,
        });

        return { success: true };
      } catch (error) {
        console.error("Error fetching accordion data:", error);
        return { success: false, error };
      } finally {
        setIsLoadingResolution(false);
      }
    };
    fetchAccordionData();
  }, []);

  const fetchDescriptionForAccordion = async (
    accordionName,
    index,
    resolveID,
    dataClean
  ) => {
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);

    const location = contextData?.location || "Unknown Location";

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    setLoading(true);
    try {
      if (dataClean) {
        setResolutions([]);
      }
      const response = await axios.post(
        ApiConfig.smartResponse,
        {
          smart_response_type: resolveID ? "TopX" : accordionName,
          conversation:
            location !== "modal"
              ? ticketData?.ticket?.comments
              : JSON.parse(localStorage.getItem("comments")),
          ticket_id:
            location !== "modal"
              ? contextData?.ticketId
              : localStorage.getItem("ticketId"),
          customized_text:
            accordionName === "Describe what you want (customized text)"
              ? customText
              : "",
          flag: true,
          requester_id:
            location !== "modal"
              ? ticketData?.ticket?.requester?.id
              : localStorage.getItem("requesterId"),
          assignee_id:
            location !== "modal"
              ? ticketData?.ticket?.assignee?.user?.id
              : localStorage.getItem("assigneeId"),
        },
        config
      );

      if (dataClean) {
        const responseData = response.data;
        const resolutionsArray = Object.entries(responseData).map(
          ([id, description]) => ({
            id,
            description,
          })
        );
        if (resolveID) {
          setResolutions(resolutionsArray);
        }
      }
      setNumber("");
      const description = response.data.response;
      setDescriptions((prevDescriptions) => ({
        ...prevDescriptions,
        [index]: description,
      }));

      const count = response.data?.count_left;
      setCount2(count);
      const allCount = response.data?.total_count;
      setAllCount2(allCount);

      setSmartResponseUsed((prevCounts) => {
        if (accordionName) {
          const formattedName = accordionName.toLowerCase().replace(/ /g, "_");
          return {
            ...prevCounts,
            [`${formattedName}_count`]:
              (prevCounts[`${formattedName}_count`] || 0) + 1,
          };
        } else {
          console.error("accordionName is null or undefined");
          return prevCounts;
        }
      });
    } catch (error) {
      setNumber("");
      console.error("Error fetching accordion description:", error);
      setError(error.response?.data?.detail?.masked_error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDescriptionForAccordion2 = async (
    accordionName,
    index,
    resolveID,
    dataClean
  ) => {
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);

    const location = contextData?.location || "Unknown Location";
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    setLoading(true);
    try {
      if (dataClean) {
        setResolutions([]);
      }
      const response = await axios.post(
        ApiConfig.smartResponse,
        {
          smart_response_type: resolveID ? "TopX" : accordionName,
          conversation:
            location !== "modal"
              ? ticketData?.ticket?.comments
              : JSON.parse(localStorage.getItem("comments")),
          ticket_id:
            location !== "modal"
              ? contextData?.ticketId
              : localStorage.getItem("ticketId"),
          customized_text:
            accordionName === "Describe what you want (customized text)"
              ? customText
              : "",
          flag: true,
          requester_id:
            location !== "modal"
              ? ticketData?.ticket?.requester?.id
              : localStorage.getItem("requesterId"),
          assignee_id:
            location !== "modal"
              ? ticketData?.ticket?.assignee?.user?.id
              : localStorage.getItem("assigneeId"),
        },
        config
      );

      if (dataClean) {
        const responseData = response.data;
        const resolutionsArray = Object.entries(responseData).map(
          ([id, description]) => ({
            id,
            description,
          })
        );
        if (resolveID) {
          setResolutions(resolutionsArray);
        }
      }
      setNumber("");
      const description = response.data.response;
      setDescriptions((prevDescriptions) => ({
        // const updatedDescriptions = {
        ...prevDescriptions,
        [index]: description,
        // };
        // // Store the updated descriptions in localStorage
        // localStorage.setItem(
        //   "descriptions",
        //   JSON.stringify(updatedDescriptions)
        // );
        // return updatedDescriptions;
      }));

      const count = response.data?.count_left;
      setCount2(count);
      const allCount = response.data?.total_count;
      setAllCount2(allCount);

      setSmartResponseUsed((prevCounts) => {
        if (accordionName) {
          const formattedName = accordionName.toLowerCase().replace(/ /g, "_");
          return {
            ...prevCounts,
            [`${formattedName}_count`]:
              (prevCounts[`${formattedName}_count`] || 0) + 1,
          };
        } else {
          console.error("accordionName is null or undefined");
          return prevCounts;
        }
      });
    } catch (error) {
      setNumber("");
      console.error("Error fetching accordion description:", error);
      setError3(error.response?.data?.detail?.masked_error);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateClick = (accordionName, index) => {
    fetchDescriptionForAccordion(accordionName, index, null, true);
  };
  const handleThumbsUp = (index, description) => {
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      [index]: { thumbsUp: true, thumbsDown: false, description },
    }));
  };

  const handleThumbsDown = (index, description) => {
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      [index]: { thumbsUp: false, thumbsDown: true, description },
    }));
  };
  const handleGenerateClick3 = (accordionName, index) => {
    fetchDescriptionForAccordion2(accordionName, index, null, true);
    setShowGeneratedContent(true);
  };

  // .......................................Modal API

  const fetchDescriptionForModalAccordion = async (
    accordionName,
    index,
    resolveID,
    dataClean
  ) => {
    const contextData = await client?.context?.();
    const ticketData = await client?.get?.(["ticket"]);

    const location = contextData?.location || "Unknown Location";
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    setLoading(true);
    setModalLoading(true);
    try {
      if (dataClean) {
        setResolutions2([]);
      }
      const response = await axios.post(
        ApiConfig.smartResponse,
        {
          smart_response_type: resolveID ? "TopX" : accordionName,
          resolution_number: resolveID ? resolveID?.toString() : number,
          conversation:
            location !== "modal"
              ? ticketData?.ticket?.comments
              : JSON.parse(localStorage.getItem("comments")),
          ticket_id:
            location !== "modal"
              ? contextData?.ticketId
              : localStorage.getItem("ticketId"),
          customized_text:
            accordionName === "Describe what you want (customized text)"
              ? customText
              : "",
          flag: true,
          requester_id:
            location !== "modal"
              ? ticketData?.ticket?.requester?.id
              : localStorage.getItem("requesterId"),
          assignee_id:
            location !== "modal"
              ? ticketData?.ticket?.assignee?.user?.id
              : localStorage.getItem("assigneeId"),
        },
        config
      );

      if (dataClean) {
        const responseData = response.data;
        const resolutionsArray = Object.entries(responseData).map(
          ([id, description]) => ({
            id,
            description,
          })
        );
        setResolutions2(resolutionsArray);
      }
      setNumber("");
      const description = response.data.response;
      if (description !== undefined) {
        setDescriptions2({
          // const updatedDescriptions = {
          ...descriptions2,
          [index]: description,
          // };
          // // Store the updated descriptions in localStorage
          // localStorage.setItem(
          //   "descriptions2",
          //   JSON.stringify(updatedDescriptions)
          // );
          // return updatedDescriptions;
        });
      }

      const count = response.data?.count_left;
      setCount2(count);
      const allCount = response.data?.total_count;
      setAllCount2(allCount);
    } catch (error) {
      setNumber("");
      console.error("Error fetching accordion description:", error);
      setError2(error.response?.data?.detail?.masked_error);
    } finally {
      setLoading(false);
      setModalLoading(false);
    }
  };

  const handleGenerateClick2 = (accordionName, index) => {
    fetchDescriptionForModalAccordion(accordionName, index, null, true);
  };

  // .................................Modal API END
  const renderAccordionItem = (item, index) => {
    const handleToggle = () => {
      if (activeKey === index.toString()) {
        setActiveKey(null);
      } else {
        setActiveKey(index.toString());
      }
    };
    // const handleToggle = (index) => {
    //   let updatedIndexes = [];

    //   if (openIndexes.includes(index)) {
    //     // Highlighted
    //     // **If the index is already open, close it**
    //     updatedIndexes = openIndexes.filter((i) => i !== index); // Highlighted
    //   } else {
    //     // **If the index is closed, open it**
    //     updatedIndexes = [...openIndexes, index]; // Highlighted
    //   }

    //   setOpenIndexes(updatedIndexes); // Highlighted
    //   localStorage.setItem(
    //     "openAccordionIndexes",
    //     JSON.stringify(updatedIndexes)
    //   ); // Highlighted
    // };
    const copyToClipboard = async (description) => {
      try {
        await navigator.clipboard.writeText(description);
        setCopyStatus(true);
        setTimeout(() => {
          setCopyStatus(false);
        }, 1500);
      } catch (err) {}
    };

    const getTooltipContent = (item) => {
      switch (item) {
        case "Suggest a call":
          return tooltipData?.emailx_suggest_a_call;
        case "Request more information":
          return tooltipData?.emailx_request_more_information;
        case "Empathize with feedback":
          return tooltipData?.emailx_empathize_with_feedback;
        default:
          return "";
      }
    };
    return (
      <Accordion.Item eventKey={index.toString()} key={index}>
        <Accordion.Header
          onClick={() => handleToggle(index)}
          data-tooltip-id={`accordion-tooltip-${index}`}
          data-tip
          data-for={`accordion-tooltip-${index}`}
        >
          {typeof item === "string" ? item : Object.keys(item)[0]}
        </Accordion.Header>
        <ReactTooltip
          id={`accordion-tooltip-${index}`}
          place="bottom"
          content={typeof item === "string" ? getTooltipContent(item) : ""}
          style={{ zIndex: 9999 }}
          delayShow={500}
        />
        <Accordion.Body>
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {counts === 0 && (
                <div
                  style={{
                    fontSize: "14px",
                  }}
                >
                  <p>{tooltipData?.emailx_quota_reached}</p>
                </div>
              )}
              <div className="text-end d-flex gap-1 mb-2">
                <Button
                  style={{ background: "#ec5336", borderColor: "white" }}
                  type="button"
                  onClick={() => handleToggle(index)}
                >
                  {isGenerating ? "Generating...." : "Cancel"}
                </Button>
                <Button
                  // variant="success"
                  style={{ background: "#569445", borderColor: "white" }}
                  type="button"
                  onClick={() => handleGenerateClick(item, index)}
                  disabled={counts === 0}
                  data-tip
                  data-for="counts1"
                >
                  {isGenerating ? "Generating...." : "Generate"}
                </Button>
              </div>
            </div>

            {loading ? (
              <span
                style={{
                  width: "100% !important",
                  height: "auto",
                  border: "1px solid grey",
                  borderRadius: "8px",
                  padding: "5px",
                  backgroundColor: "#f2f4f4",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div style={{ height: "20vh !important" }}>
                  <Loader />
                </div>
              </span>
            ) : descriptions[index] !== undefined ? (
              <div
                style={{
                  width: "99%",
                  height: "auto",
                  border: "1px solid grey",
                  borderRadius: "8px",
                  padding: "5px",
                  backgroundColor: "#f2f4f4",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    padding: "0px 10px 0px 10px",
                    alignItems: "center",
                    borderRadius: "8px",
                  }}
                >
                  <Button
                    variant=""
                    className="btn copy-btn"
                    // style={{
                    //   boxShadow: "0px 2px 4px rgba(2, 2, 0, 0.4)",
                    //   cursor: "pointer",
                    //   background: "#f9f9f9",
                    // }}
                    onClick={(event) =>
                      copyToClipboard(descriptions[`${index}`], event)
                    }
                    data-tooltip-id="copy"
                  >
                    <ReactTooltip
                      id="copy"
                      place="bottom"
                      style={{ zIndex: "9999" }}
                      delayShow={500}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          maxWidth: "400px",
                        }}
                      >
                        <p>{tooltipData?.emailx_copy}</p>
                      </div>
                    </ReactTooltip>
                    {copyStatus ? <FaCheck /> : <FaRegClipboard />}
                  </Button>
                </div>
                {/* <ReactMarkdown>{descriptions[index]}</ReactMarkdown> */}
                <Markdown markdown={descriptions[index]} />
              </div>
            ) : (
              error && (
                <p style={{ fontSize: "16px", color: "#e92424" }}>
                  <span
                    style={{
                      width: "100% !important",
                      height: "auto",
                      border: "1px solid grey",
                      borderRadius: "8px",
                      padding: "5px",
                      backgroundColor: "#f2f4f4",
                      display: "flex",
                    }}
                  >
                    {error}{" "}
                  </span>{" "}
                </p>
              )
            )}
          </>
        </Accordion.Body>
      </Accordion.Item>
    );
  };
  const renderAccordionItem2 = (item, index) => {
    const handleToggle = () => {
      if (activeKey === `${index}-parent`) {
        setActiveKey(null);
      } else {
        setActiveKey(`${index}-parent`);
      }
    };

    const key = Object.keys(item)[0];
    const subItems = item[key];

    const closeModal = () => {
      setShowModal(false);
    };

    const copyToClipboard = async (description) => {
      try {
        await navigator.clipboard.writeText(description);
        setCopyStatus(true);
        setTimeout(() => {
          setCopyStatus(false);
        }, 1500);
      } catch (err) {}
    };

    const toggleAccordion2 = (index, subIndex, name) => {
      if (name === "TopX") {
        setShowModal(true);
        fetchDescriptionForModalAccordion(name, index, null, true);
        setNumber("");
      }
      // if (!isNaN(subIndex)) {
      //   setNumber(subIndex);
      // }
      setOpenAccordionIndexes((prevIndexes) =>
        prevIndexes.includes(index)
          ? prevIndexes.filter((i) => i !== index)
          : [...prevIndexes, index]
      );
    };
    return (
      <Accordion.Item eventKey={`${index}-parent`} key={index}>
        <Accordion.Header onClick={handleToggle} data-tooltip-id="TopX">
          {key}
          <ReactTooltip
            id="TopX"
            place="bottom"
            content={`Write an email based on custom user instructions.`}
            style={{ zIndex: "9999" }}
            delayShow={500}
          >
            <div
              style={{
                fontSize: "12px",
                wordWrap: "break-word",
                whiteSpace: "normal",
                maxWidth: "300px",
              }}
            >
              <p>{tooltipData?.emailx_resolve_customer_problem}</p>
            </div>
          </ReactTooltip>
        </Accordion.Header>
        <Accordion.Body>
          <Accordion>
            {subItems.map((subItem, subIndex) => (
              <Accordion.Item
                className="mb-2"
                eventKey={`${index}-${subIndex}`}
              >
                <Accordion.Header
                  onClick={() => toggleAccordion2(index, subIndex, subItem)}
                >
                  {subItem}
                </Accordion.Header>
                <Accordion.Body>
                  {subItem === "BotX" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {counts === 0 && (
                          <div
                            style={{
                              fontSize: "14px",
                            }}
                          >
                            <p>{tooltipData?.emailx_quota_reached}</p>
                          </div>
                        )}
                        <div className="text-end d-flex gap-1 mb-2">
                          <Button
                            style={{
                              background: "#ec5336",
                              borderColor: "white",
                            }}
                            type="button"
                            onClick={handleToggle}
                          >
                            {isGenerating ? "Generating....." : "Cancel"}
                          </Button>
                          <Button
                            // variant="success"
                            style={{
                              background: "#569445",
                              borderColor: "white",
                            }}
                            type="button"
                            onClick={() => handleGenerateClick3(subItem, index)}
                            disabled={counts === 0}
                            data-tip
                            data-for="counts2"
                          >
                            {isGenerating ? "Generating....." : "Generate"}
                          </Button>
                        </div>
                        {counts === 0 && (
                          <ReactTooltip
                            id="counts2"
                            place="bottom"
                            style={{ zIndex: "9999" }}
                            delayShow={500}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                maxWidth: "300px",
                              }}
                            >
                              <p>{tooltipData?.emailx_quota_reached}</p>
                            </div>
                          </ReactTooltip>
                        )}
                      </div>
                      {showGeneratedContent && (
                        <>
                          {loading ? (
                            <span
                              ref={accordionRef}
                              style={{
                                width: "100% !important",
                                height: "auto",
                                border: "1px solid grey",
                                borderRadius: "8px",
                                padding: "5px",
                                backgroundColor: "#f2f4f4",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Loader />
                            </span>
                          ) : descriptions[index] !== undefined ? (
                            <div
                              ref={accordionRef}
                              style={{
                                width: "99%",
                                height: "auto",
                                border: "1px solid grey",
                                borderRadius: "8px",
                                padding: "5px",
                                backgroundColor: "#f2f4f4",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "end",
                                  padding: "0px 10px 0px 10px",
                                  alignItems: "center",
                                  borderRadius: "8px",
                                }}
                              >
                                <Button
                                  variant=""
                                  className="btn copy-btn"
                                  // style={{
                                  //   boxShadow: "0px 2px 4px rgba(2, 2, 0, 0.4)",
                                  //   cursor: "pointer",
                                  //   background: "#f9f9f9",
                                  // }}
                                  onClick={(event) =>
                                    copyToClipboard(
                                      descriptions[`${index}`],
                                      event
                                    )
                                  }
                                  data-tooltip-id="copy2"
                                >
                                  {copyStatus ? (
                                    <FaCheck />
                                  ) : (
                                    <FaRegClipboard />
                                  )}
                                  <ReactTooltip
                                    id="copy2"
                                    place="bottom"
                                    style={{ zIndex: "9999" }}
                                    delayShow={500}
                                  >
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        wordWrap: "break-word",
                                        whiteSpace: "normal",
                                        maxWidth: "400px",
                                      }}
                                    >
                                      <p>{tooltipData?.emailx_copy}</p>
                                    </div>
                                  </ReactTooltip>
                                </Button>
                              </div>
                              {/* <ReactMarkdown>{descriptions[index]}</ReactMarkdown>; */}
                              <Markdown markdown={descriptions[index]} />
                            </div>
                          ) : (
                            error3 && (
                              <p style={{ fontSize: "16px", color: "#e92424" }}>
                                <span
                                  style={{
                                    width: "100% !important",
                                    height: "auto",
                                    border: "1px solid grey",
                                    borderRadius: "8px",
                                    padding: "5px",
                                    backgroundColor: "#f2f4f4",
                                    display: "flex",
                                  }}
                                >
                                  {error3}
                                </span>
                              </p>
                            )
                          )}
                        </>
                      )}

                      {!showGeneratedContent && (
                        <>
                          <span
                            style={{
                              color: "red",
                              display: "flex",
                              justifyContent: "center",
                              marginBottom: "10px",
                            }}
                          >
                            Below is last response from BOTX
                          </span>
                          {errorbotx ? (
                            <p
                              style={{
                                fontSize: "16px",
                                color: "#e92424",
                              }}
                            >
                              <span
                                style={{
                                  width: "100% !important",
                                  height: "auto",
                                  border: "1px solid grey",
                                  borderRadius: "8px",
                                  padding: "5px",
                                  backgroundColor: "#f2f4f4",
                                  display: "flex",
                                }}
                              >
                                {errorbotx}
                              </span>
                            </p>
                          ) : (
                            <span
                              ref={accordionRef}
                              style={{
                                width: "100% !important",
                                height: "auto",
                                border: "1px solid grey",
                                borderRadius: "8px",
                                padding: "5px",
                                backgroundColor: "#f2f4f4",
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                              }}
                            >
                              <Markdown markdown={botxData} />
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                      {loading ? (
                        "Loading....."
                      ) : resolutions2.length > 0 ? (
                        <Modal.Title>TopX </Modal.Title>
                      ) : (
                        <p style={{ fontSize: "16px", color: "#e92424" }}>
                          {error2}
                        </p>
                      )}
                    </Modal.Header>
                    <Modal.Body>
                      <Accordion>
                        {resolutions2.map((item, subIndexs) => (
                          <Accordion.Item
                            className="mb-2"
                            eventKey={`${index}-${subIndex}-${subIndexs}`}
                          >
                            <Accordion.Header
                              className="mx-2"
                              onClick={() =>
                                toggleAccordion2(
                                  index,
                                  subIndexs,
                                  item.description
                                )
                              }
                            >
                              <p>{item.description}</p>
                            </Accordion.Header>

                            <Accordion.Body>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {counts === 0 && (
                                  <div
                                    style={{
                                      fontSize: "14px",
                                    }}
                                  >
                                    <p>{tooltipData?.emailx_quota_reached}</p>
                                  </div>
                                )}
                                <div className="text-end d-flex gap-1 mb-2">
                                  <Button
                                    // variant="success"
                                    style={{
                                      background: "#569445",
                                      borderColor: "white",
                                    }}
                                    type="button"
                                    onClick={() =>
                                      fetchDescriptionForModalAccordion(
                                        null,
                                        subIndexs,
                                        subIndexs + 1,
                                        null
                                      )
                                    }
                                    disabled={counts === 0}
                                    data-tip
                                    data-for="counts3"
                                  >
                                    {isGenerating
                                      ? "Generating....."
                                      : "Generate"}
                                  </Button>
                                </div>
                                {counts === 0 && (
                                  <ReactTooltip
                                    id="counts3"
                                    place="bottom"
                                    style={{ zIndex: "9999" }}
                                    delayShow={500}
                                  >
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        wordWrap: "break-word",
                                        whiteSpace: "normal",
                                        maxWidth: "300px",
                                      }}
                                    >
                                      <p>{tooltipData?.emailx_quota_reached}</p>
                                    </div>
                                  </ReactTooltip>
                                )}
                              </div>

                              {modalLoading ? (
                                <span
                                  style={{
                                    width: "100% !important",
                                    height: "auto",
                                    border: "1px solid grey",
                                    borderRadius: "8px",
                                    padding: "5px",
                                    backgroundColor: "#f2f4f4",
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <div>
                                    <Loader />
                                  </div>
                                </span>
                              ) : descriptions2[subIndexs] !== undefined ? (
                                <div
                                  ref={accordionRef}
                                  style={{
                                    width: "99%",
                                    height: "auto",
                                    border: "1px solid grey",
                                    borderRadius: "8px",
                                    padding: "5px",
                                    backgroundColor: "#f2f4f4",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "end",
                                      padding: "0px 10px 0px 10px",
                                      alignItems: "center",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <Button
                                      variant=""
                                      className="btn copy-btn"
                                      style={{
                                        boxShadow:
                                          "0px 2px 4px rgba(2, 2, 0, 0.4)",
                                        cursor: "pointer",
                                        background: "#f9f9f9",
                                      }}
                                      onClick={(event) =>
                                        copyToClipboard(
                                          descriptions2[`${index}`],
                                          event
                                        )
                                      }
                                      data-tooltip-id="copy3"
                                    >
                                      {copyStatus ? (
                                        <FaCheck />
                                      ) : (
                                        <FaRegClipboard />
                                      )}
                                      <ReactTooltip
                                        id="copy3"
                                        place="bottom"
                                        style={{ zIndex: "9999" }}
                                        delayShow={500}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                            maxWidth: "400px",
                                          }}
                                        >
                                          <p>{tooltipData?.emailx_copy}</p>
                                        </div>
                                      </ReactTooltip>
                                    </Button>
                                  </div>
                                  {/* <ReactMarkdown>
                                    {descriptions2[`${subIndexs}`]}
                                  </ReactMarkdown> */}
                                  <Markdown
                                    markdown={descriptions2[`${subIndexs}`]}
                                  />
                                </div>
                              ) : (
                                error && (
                                  <p
                                    style={{
                                      fontSize: "16px",
                                      color: "#e92424",
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: "100% !important",
                                        height: "auto",
                                        border: "1px solid grey",
                                        borderRadius: "8px",
                                        padding: "5px",
                                        backgroundColor: "#f2f4f4",
                                        display: "flex",
                                      }}
                                    >
                                      {error}
                                    </span>
                                  </p>
                                )
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </Modal.Body>
                  </Modal>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  const copyToClipboard = async (description) => {
    try {
      await navigator.clipboard.writeText(description);
      setCopyStatus(true);
      setTimeout(() => {
        setCopyStatus(false);
      }, 1500);
    } catch (err) {}
  };
  const handleAccordionToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };
  const replacePlaceholders = (template, values) => {
    return template
      .replace(/{total}/g, values.total)
      .replace(/{used}/g, values.used);
  };
  const tooltipContent = replacePlaceholders(tooltipData?.emailx_quota || "", {
    total: allCount2,
    used: count2,
  });
  return (
    // <>
    <div
      className="container-fluid p-1 mt-1 mx-auto"
      style={{
        backgroundColor: "#f2f4f4",
        borderRadius: "5px",
      }}
    >
      <nav className="navbar sticky-top bg-body-tertiary mb-2 p-0">
        <div
          className="d-flex justify-content-center w-100 mx-2 mt-1 mb-1"
          data-tooltip-id="Remaining"
        >
          <h6 className="my-auto fw-bold">
            Remaining&nbsp;<span>{count2 || counts}</span>&nbsp;of&nbsp;
            <span>{allCount2 || allCount}</span>
            <ReactTooltip
              id="Remaining"
              place="bottom"
              style={{ zIndex: "9999" }}
              delayShow={500}
            >
              <div
                style={{
                  fontSize: "12px",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "400px",
                }}
              >
                <p>{tooltipContent}</p>
              </div>
            </ReactTooltip>
          </h6>
        </div>
      </nav>

      {/* </div> */}
      {isLoadingResolution ? (
        <div className="resolution-container">
          <Loader />
        </div>
      ) : (
        <Accordion activeKey={activeKey}>
          {accordionData.map((item, index) =>
            typeof item === "string"
              ? renderAccordionItem(item, index)
              : renderAccordionItem2(item, index)
          )}
          {accordionData.length > 0 && (
            <Accordion.Item eventKey={"4"}>
              <Accordion.Header
                onClick={() => handleAccordionToggle("4")}
                data-tooltip-id="Describe"
              >
                Describe what you want (customized text)
                <ReactTooltip
                  id="Describe"
                  place="bottom"
                  style={{ zIndex: "9999" }}
                  delayShow={500}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                      maxWidth: "300px",
                    }}
                  >
                    <p>{tooltipData?.emailx_describe_what_you_want}</p>
                  </div>
                </ReactTooltip>
              </Accordion.Header>
              <Accordion.Body>
                <>
                  <div
                    ref={accordionRef}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <textarea
                      placeholder="Enter your text"
                      style={{
                        marginBottom: "10px",
                        width: "100%",
                        height: "100px",
                        padding: "5px",
                        resize: "none",
                      }}
                      onChange={(e) => setCustomText(e.target.value)}
                    />
                    {counts === 0 && (
                      <div
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        <p>{tooltipData?.emailx_quota_reached}</p>
                      </div>
                    )}
                    <div className="text-end d-flex gap-1 mb-2">
                      <Button
                        // variant="danger"
                        style={{ background: "#ec5336", borderColor: "white" }}
                        type="button"
                        onClick={() => handleAccordionToggle("4")}
                      >
                        {isGenerating ? "Generating....." : "Cancel"}
                      </Button>
                      <Button
                        // variant="success"
                        style={{ background: "#569445", borderColor: "white" }}
                        type="button"
                        onClick={() =>
                          handleGenerateClick(
                            "Describe what you want (customized text)",
                            4
                          )
                        }
                        disabled={counts === 0}
                        data-tip
                        data-for="counts"
                      >
                        {isGenerating ? "Generating....." : "Generate"}
                      </Button>
                      {counts === 0 && (
                        <ReactTooltip
                          id="counts"
                          place="bottom"
                          style={{ zIndex: "9999" }}
                          delayShow={500}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              maxWidth: "300px",
                            }}
                          >
                            <p>{tooltipData?.emailx_quota_reached}</p>
                          </div>
                        </ReactTooltip>
                      )}
                    </div>
                  </div>
                  {loading ? (
                    <span
                      style={{
                        width: "100% !important",
                        height: "auto",
                        border: "1px solid grey",
                        borderRadius: "8px",
                        padding: "5px",
                        backgroundColor: "#f2f4f4",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div>
                        <Loader />
                      </div>
                    </span>
                  ) : descriptions[4] !== undefined ? (
                    <div
                      ref={accordionRef}
                      style={{
                        width: "99%",
                        height: "auto",
                        border: "1px solid grey",
                        borderRadius: "8px",
                        padding: "5px",
                        backgroundColor: "#f2f4f4",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          padding: "0px 10px 0px 10px",
                          alignItems: "center",
                          borderRadius: "8px",
                        }}
                      >
                        <Button
                          variant=""
                          className="btn copy-btn"
                          // style={{
                          //   boxShadow: "0px 2px 4px rgba(2, 2, 0, 0.4)",
                          //   cursor: "pointer",
                          //   background: "#f9f9f9",
                          // }}
                          onClick={(event) =>
                            copyToClipboard(descriptions[4], event)
                          }
                          data-tooltip-id="copy4"
                        >
                          {copyStatus ? <FaCheck /> : <FaRegClipboard />}
                          <ReactTooltip
                            id="copy4"
                            place="bottom"
                            style={{ zIndex: "9999" }}
                            delayShow={500}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                maxWidth: "400px",
                              }}
                            >
                              <p>{tooltipData?.emailx_copy}</p>
                            </div>
                          </ReactTooltip>
                        </Button>
                      </div>

                      {/* <ReactMarkdown>{descriptions[4]}</ReactMarkdown> */}

                      <Markdown markdown={descriptions[4]} />
                    </div>
                  ) : (
                    error && (
                      <p style={{ fontSize: "16px", color: "#e92424" }}>
                        <span
                          style={{
                            width: "100% !important",
                            height: "auto",
                            border: "1px solid grey",
                            borderRadius: "8px",
                            padding: "5px",
                            backgroundColor: "#f2f4f4",
                            display: "flex",
                          }}
                        >
                          {error}
                        </span>
                      </p>
                    )
                  )}
                </>
              </Accordion.Body>
            </Accordion.Item>
          )}
        </Accordion>
      )}

      <div
        className="mt-1"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div> </div>
        <p
          className="text-center text-muted m-0"
          style={{ fontSize: "0.5rem" }}
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
          style={{ zIndex: "9999" }}
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
            <p>{tooltipData?.emailx_overview}</p>
          </div>
        </ReactTooltip>
        <IoInformationCircleOutline data-tooltip-id="Suggest" />
        {/* </button> */}
      </div>
    </div>
    // </>
  );
}
