import apiConnector from "../api.js";

export const getMyCollege = async () => {
  try {
    const response = await apiConnector.get("/api/college/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const upsertMyCollege = async (data) => {
  try {
    const response = await apiConnector.post("/api/college/me", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCollegeByCode = async (code) => {
  try {
    const response = await apiConnector.get(`/api/college/code/${encodeURIComponent(code)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSocietyRequest = async (data) => {
  try {
    const response = await apiConnector.post("/api/college/society-request", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMySocietyRequests = async () => {
  try {
    const response = await apiConnector.get("/api/college/requests");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyCollegeSocieties = async () => {
  try {
    const response = await apiConnector.get("/api/college/societies");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveSocietyRequest = async (requestId) => {
  try {
    const response = await apiConnector.post(`/api/college/requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectSocietyRequest = async (requestId) => {
  try {
    const response = await apiConnector.post(`/api/college/requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

