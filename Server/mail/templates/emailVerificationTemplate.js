export const emailVerificationTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Email Verification - SocietySync</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #020617;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020617; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b;">
                        <tr>
                            <td style="padding: 40px 30px; text-align: center;">
                                <h1 style="color: #e5e7eb; margin: 0 0 20px 0; font-size: 24px;">Email Verification</h1>
                                <p style="color: #94a3b8; margin: 0 0 30px 0; font-size: 14px; line-height: 1.6;">
                                    Thank you for signing up for the SocietySync platform. Please use the OTP below to verify your email address.
                                </p>
                                <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 20px; margin: 30px 0;">
                                    <p style="color: #e5e7eb; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
                                        ${otp}
                                    </p>
                                </div>
                                <p style="color: #64748b; margin: 20px 0 0 0; font-size: 12px;">
                                    This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};
