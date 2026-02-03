import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const mailSender = async (email, title, body) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Cozen Societies",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: email }],
        subject: title,
        htmlContent: body,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // eslint-disable-next-line no-console
    console.log("Brevo API Success:", response.data.messageId);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("--- BREVO ERROR ---");
    if (error.response) {
      // eslint-disable-next-line no-console
      console.error("Status:", error.response.status);
      // eslint-disable-next-line no-console
      console.error("Message:", error.response.data.message);
    } else {
      // eslint-disable-next-line no-console
      console.error("Error:", error.message);
    }
    return null;
  }
};

export default mailSender;
