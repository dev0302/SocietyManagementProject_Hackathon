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

export const uploadCollegeProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await apiConnector.post("/api/college/me/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

export const getCollegeEvents = async (params = {}) => {
  try {
    const response = await apiConnector.get("/api/college/events", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSociety = async (societyId) => {
  try {
    const response = await apiConnector.delete(`/api/college/societies/${societyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFacultyCollege = async () => {
  try {
    const response = await apiConnector.get("/api/college/faculty/college");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFacultySocieties = async () => {
  try {
    const response = await apiConnector.get("/api/college/faculty/societies");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFacultyEvents = async (params = {}) => {
  try {
    const response = await apiConnector.get("/api/college/faculty/events", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFacultyAllSocieties = async () => {
  try {
    const response = await apiConnector.get("/api/college/faculty/all-societies");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFacultyAllEvents = async (params = {}) => {
  try {
    const response = await apiConnector.get("/api/college/faculty/all-events", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSocietyInviteLink = async (facultyHeadEmail) => {
  try {
    const response = await apiConnector.post("/api/college/society-invite-link", {
      facultyHeadEmail,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSocietyInviteByToken = async (token) => {
  try {
    const response = await apiConnector.get("/api/college/society-invite", { params: { token } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSocietyFromInvite = async (data) => {
  try {
    const response = await apiConnector.post("/api/college/society-from-invite", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

