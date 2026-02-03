import apiConnector from "../api.js";

export const getPlatformConfig = async () => {
  try {
    const response = await apiConnector.get("/api/admin/config");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePlatformConfig = async (data) => {
  try {
    const response = await apiConnector.put("/api/admin/config", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
