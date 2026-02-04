import apiConnector from "../api.js";

export const searchUsers = async (query) => {
  try {
    const response = await apiConnector.get("/api/search/users", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

