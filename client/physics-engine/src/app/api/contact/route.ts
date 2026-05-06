import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, message, captchaToken } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      if (!captchaToken) {
        return NextResponse.json({ error: 'CAPTCHA token is required' }, { status: 400 });
      }

      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      
      if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY is not defined in environment variables");
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${captchaToken}`
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 });
      }
    }

    // Here you would typically send the email or save to a database.
    // For now, we simulate a successful submission.
    console.log(`Received contact message from ${email}: ${message}`);

    return NextResponse.json({ success: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
