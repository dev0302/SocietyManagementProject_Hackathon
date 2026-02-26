import apiConnector from "../api.js";

export const getMySociety = async () => {
  try {
    const response = await apiConnector.get("/api/core/my-society");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

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

export const fetchMyDepartmentHeads = async () => {
  try {
    const response = await apiConnector.get("/api/core/departments/my-heads");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createHeadInviteLink = async (departmentId) => {
  try {
    const response = await apiConnector.post("/api/core/departments/invite-link", {
      departmentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createHeadInviteByEmail = async (departmentId, email) => {
  try {
    const response = await apiConnector.post("/api/core/departments/invite-email", {
      departmentId,
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

