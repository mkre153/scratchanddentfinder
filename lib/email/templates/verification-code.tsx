/**
 * Verification Code Email Template
 *
 * Sent when a user submits a store and needs to verify their email.
 * Contains a 6-digit code that expires in 10 minutes.
 */

interface VerificationCodeEmailProps {
  code: string
  businessName: string
}

export function VerificationCodeEmail({ code, businessName }: VerificationCodeEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background-color: #1d4ed8; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">Scratch & Dent Finder</h1>
  </div>

  <div style="padding: 32px 24px; text-align: center;">
    <h2 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Verify your email</h2>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      You're submitting <strong>${businessName}</strong> to our directory.
      Enter this code to complete your submission:
    </p>

    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
      <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${code}</span>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
      This code expires in 10 minutes.
    </p>

    <p style="color: #9ca3af; font-size: 12px; line-height: 20px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>

  <div style="background-color: #f3f4f6; padding: 24px; text-align: center;">
    <p style="color: #6b7280; font-size: 12px; margin: 0;">
      Scratch & Dent Finder - Find discount appliance stores near you
    </p>
  </div>
</body>
</html>
  `.trim()
}
