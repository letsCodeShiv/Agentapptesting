import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Accordion, Modal } from "react-bootstrap";
import { useZafClient } from "../../utils/zafClient";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Clipboard from "clipboard";
import Loader from "../Loader/Loader";
import { ApiConfig } from "../../Config/ApiConfig";
import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegClipboard,
  FaCheck,
} from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";

export default function Index() {
  const client = useZafClient();
  console.log(client?._context?.ticketId);
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
  const [showModal, setShowModal] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isLoadingResolution, setIsLoadingResolution] = useState(false);
  const [smartResponseUsed, setSmartResponseUsed] = useState({
    describe_what_you_want_count: 0,
    empathize_with_feedback_count: 0,
    request_more_information_count: 0,
    resolve_customer_problem_count: 0,
    suggest_a_call_count: 0,
  });
  // console.log(smartResponseUsed);
  const [feedback, setFeedback] = useState({});
  const [copyStatus, setCopyStatus] = useState(false);

  const accordionRef = useRef(null);
useEffect(() => {
  const storedDescriptions = localStorage.getItem("descriptions");
  if (storedDescriptions) {
    setDescriptions(JSON.parse(storedDescriptions));
  }

  const storedDescriptions2 = localStorage.getItem("descriptions2");
  if (storedDescriptions2) {
    setDescriptions2(JSON.parse(storedDescriptions2));
  }
}, []);

  
  useEffect(() => {
    if (accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [descriptions2]);
  useEffect(() => {
    if (accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [descriptions]);

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
          smart_response_type: resolveID ? "Resolutions" : accordionName,
          conversation: ticketData?.ticket?.comments,
          ticket_id: contextData?.ticketId,
          customized_text:
            accordionName === "Describe what you want (customized text)"
              ? customText
              : "",
          flag: true,
          requester_id: ticketData?.ticket?.requester?.id || 0,
          assignee_id: ticketData?.ticket?.assignee?.user?.id || 0,
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
      setDescriptions((prevDescriptions) => {
        const updatedDescriptions = {
          ...prevDescriptions,
          [index]: description,
        };
        localStorage.setItem(
          "descriptions",
          JSON.stringify(updatedDescriptions)
        );
        return updatedDescriptions;
      });

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
          smart_response_type: resolveID ? "Resolutions" : accordionName,
          conversation: ticketData?.ticket?.comments,
          ticket_id: contextData?.ticketId,
          customized_text:
            accordionName === "Describe what you want (customized text)"
              ? customText
              : "",
          flag: true,
          requester_id: ticketData?.ticket?.requester?.id || 0,
          assignee_id: ticketData?.ticket?.assignee?.user?.id || 0,
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
      setDescriptions((prevDescriptions) => {
        const updatedDescriptions = {
          ...prevDescriptions,
          [index]: description,
        };
        // Store the updated descriptions in localStorage
        localStorage.setItem(
          "descriptions",
          JSON.stringify(updatedDescriptions)
        );
        return updatedDescriptions;
      });

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
          smart_response_type: resolveID ? "Resolutions" : accordionName,
          resolution_number: resolveID ? resolveID?.toString() : number,
          conversation: ticketData?.ticket?.comments,
          ticket_id: contextData?.ticketId,
          customized_text:
            accordionName === "Describe what you want (customized text)"
              ? customText
              : "",
          flag: true,
          requester_id: ticketData?.ticket?.requester?.id || 0,
          assignee_id: ticketData?.ticket?.assignee?.user?.id || 0,
        },
        config
      );
      console.log();
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
        setDescriptions2((prevDescriptions) => {
          const updatedDescriptions = {
            ...prevDescriptions,
            [index]: description,
          };
          // Store the updated descriptions in localStorage
          localStorage.setItem(
            "descriptions2",
            JSON.stringify(updatedDescriptions)
          );
          return updatedDescriptions;
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

    const copyToClipboard = async (description) => {
      try {
        await navigator.clipboard.writeText(description);
        setCopyStatus(true);
        setTimeout(() => {
          setCopyStatus(false);
        }, 1500);
      } catch (err) {}
    };

    const getMessage = (item) => {
      switch (item) {
        case "Suggest a call":
          return smartResponseUsed.suggest_a_call_count > 0
            ? `Suggest a call has been used ${smartResponseUsed.suggest_a_call_count} times. Do you want to use it again?`
            : `You haven't used Suggest a call yet. Are you sure you want to use it now?`;
        case "Request more information":
          return smartResponseUsed.request_more_information_count > 0
            ? `Request more information has been used ${smartResponseUsed.request_more_information_count} times. Do you want to use it again?`
            : `You haven't used Request more information yet. Are you sure you want to use it now?`;
        case "Empathize with feedback":
          return smartResponseUsed.empathize_with_feedback_count > 0
            ? `Empathize with feedback has been used ${smartResponseUsed.empathize_with_feedback_count} times. Do you want to use it again?`
            : `You haven't used Empathize with feedback yet. Are you sure you want to use it now?`;
        default:
          return "";
      }
    };

    const getTooltipContent = (item) => {
      switch (item) {
        case "Suggest a call":
          return "Request the customer to schedule a call for issue resolution.";
        case "Request more information":
          return "Request the customer to share more details about the issue they are facing.";
        case "Empathize with feedback":
          return "Write an email to empathize with the customer's feedback.";
        default:
          return "";
      }
    };

    return (
      <Accordion.Item eventKey={index.toString()} key={index}>
        <Accordion.Header
          onClick={handleToggle}
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
          delayShow={200}
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
              <p>{typeof item === "string" ? getMessage(item) : ""}</p>
              <div className="text-end d-flex gap-1 mb-2">
                <Button
                  style={{ background: "#ec5336", borderColor: "white" }}
                  type="button"
                  onClick={handleToggle}
                >
                  {isGenerating ? "Generating...." : "Cancel"}
                </Button>
                <Button
                  style={{ background: "#569445", borderColor: "white" }}
                  type="button"
                  onClick={() => handleGenerateClick(item, index)}
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
                    onClick={(event) =>
                      copyToClipboard(descriptions[`${index}`], event)
                    }
                  >
                    {copyStatus ? <FaCheck /> : <FaRegClipboard />}
                  </Button>
                </div>
                <ReactMarkdown>{descriptions[index]}</ReactMarkdown>
              </div>
            ) : (
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
      if (name === "Resolutions") {
        setShowModal(true);
        fetchDescriptionForModalAccordion(name, index, null, true);
        setNumber("");
      }
      if (!isNaN(subIndex)) {
        setNumber(subIndex);
      }
    };
    return (
      <Accordion.Item eventKey={`${index}-parent`} key={index}>
        <Accordion.Header onClick={handleToggle} data-tooltip-id="Resolutions">
          {key}
          <ReactTooltip
            id="Resolutions"
            place="bottom"
            content={`Write an email providing a solution from TopX resolutions or Bot solutions.`}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
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
                  {subItem === "Ask AI" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {smartResponseUsed.resolve_customer_problem_count >
                        0 ? (
                          <p>
                            Ask AI has been used{" "}
                            {smartResponseUsed?.resolve_customer_problem_count}
                            times. Do you want to use it again?
                          </p>
                        ) : (
                          <p>
                            You haven't used Ask AI yet. Are you sure you want
                            to use it now?
                          </p>
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
                          >
                            {isGenerating ? "Generating....." : "Generate"}
                          </Button>
                        </div>
                      </div>

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
                                copyToClipboard(descriptions[`${index}`], event)
                              }
                            >
                              {copyStatus ? <FaCheck /> : <FaRegClipboard />}
                            </Button>
                          </div>
                          <ReactMarkdown>{descriptions[index]}</ReactMarkdown>;
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
                  <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                      {loading ? (
                        "Loading....."
                      ) : resolutions2.length > 0 ? (
                        <Modal.Title>Resolutions</Modal.Title>
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
                                        index,
                                        subIndexs + 1,
                                        null
                                      )
                                    }
                                  >
                                    {isGenerating
                                      ? "Generating....."
                                      : "Generate"}
                                  </Button>
                                </div>
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
                              ) : descriptions2[index] !== undefined ? (
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
                                          descriptions2[`${index + 1}`],
                                          event
                                        )
                                      }
                                    >
                                      {copyStatus ? (
                                        <FaCheck />
                                      ) : (
                                        <FaRegClipboard />
                                      )}
                                    </Button>
                                  </div>
                                  <ReactMarkdown>
                                    {descriptions2[index + 1]}
                                  </ReactMarkdown>
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

  return (
    <>
      <div
        className="container-fluid p-1 mt-1 mx-auto"
        style={{
          backgroundColor: "#f2f4f4",
          borderRadius: "5px",
        }}
      >
        <nav className="navbar sticky-top mb-2 p-0">
          <div className="d-flex justify-content-center w-100 mx-2 mt-1 mb-1">
            <h6 className="my-auto fw-bold" data-tooltip-id="Remaining">
              Remaining&nbsp;<span>{count2 || counts}</span>&nbsp;of&nbsp;
              <ReactTooltip
                id="Remaining"
                place="bottom"
                content={`Shows today's email generation limit and remaining count for email generation.`}
                style={{ zIndex: "9999" }}
                delayShow={200}
              />
              <span>{allCount2 || allCount}</span>
            </h6>
          </div>
        </nav>
      </div>
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
                onClick={() => {
                  if (activeKey === "4") {
                    setActiveKey(null);
                  } else {
                    setActiveKey("4");
                  }
                }}
                data-tooltip-id="Describe"
              >
                Describe what you want (customized text)
                <ReactTooltip
                  id="Describe"
                  place="bottom"
                  content={`Write an email based on custom user instructions.`}
                  style={{ zIndex: "9999" }}
                  delayShow={200}
                />
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
                    {smartResponseUsed.describe_what_you_want_count > 0 ? (
                      <p>
                        Describe what you want (customized text) has been used{" "}
                        {smartResponseUsed?.describe_what_you_want_count} times.
                        Do you want to use it again?
                      </p>
                    ) : (
                      <p>
                        You haven't used Describe what you want (customized
                        text) yet. Are you sure you want to use it now?
                      </p>
                    )}
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
                    <div className="text-end d-flex gap-1 mb-2">
                      <Button
                        // variant="danger"
                        style={{ background: "#ec5336", borderColor: "white" }}
                        type="button"
                        onClick={() => {
                          if (activeKey === "4") {
                            setActiveKey(null);
                          } else {
                            setActiveKey("4");
                          }
                        }}
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
                      >
                        {isGenerating ? "Generating....." : "Generate"}
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
                        >
                          {copyStatus ? <FaCheck /> : <FaRegClipboard />}
                        </Button>
                      </div>

                      <ReactMarkdown>{descriptions[4]}</ReactMarkdown>
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

      <p
        className="text-center text-muted m-0 mt-1"
        style={{ fontSize: "0.5rem" }}
      >
        TopCX can make mistakes. Consider checking important information.
      </p>
    </>
  );
}
