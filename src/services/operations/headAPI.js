import apiConnector from "../api.js";

export const fetchDepartmentMembers = async () => {
  try {
    const response = await apiConnector.get("/api/head/members");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createMemberInviteLink = async () => {
  try {
    const response = await apiConnector.post("/api/head/members/invite-link");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createMemberInviteByEmail = async (email) => {
  try {
    const response = await apiConnector.post("/api/head/members/invite-email", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
