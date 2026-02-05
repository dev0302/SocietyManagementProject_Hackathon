import apiConnector from "../api.js";

export const createEvent = async (data) => {
  try {
    const response = await apiConnector.post("/api/events", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSocietyEvents = async (societyId, params = {}) => {
  try {
    const response = await apiConnector.get(`/api/events/society/${societyId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await apiConnector.get(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEventParticipants = async (eventId) => {
  try {
    const response = await apiConnector.get(`/api/events/${eventId}/participants`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addEventParticipants = async (eventId, participants) => {
  try {
    const response = await apiConnector.post(`/api/events/${eventId}/participants`, {
      participants,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const issueCertificate = async (data) => {
  try {
    const response = await apiConnector.post("/api/events/certificates", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createEventInvite = async (data) => {
  try {
    const response = await apiConnector.post("/api/events/invites", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const acceptEventInvite = async (token) => {
  try {
    const response = await apiConnector.post("/api/events/invites/accept", { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEventInviteByToken = async (token) => {
  try {
    const response = await apiConnector.get("/api/events/invites/by-token", {
      params: { token },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

