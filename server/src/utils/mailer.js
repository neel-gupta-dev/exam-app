import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendFeedbackEmail = async (userEmail) => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

  const mailOptions = {
    from: `"Vayl Study OS" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Quick question about your JEE prep...',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; color: #333;">
        <h2>How is Vayl working out for you?</h2>
        <div style="margin: 40px 0;">
          <a href="${BACKEND_URL}/api/feedback/submit?rating=1&email=${userEmail}" style="text-decoration:none; font-size:45px; margin: 0 15px;">😞</a>
          <a href="${BACKEND_URL}/api/feedback/submit?rating=3&email=${userEmail}" style="text-decoration:none; font-size:45px; margin: 0 15px;">😐</a>
          <a href="${BACKEND_URL}/api/feedback/submit?rating=5&email=${userEmail}" style="text-decoration:none; font-size:45px; margin: 0 15px;">🔥</a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Zoho error:", error);
    return false;
  }
};