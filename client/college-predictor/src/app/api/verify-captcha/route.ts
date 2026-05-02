import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is missing' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production') {
        console.error("RECAPTCHA_SECRET_KEY is missing. Failing verification in production.");
        return NextResponse.json(
          { success: false, error: 'Captcha verification is not configured' },
          { status: 500 }
        );
      }
      console.warn("RECAPTCHA_SECRET_KEY is missing. Passing verification for local development.");
      return NextResponse.json({ success: true, score: 0.9 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    const response = await fetch(verificationUrl, {
      method: 'POST',
    });

    const data = await response.json();

    if (data.success && data.score >= 0.5) {
      return NextResponse.json({ success: true, score: data.score });
    } else {
      console.error("reCAPTCHA validation failed:", data);
      return NextResponse.json({ success: false, error: 'reCAPTCHA failed', details: data }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
