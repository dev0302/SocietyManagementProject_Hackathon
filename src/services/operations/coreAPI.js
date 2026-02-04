import apiConnector from "../api.js";

export const logMemberDecision = async (data) => {
  try {
    const response = await apiConnector.post("/api/core/members/decision", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateMemberRole = async (data) => {
  try {
    const response = await apiConnector.post("/api/core/members/role", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchDepartments = async () => {
  try {
    const response = await apiConnector.get("/api/core/departments");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

