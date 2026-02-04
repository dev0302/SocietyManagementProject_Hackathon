import apiConnector from "../api.js";

export const registerAdmin = async (data) => {
  try {
    const response = await apiConnector.post("/api/auth/register/admin", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerFaculty = async (data) => {
  try {
    const response = await apiConnector.post("/api/auth/register/faculty", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerStudent = async (data) => {
  try {
    const response = await apiConnector.post("/api/auth/register/student", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (data) => {
  try {
    const response = await apiConnector.post("/api/auth/login", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await apiConnector.post("/api/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Call backend logout to clear cookie as well as any client state.
export const logout = async () => {
  try {
    await apiConnector.post("/api/auth/logout");
  } catch (error) {
    // Swallow errors so logout UX isn't blocked
    console.error("Logout API error:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
