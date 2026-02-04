import apiConnector from "../api.js";

export const createEvent = async (data) => {
  try {
    const response = await apiConnector.post("/api/events", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

