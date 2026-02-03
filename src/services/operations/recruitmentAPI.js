import apiConnector from "../api.js";

export const createApplication = async (data) => {
  try {
    const response = await apiConnector.post("/api/recruitment/applications", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createInterviewPanel = async (data) => {
  try {
    const response = await apiConnector.post("/api/recruitment/panels", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const submitInterviewFeedback = async (data) => {
  try {
    const response = await apiConnector.post("/api/recruitment/feedback", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const chooseFinalSociety = async (data) => {
  try {
    const response = await apiConnector.post("/api/recruitment/choose-final-society", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createEvent = async (data) => {
  try {
    const response = await apiConnector.post("/api/recruitment/events", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const issueCertificate = async (data) => {
  try {
    const response = await apiConnector.post("/api/recruitment/certificates", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
