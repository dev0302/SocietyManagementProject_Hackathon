import apiConnector from "../api.js";

export const getMyProfile = async () => {
  try {
    const response = await apiConnector.get("/api/profile/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (payload) => {
  try {
    const response = await apiConnector.put("/api/profile", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiConnector.put("/api/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

