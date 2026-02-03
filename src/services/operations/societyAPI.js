import apiConnector from "../api.js";

export const createSociety = async (data) => {
  try {
    const response = await apiConnector.post("/api/societies", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createDepartment = async (data) => {
  try {
    const response = await apiConnector.post("/api/societies/departments", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createInvite = async (data) => {
  try {
    const response = await apiConnector.post("/api/societies/invites", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const acceptInvite = async (data) => {
  try {
    const response = await apiConnector.post("/api/societies/invites/accept", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
