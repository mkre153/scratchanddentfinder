/**
 * Outreach Drip Email Templates
 *
 * 4-step drip sequence for store owner marketplace outreach.
 * Plain HTML string builder — no React dependency.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface DripTemplateInput {
  step: number
  storeName: string
  storeCity: string
  storeState: string
  unsubscribeUrl: string
}

interface DripContent {
  subject: string
  heading: string
  body: string
  ctaText: string
}

function getDripContent(input: DripTemplateInput): DripContent {
  const { step, storeName, storeCity, storeState } = input
  const name = escapeHtml(storeName)
  const city = escapeHtml(storeCity)
  const state = escapeHtml(storeState)

  switch (step) {
    case 1:
      return {
        subject: `Your store is on Scratch & Dent Finder — post deals for free`,
        heading: `${name} is listed on Scratch &amp; Dent Finder`,
        body: `
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Hi there,
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Your store, <strong>${name}</strong> in ${city}, ${state}, is already listed on
            <a href="https://scratchanddentfinder.com/" style="color:#6b8f71;text-decoration:underline;">Scratch &amp; Dent Finder</a>
            &mdash; the largest scratch &amp; dent appliance directory in the US.
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            We just launched a <strong>free deals marketplace</strong> where stores can post current discounts
            and specials. Shoppers in ${city} searching for scratch &amp; dent deals will see your listings front and center.
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 24px 0;">
            It takes about 2 minutes to post your first deal. No account needed, no fees, no catch.
          </p>`,
        ctaText: 'Post a Deal for Free',
      }

    case 2:
      return {
        subject: `How the deals marketplace works (takes 2 minutes)`,
        heading: `Post a deal in 3 easy steps`,
        body: `
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Hi there,
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Last week we let you know that ${name} is listed on Scratch &amp; Dent Finder.
            Here&rsquo;s how easy it is to post a deal:
          </p>
          <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin-bottom:24px;">
            <tbody>
              <tr>
                <td style="padding:12px 16px;background-color:#f0fdf4;border-radius:6px;margin-bottom:8px;">
                  <p style="color:#1e293b;font-size:15px;line-height:24px;margin:0;">
                    <strong>1.</strong> Click &ldquo;Post a Deal&rdquo; on our marketplace<br/>
                    <strong>2.</strong> Enter the appliance, original price, and your deal price<br/>
                    <strong>3.</strong> Submit &mdash; it goes live instantly for ${city} shoppers
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 24px 0;">
            Shoppers searching for &ldquo;scratch and dent appliances in ${city}&rdquo; will see your deal
            right on your store listing. More visibility, zero cost.
          </p>`,
        ctaText: 'Post Your First Deal',
      }

    case 3:
      return {
        subject: `Stores using the marketplace get 3x more calls`,
        heading: `Stores with deals get 3x more engagement`,
        body: `
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Hi there,
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Quick update about the Scratch &amp; Dent Finder deals marketplace:
          </p>
          <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin-bottom:24px;">
            <tbody>
              <tr>
                <td style="padding:16px;background-color:#f0fdf4;border-radius:6px;border-left:3px solid #6b8f71;">
                  <p style="color:#1e293b;font-size:15px;line-height:24px;margin:0 0 8px 0;">
                    <strong>Stores with active deals receive 3x more phone calls and direction requests</strong>
                    compared to listings without deals.
                  </p>
                  <p style="color:#475569;font-size:14px;line-height:22px;margin:0;">
                    Shoppers want to see prices before they visit. When you post a deal, you&rsquo;re answering their
                    #1 question before they even pick up the phone.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 24px 0;">
            ${name} in ${city} already has a listing &mdash; adding a deal takes 2 minutes and costs nothing.
          </p>`,
        ctaText: 'Post a Deal Now',
      }

    case 4:
      return {
        subject: `Last chance: Post your first deal this week`,
        heading: `Don&rsquo;t miss the visibility boost`,
        body: `
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Hi there,
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            This is our last note about the Scratch &amp; Dent Finder deals marketplace.
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 16px 0;">
            Stores that post a deal this week will get <strong>priority placement</strong> on their city page.
            ${name} is already listed in ${city}, ${state} &mdash; a single deal could put you at the top
            of the page when shoppers search for scratch &amp; dent appliances nearby.
          </p>
          <p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 24px 0;">
            After this email, we won&rsquo;t reach out again about the marketplace. If you&rsquo;d like to post a
            deal in the future, you can always visit the link below.
          </p>`,
        ctaText: 'Post Your Deal — Last Chance',
      }

    default:
      throw new Error(`Invalid drip step: ${step}`)
  }
}

export function getDripSubject(step: number, storeName: string): string {
  const content = getDripContent({ step, storeName, storeCity: '', storeState: '', unsubscribeUrl: '' })
  return content.subject
}

export function renderDripHtml(input: DripTemplateInput): string {
  const content = getDripContent(input)
  const ctaUrl = `https://scratchanddentfinder.com/deals/post/?utm_source=email&utm_campaign=drip&utm_content=step${input.step}`

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
              <p style="color:#d1e7d4;font-size:14px;margin:0;">Deals Marketplace</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px 16px;">
              <h2 style="color:#1e293b;font-size:20px;font-weight:bold;margin-top:0;margin-bottom:20px;">${content.heading}</h2>
              ${content.body}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 24px 32px;text-align:center;">
              <a href="${ctaUrl}" style="display:inline-block;background-color:#6b8f71;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">${content.ctaText}</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;">Scratch &amp; Dent Finder &mdash; The largest scratch &amp; dent appliance directory in the US</p>
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#94a3b8;font-size:12px;text-decoration:underline;">Unsubscribe from store outreach emails</a>
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
