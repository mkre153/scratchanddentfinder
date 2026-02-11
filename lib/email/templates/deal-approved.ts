/**
 * Deal Approved Email Template
 *
 * Sent when a deal passes moderation and goes live.
 */

interface DealApprovedEmailProps {
  dealTitle: string
  dealUrl: string
}

export function DealApprovedEmail({ dealTitle, dealUrl }: DealApprovedEmailProps): string {
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
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; width: 48px; height: 48px; line-height: 48px; font-size: 24px;">&#10003;</div>
    </div>

    <h2 style="color: #111827; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 16px;">Your deal is live!</h2>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
      Great news! Your deal <strong>${dealTitle}</strong> has been published on Scratch & Dent Finder and is now visible to shoppers.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${dealUrl}" style="display: inline-block; background-color: #1d4ed8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">View Your Deal</a>
    </div>

    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #374151; font-size: 14px; line-height: 22px; margin: 0;">
        <strong>Good to know:</strong> Your deal will remain active for 30 days. Share the link above on social media or with customers to get more views!
      </p>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0;">
      Thanks for listing on Scratch & Dent Finder!<br>
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
