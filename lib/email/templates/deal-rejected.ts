/**
 * Deal Rejected Email Template
 *
 * Sent when a deal is rejected during moderation.
 */

interface DealRejectedEmailProps {
  dealTitle: string
}

export function DealRejectedEmail({ dealTitle }: DealRejectedEmailProps): string {
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
    <h2 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Deal Submission Update</h2>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
      Unfortunately, your deal <strong>${dealTitle}</strong> did not meet our content guidelines and could not be published.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      Common reasons include:
    </p>
    <ul style="color: #374151; font-size: 14px; line-height: 24px; margin-bottom: 24px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Photos don't show an appliance</li>
      <li style="margin-bottom: 8px;">Description contains inappropriate content</li>
      <li style="margin-bottom: 8px;">Pricing information appears inaccurate</li>
    </ul>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
      You're welcome to submit a new deal with updated information. If you believe this was an error, reply to this email and we'll review it again.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 24px 0 0 0;">
      — The Scratch & Dent Finder Team
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
