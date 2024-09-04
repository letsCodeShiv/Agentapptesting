import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import ResolutionScreen from "./Resolution/ResolutionScreen";
import Search from "./Search/Search";
import Chatbot from "./Chatbot/Chatbot";
import SmartResponse from "./SmartResponse/SmartResponse";
import {
  BsEmojiExpressionless,
  BsEmojiAngry,
  BsEmojiAstonished,
  BsEmojiSmile,
  BsEmojiGrin,
} from "react-icons/bs";
import { RiQuestionLine } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { TicketContext } from "../Context/TicketContext";
import { Container } from "react-bootstrap";
import AgentAnalysisModal from "./AnalysisModal/AgentAnalysisModal";
import { ApiConfig } from "../Config/ApiConfig";
import { useZafClient } from "../utils/zafClient";
import axios from "axios";
import { useThirdPartyCookieCheck } from "../hooks/useThirdPartyCookieCheck";
import { Modal, Button } from "react-bootstrap";
import Loader from "./Loader/Loader";
import ExpandModal from "./ExpandModal/ExpandModal";
import { ChatbotContext } from "../Context/ChatBotContext";

export default function Navtab() {
  const {
    customerQuery,
    customerSentiment,
    setCustomerQuery,
    setCustomerSentiment,
  } = useContext(TicketContext);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Resolution");
  const client = useZafClient();

  //chatbot
  const { setIsStreaming } = useContext(ChatbotContext);

  const [areCookiesEnabled, setAreCookiesEnabled] = useState(null); // Initialize as null
  const cookieCheck = useThirdPartyCookieCheck();

  const [appLocation, setAppLocation] = useState("");

  useEffect(() => {
    if (cookieCheck !== null) {
      // Check if cookie status is determined
      setAreCookiesEnabled(cookieCheck);
    }
  }, [cookieCheck]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName !== "Chatbot") {
      setIsStreaming(false);
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [analysisData, setAnalysisData] = useState({
    ticketsData: null,
    csrData: null,
    nrrData: null,
  });

  useEffect(() => {
    if (client !== null) {
      const fetchChats = async () => {
        const currentUser = await client?.get?.(["currentUser"]);
        fetchAgentAnalysisData(currentUser?.currentUser?.id);
      };
      fetchChats();

      const fetchTicketData = async () => {
        try {
          const contextData = await client?.context?.();
          const ticketData = await client?.get?.(["ticket"]);
          const location = contextData?.location || "Unknown Location";
          setAppLocation(location);

          const resolutionData = {
            subdomain: contextData?.account?.subdomain,
            ticketId: contextData?.ticketId,
            ticketStatus: ticketData?.ticket?.status,
            tags: ticketData?.ticket?.tags,
            comments: ticketData?.ticket?.comments,
            assignee_id: ticketData?.ticket?.assignee?.user?.id,
            requester_id: ticketData?.ticket?.requester?.id,
            groupName: ticketData?.ticket?.assignee?.group?.name,
            groupId: ticketData?.ticket?.assignee?.group?.id,
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

          setCustomerQuery(response?.data?.topcx_customer_query);
          setCustomerSentiment(response?.data?.topcx_sentiment);
        } catch (error) {}
      };
      fetchTicketData();
    }
  }, [client, setCustomerQuery, setCustomerSentiment]);

  const fetchAgentAnalysisData = async (agentId) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const payload = {
      global_filter: {
        selected_agents: [agentId],
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      },
      group_by: "zendesk",
      period: "M",
    };

    try {
      const response = await axios.post(
        ApiConfig.agentAnalyticsUrl,
        payload,
        config
      );

      const { data } = response;

      setAnalysisData({
        ticketsData: data["Total tickets solved"],
        csrData: data["Customer Satisfaction Rate (mean)"],
        nrrData: data["Negative Response Rate(NRR) (mean)"],
      });
    } catch (error) {
      console.error("Error fetching analysis data", error);
      setAnalysisData({
        ticketsData: null,
        csrData: null,
        nrrData: null,
      });
    }
  };

  const sentimentMapping = {
    "Very Positive": <BsEmojiGrin className="text-success fs-5" />,
    Positive: <BsEmojiSmile className="text-success-emphasis fs-5" />,
    Neutral: <BsEmojiExpressionless className="text-warning fs-5" />,
    Negative: <BsEmojiAstonished className="text-danger-emphasis fs-5" />,
    "Very Negative": <BsEmojiAngry className="text-danger fs-5" />,
  };
  const defaultSentimentIcon = <RiQuestionLine className="fs-5" />;
  let sentimentIcon =
    sentimentMapping[customerSentiment] || defaultSentimentIcon;

  if (areCookiesEnabled === null) {
    // Render a loading or placeholder UI while checking for cookies
    return (
      <div className="alert alert-danger" role="alert">
        <Loader />
      </div>
    );
  }

  if (!areCookiesEnabled) {
    return (
      <div className="alert alert-danger" role="alert">
        <Modal show={true} onHide={() => {}} size="sm" centered>
          <Modal.Body className="text-center">
            <p>
              Third-party cookies are disabled. Please enable them and reload
              the page.
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Reload
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header p-0 m-0">
        <Container
          fluid
          className="rounded-top bg-white overflow-hidden p-0 d-flex justify-content-between"
        >
          <span className="my-auto p-2">
            <MdOutlineAnalytics
              data-tooltip-id="performance-icon"
              className="grow-icon"
              onClick={handleShow}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                width: "30px",
                height: "30px",
              }}
            />
          </span>
          <div className="w-75">
            <p
              data-tooltip-id="customer-query"
              className="my-auto px-3 text-center"
              id="customerQuery"
            >
              {customerQuery}
            </p>
            <nav className="navbar sticky-top bg-body-tertiary d-flex justify-content-center p-0 rounded rounded-pill">
              <h6
                data-tooltip-id="sentiment"
                className="p-0 px-3 m-0 my-auto"
                id="chat-heading"
              >
                Customer's Sentiment: {sentimentIcon}
              </h6>
            </nav>
          </div>
          <span className="my-auto p-2">
            {appLocation !== "modal" ? <ExpandModal /> : <></>}
          </span>
        </Container>

        {customerQuery && (
          <ReactTooltip
            style={{ zIndex: "9999" }}
            id="customer-query"
            place="bottom"
            content={`This is the customer's query`}
          />
        )}

        <ReactTooltip
          id="performance-icon"
          place="top"
          content={`My Performance`}
          style={{ zIndex: "9999" }}
        />
        {customerSentiment && (
          <ReactTooltip
            id="sentiment"
            place="bottom"
            content={`The customer is feeling "${customerSentiment}" based on their query.`}
            style={{ zIndex: "9999" }}
          />
        )}
        {/* <nav className="navbar sticky-top bg-body-tertiary d-flex justify-content-center p-0">
          <h6
            data-tooltip-id="sentiment"
            className="p-0 m-0 my-auto"
            id="chat-heading"
          >
            Customer's Sentiment: {sentimentIcon}
          </h6>
        </nav> */}
      </div>
      <div className="card-body">
        <ul className="nav nav-underline nav-fill">
          <li className="nav-item" data-tooltip-id="TopX">
            <Link
              className={`nav-link ${
                activeTab === "Resolution" ? "active" : ""
              } p-0`}
              onClick={() => handleTabClick("Resolution")}
            >
              TopX
              <ReactTooltip
                style={{
                  zIndex: "9999",
                }}
                id="TopX"
                place="top"
                content={`Get possible resolutions based on legacy ticket data. `}
              />
            </Link>
          </li>
          <li className="nav-item" data-tooltip-id="SearchX">
            <Link
              className={`nav-link ${
                activeTab === "Search" ? "active" : ""
              } p-0`}
              onClick={() => handleTabClick("Search")}
            >
              SearchX
              <ReactTooltip
                style={{
                  zIndex: "9999",
                }}
                id="SearchX"
                place="top"
                content={`Search and filter tickets with ease using SearchX. `}
              />
            </Link>
          </li>
          <li className="nav-item" data-tooltip-id="BotX">
            <Link
              className={`nav-link ${
                activeTab === "Chatbot" ? "active" : ""
              } p-0`}
              onClick={() => handleTabClick("Chatbot")}
            >
              BotX
              <ReactTooltip
                style={{
                  zIndex: "9999",
                }}
                id="BotX"
                place="top"
                content={`Get answers from the knowledge base using the AI bot.`}
              />
            </Link>
          </li>
          <li className="nav-item" data-tooltip-id="EmailX">
            <Link
              className={`nav-link ${
                activeTab === "Smart_Response" ? "active" : ""
              } p-0`}
              onClick={() => handleTabClick("Smart_Response")}
            >
              EmailX
              <ReactTooltip
                style={{
                  zIndex: "9999",
                }}
                id="EmailX"
                place="top"
                content={`Draft an email based on the ticket conversation, top resolutions, bot solutions, or manual instructions.`}
              />
            </Link>
          </li>
        </ul>
        <hr className="m-0 p-0" />

        {activeTab === "Resolution" && <ResolutionScreen />}
        {activeTab === "Search" && <Search />}
        {activeTab === "Chatbot" && <Chatbot />}
        {activeTab === "Smart_Response" && <SmartResponse />}
      </div>
      <AgentAnalysisModal
        show={showModal}
        handleClose={handleClose}
        analysisData={analysisData}
      />
    </div>
  );
}
