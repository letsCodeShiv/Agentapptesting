// const apiBaseURL = "https://ft1.cxchatgpt.ai/api";
const apiBaseURL = "https://staging.cxchatgpt.ai/api";
const urlBackendAPI = `${apiBaseURL}/main`;
const urlChatbotAPI = `${apiBaseURL}/chatbot`;
const urlAuth = `${apiBaseURL}/auth`;
const smartResponse = `${apiBaseURL}/smartresponse`;
const urlAnalytics = `${apiBaseURL}/dashboard/dashboard`;
const tpCookieURL = `https://tpcookie.cxchatgpt.ai/`;
const selfResolution = "http://localhost:3001/";

export const ApiConfig = {
  // Authentication
  login: `${urlAuth}/zen_admin_screen_auth`,

  // Resolution
  getResolution: `${urlBackendAPI}/get_resolution`,
  resolutionFeedback: `${urlBackendAPI}/updatefeedback`,
  regenerate: `${urlBackendAPI}/regenerate`,

  // Search
  keywordSearch: `${urlBackendAPI}/meta_filter_and_search_query`,
  querySearch: `${urlBackendAPI}/search_query`,

  // ChatBot
  getChats: `${urlChatbotAPI}/tid`,
  getConvo: `${urlChatbotAPI}/convo`,
  feedback: `${urlChatbotAPI}/feedback`,
  download: `${urlChatbotAPI}/downloadChat`,

  //smartResponse
  smartResponse: `${smartResponse}/smart_response`,
  getCount: `${smartResponse}/get_count_used`,
  smartResponseTypes: `${smartResponse}/smart_response_types`,
  botxDatas: `${smartResponse}/get_botX_response`,

  // agent analytics
  agentAnalyticsUrl: `${urlAnalytics}/get_agent_screen_kpis`,

  // fullScreen Modal
  modal: `${selfResolution}`,

  // check third party cookies
  tpCookieURL: `${tpCookieURL}`,

  // tooltips
  tooltips: `${urlBackendAPI}/tooltips`,
};
