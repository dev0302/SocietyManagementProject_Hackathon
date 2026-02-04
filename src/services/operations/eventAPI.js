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

