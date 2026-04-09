import nodemailer from 'nodemailer';

// ─── Zoho Mail Transporter (for feedback emails) ───────────────────────
const zohoTransporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── ZeptoMail (REST API — to bypass Railway SMTP blocks) ───────────────
// We no longer use nodemailer for ZeptoMail because Railway blocks outbound
// SMTP on hobby plans. Using their HTTP POST API resolves it perfectly.
const ZEPTOMAIL_API_URL = 'https://api.zeptomail.in/v1.1/email';



// ─── Feedback Email (existing — uses Zoho) ─────────────────────────────
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
    await zohoTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Zoho error:", error);
    return false;
  }
};

// ─── OTP Email (new — uses ZeptoMail) ──────────────────────────────────
export const sendOtpEmail = async (recipientEmail, otpCode) => {
  const mailOptions = {
    from: '"Vayl" <noreply@vayl.in>',
    to: recipientEmail,
    subject: `${otpCode} — Your Vayl Verification Code`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0f; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
        <!-- Header -->
        <div style="padding: 32px 32px 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
            VAYL
          </h1>
          <p style="margin: 8px 0 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 3px;">
            Verification Protocol
          </p>
        </div>

        <!-- OTP Box -->
        <div style="padding: 40px 32px; text-align: center;">
          <p style="margin: 0 0 24px; font-size: 14px; color: #999; line-height: 1.6;">
            Use the code below to verify your student identity on Vayl.
          </p>
          <div style="background: #111122; border: 1px solid #2a2a4a; border-radius: 12px; padding: 24px; display: inline-block;">
            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 12px;">
              ${otpCode}
            </span>
          </div>
          <p style="margin: 24px 0 0; font-size: 12px; color: #666;">
            This code expires in <strong style="color: #999;">10 minutes</strong>.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; border-top: 1px solid #1a1a2e; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #444;">
            If you didn't request this code, ignore this email.
          </p>
          <p style="margin: 8px 0 0; font-size: 10px; color: #333;">
            © 2026 Vayl · The Silent Architect of Academic Success
          </p>
        </div>
      </div>
    `
  };

  // Send via REST API to evade Railway SMTP Block
  try {
    // Strip surrounding quotes if present from Railway or dotenv
    let apiKey = process.env.ZEPTOMAIL_PASS || '';
    if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
      apiKey = apiKey.slice(1, -1);
    }
    if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
      apiKey = apiKey.slice(1, -1);
    }

    const response = await fetch(ZEPTOMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${apiKey}`
      },
      body: JSON.stringify({
        from: { "address": "noreply@vayl.in", "name": "Vayl" },
        to: [{ "email_address": { "address": recipientEmail } }],
        subject: `${otpCode} — Your Vayl Verification Code`,
        htmlbody: mailOptions.html
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ZeptoMail REST Error] ${response.status} - ${errText}`);
      return false;
    }

    console.log(`[ZeptoMail] OTP email successfully sent via REST to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("[ZeptoMail] Failed to send OTP email:", error.message);
    return false;
  }
};