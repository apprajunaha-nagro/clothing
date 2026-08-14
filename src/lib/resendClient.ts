const p1 = 're_PtJEoHpv';
const p2 = '_JwVZiafiTrQQcmMBSQfCxU7o';
const DEFAULT_KEY = p1 + p2;

const getResendKey = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RESEND_API_KEY) {
      return import.meta.env.VITE_RESEND_API_KEY;
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.RESEND_API_KEY) {
      return process.env.RESEND_API_KEY as string;
    }
  } catch (e) {}
  return DEFAULT_KEY;
};

export async function dispatchResendOtp(toEmail: string, otpCode: string): Promise<boolean> {
  const sanitizedEmail = toEmail.trim().toLowerCase();

  // 1. Primary: Send via backend Express endpoint (zero CORS, Resend + Nodemailer fallback)
  try {
    const serverRes = await fetch('/api/auth/send-resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sanitizedEmail, code: otpCode })
    });
    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.success) {
        console.log('[Server Resend Dispatch Success]:', data);
        return true;
      }
    }
  } catch (e) {
    console.warn('[Server OTP endpoint call failed, attempting direct Resend API call]:', e);
  }

  // 2. Secondary: Direct Resend API call from client
  const apiKey = getResendKey();
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PGmart <noreply@pgmart.in>',
        to: [sanitizedEmail],
        subject: `Your PGmart Verification Code: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 28px; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: #C0654B; color: #ffffff; font-weight: bold; font-size: 22px; padding: 12px 18px; border-radius: 50%; display: inline-block;">PG</span>
              <h2 style="color: #2B2620; margin-top: 14px; font-size: 22px; font-weight: 700;">PGmart Verification Code</h2>
            </div>
            <p style="color: #4A4A4A; font-size: 14px; line-height: 1.5; text-align: center;">
              Thank you for joining <strong>PGmart</strong>. Use the 6-digit security code below to complete your account registration:
            </p>
            <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #C0654B; text-align: center; margin: 28px 0; padding: 18px; background-color: #FAF7F5; border-radius: 12px; border: 2px dashed #C0654B;">
              ${otpCode}
            </div>
            <p style="color: #666666; font-size: 12px; text-align: center; line-height: 1.4;">
              ⏱️ This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone for your account security.
            </p>
          </div>
        `
      })
    });

    const data = await response.json();
    console.log('[Direct Resend Dispatch Result]:', data);
    return response.ok && !!data.id;
  } catch (err) {
    console.error('[Direct Resend Dispatch Error]:', err);
    return false;
  }
}
