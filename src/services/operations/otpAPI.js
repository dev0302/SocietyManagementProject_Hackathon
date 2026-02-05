import apiConnector from "../api.js";

export const sendOTP = async (email, accountType = "student", studentType) => {
  try {
    const payload = { email, accountType };
    if (studentType) {
      payload.studentType = studentType;
    }
    const response = await apiConnector.post("/api/otp/send", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await apiConnector.post("/api/otp/verify", { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
