const nodemailer = require('nodemailer');

// 1. Configure the Zoho SMTP connection
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', // Use smtp.zoho.com if you registered on the .com site
  port: 465,            // 465 is the secure SSL port for Zoho
  secure: true,         // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your full Zoho email address
    pass: process.env.EMAIL_PASS  // Your Zoho App Password
  }
});

// 2. The function to send the email
const sendFeedbackEmail = async (userEmail) => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

  const mailOptions = {
    // IMPORTANT: The 'from' address MUST exactly match your process.env.EMAIL_USER
    from: `"Vayl Study OS" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Quick question about your JEE prep...',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; color: #333;">
        <h2>How is Vayl working out for you?</h2>
        <p>Your feedback helps me build better features. Click an emoji below to rate your experience instantly.</p>
        
        <div style="margin: 40px 0;">
          <a href="${BACKEND_URL}/api/feedback/submit?rating=1&email=${userEmail}" style="text-decoration:none; font-size:45px; margin: 0 15px;">😞</a>
          <a href="${BACKEND_URL}/api/feedback/submit?rating=3&email=${userEmail}" style="text-decoration:none; font-size:45px; margin: 0 15px;">😐</a>
          <a href="${BACKEND_URL}/api/feedback/submit?rating=5&email=${userEmail}" style="text-decoration:none; font-size:45px; margin: 0 15px;">🔥</a>
        </div>
        
        <p style="font-size: 12px; color: #888;">Just one click. No typing required.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent Zoho feedback email to ${userEmail}`);
  } catch (error) {
    console.error("Failed to send Zoho email:", error);
  }
};

module.exports = { sendFeedbackEmail };