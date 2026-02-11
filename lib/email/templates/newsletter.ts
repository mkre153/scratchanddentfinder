/**
 * Newsletter Email Template
 *
 * Plain HTML string builder — no React dependency.
 * Renders a weekly digest of latest blog posts and savings tips.
 */

interface NewsletterPost {
  title: string
  description: string
  slug: string
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderNewsletterHtml(
  posts: NewsletterPost[],
  unsubscribeUrl: string
): string {
  const postCards = posts
    .map(
      (post) => `
      <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin-bottom:16px;border-left:3px solid #6b8f71;">
        <tbody><tr>
          <td style="padding:12px 16px;background-color:#f8fafc;">
            <h3 style="color:#1e293b;font-size:16px;font-weight:600;margin:0 0 6px 0;">${escapeHtml(post.title)}</h3>
            <p style="color:#475569;font-size:14px;line-height:20px;margin:0 0 8px 0;">${escapeHtml(post.description)}</p>
            <a href="https://scratchanddentfinder.com/blog/${encodeURIComponent(post.slug)}/" style="color:#6b8f71;font-size:14px;font-weight:600;text-decoration:none;">Read more &rarr;</a>
          </td>
        </tr></tbody>
      </table>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;">
<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:#f1f5f9;">
  <tbody><tr>
    <td align="center" style="padding:24px 0;">
      <table cellpadding="0" cellspacing="0" role="presentation" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <tbody>
          <!-- Header -->
          <tr>
            <td style="background-color:#6b8f71;padding:32px 24px;text-align:center;">
              <h1 style="color:#ffffff;font-size:26px;font-weight:bold;margin:0 0 4px 0;">Scratch &amp; Dent Finder</h1>
              <p style="color:#d1e7d4;font-size:14px;margin:0;">Your weekly savings tips &amp; deals</p>
            </td>
          </tr>

          <!-- Latest Posts -->
          <tr>
            <td style="padding:32px 24px 16px;">
              <h2 style="color:#1e293b;font-size:20px;font-weight:bold;margin-top:0;margin-bottom:20px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">Latest Savings Tips</h2>
              ${postCards}
            </td>
          </tr>

          <!-- Quick Tip -->
          <tr>
            <td style="padding:0 24px 24px;">
              <h2 style="color:#1e293b;font-size:18px;font-weight:bold;margin-top:0;margin-bottom:8px;">Quick Tip</h2>
              <p style="color:#475569;font-size:14px;line-height:22px;margin:0;padding:12px 16px;background-color:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;">
                Side and back panel dents are hidden once an appliance is installed. Focus on front-panel condition when evaluating scratch &amp; dent deals &mdash; that is the only surface you will see every day.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 24px 32px;text-align:center;">
              <a href="https://scratchanddentfinder.com/scratch-and-dent-appliances/" style="display:inline-block;background-color:#6b8f71;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Find Stores Near You</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;">Scratch &amp; Dent Finder &mdash; Find discount appliance stores near you</p>
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;">
                <a href="${escapeHtml(unsubscribeUrl)}" style="color:#94a3b8;font-size:12px;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr></tbody>
</table>
</body>
</html>`
}
