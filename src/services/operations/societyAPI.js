import apiConnector from "../api.js";

export const createSociety = async (data) => {
  try {
    const response = await apiConnector.post("/api/societies", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSociety = async (societyId, data) => {
  try {
    const response = await apiConnector.patch(`/api/societies/${societyId}`, data);
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

export const getSocietyMembers = async (societyId) => {
  try {
    const response = await apiConnector.get(`/api/societies/${societyId}/members`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const exportSocietyMembersExcel = async (societyId) => {
  try {
    const response = await apiConnector.get(`/api/societies/${societyId}/members/export`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSocietyStudents = async (societyId) => {
  try {
    const response = await apiConnector.get(`/api/societies/${societyId}/students`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addSocietyStudents = async (societyId, students, replace = false) => {
  try {
    const response = await apiConnector.post(`/api/societies/${societyId}/students`, {
      students,
      replace,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadSocietyStudentsExcel = async (societyId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiConnector.post(
      `/api/societies/${societyId}/students/upload`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadSocietyLogo = async (societyId, file) => {
  try {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await apiConnector.post(
      `/api/societies/${societyId}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStudentConfig = async (societyId) => {
  try {
    const response = await apiConnector.get(`/api/societies/${societyId}/student-config`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateStudentConfig = async (societyId, data) => {
  try {
    const response = await apiConnector.put(
      `/api/societies/${societyId}/student-config`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
