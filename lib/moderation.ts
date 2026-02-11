/**
 * Content Moderation Pipeline
 *
 * Uses OpenAI Moderation API for text and GPT-4o-mini vision for images.
 * Auto-approves clean content, flags questionable content for manual review.
 */

import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export interface ModerationResult {
  passed: boolean
  flags: Record<string, unknown>
}

/**
 * Moderate text content using OpenAI Moderation API
 */
async function moderateText(text: string): Promise<ModerationResult> {
  const openai = getOpenAI()

  try {
    const response = await openai.moderations.create({ input: text })
    const result = response.results[0]

    if (result.flagged) {
      return {
        passed: false,
        flags: {
          type: 'text',
          categories: result.categories,
          scores: result.category_scores,
        },
      }
    }

    return { passed: true, flags: {} }
  } catch (error) {
    console.error('[Moderation] Text moderation failed:', error)
    // Fail open — queue for manual review on API error
    return {
      passed: false,
      flags: { type: 'text', error: 'Moderation API unavailable' },
    }
  }
}

/**
 * Moderate an image using GPT-4o-mini vision
 */
async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  const openai = getOpenAI()

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image. Answer these two questions with YES or NO only:\n1. Is this image appropriate (no nudity, violence, or offensive content)?\n2. Does this image show an appliance or a plausible product photo?\nRespond in format: "appropriate: YES/NO, appliance: YES/NO"',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
          ],
        },
      ],
    })

    const answer = response.choices[0]?.message?.content?.toLowerCase() || ''
    const isAppropriate = answer.includes('appropriate: yes')
    const isAppliance = answer.includes('appliance: yes')

    if (!isAppropriate || !isAppliance) {
      return {
        passed: false,
        flags: {
          type: 'image',
          url: imageUrl,
          appropriate: isAppropriate,
          appliance: isAppliance,
          raw: answer,
        },
      }
    }

    return { passed: true, flags: {} }
  } catch (error) {
    console.error('[Moderation] Image moderation failed:', error)
    return {
      passed: false,
      flags: { type: 'image', url: imageUrl, error: 'Vision API unavailable' },
    }
  }
}

/**
 * Run full moderation pipeline on a deal submission
 *
 * Runs text and image checks in parallel.
 * Returns overall pass/fail and combined flags.
 */
export async function moderateDeal(params: {
  title: string
  description: string
  damageDescription: string
  photoUrls: string[]
}): Promise<ModerationResult> {
  const textContent = [params.title, params.description, params.damageDescription]
    .filter(Boolean)
    .join('\n\n')

  // Run all checks in parallel
  const checks = await Promise.all([
    moderateText(textContent),
    ...params.photoUrls.map((url) => moderateImage(url)),
  ])

  const failedChecks = checks.filter((c) => !c.passed)

  if (failedChecks.length > 0) {
    return {
      passed: false,
      flags: {
        failedChecks: failedChecks.map((c) => c.flags),
        totalChecks: checks.length,
        failedCount: failedChecks.length,
      },
    }
  }

  return { passed: true, flags: {} }
}
