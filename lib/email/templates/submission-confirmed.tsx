/**
 * Submission Confirmed Email Template
 *
 * Sent after a user successfully verifies their email.
 * Confirms that their store submission is now under review.
 */

interface SubmissionConfirmedEmailProps {
  businessName: string
}

export function SubmissionConfirmedEmail({ businessName }: SubmissionConfirmedEmailProps): string {
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

  <div style="padding: 32px 24px;">
    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
      Hi there,
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
      Thanks for submitting <strong>${businessName}</strong> to Scratch & Dent Finder!
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
      We've successfully verified your email, and your listing is now <strong>under review</strong> by our team.
    </p>

    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">What happens next</h2>
      <ul style="color: #374151; font-size: 14px; line-height: 24px; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">We'll review the information you submitted for accuracy and completeness.</li>
        <li style="margin-bottom: 8px;">If everything looks good, your store will be published to the directory.</li>
        <li style="margin-bottom: 0;">If we need any additional details, we'll reach out using this email address.</li>
      </ul>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
      You don't need to take any further action right now. We'll notify you as soon as your listing status changes.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0;">
      Thanks for helping keep our directory accurate and up to date.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 24px 0 0 0;">
      —<br>
      The Scratch & Dent Finder Team
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
