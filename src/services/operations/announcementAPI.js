import apiConnector from "../api.js";

export const createAnnouncement = async (data) => {
  try {
    const response = await apiConnector.post("/api/announcements", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

