/**
 * RSS Feed for Scratch & Dent Finder Blog
 * Excerpt-only feed (title + description + link)
 * Excludes draft posts
 */

import { SITE_URL, SITE_NAME } from '@/lib/config'
import { getBlogUrl, getBlogPostUrl, getBlogFeedUrl } from '@/lib/urls'

interface Post {
  slug: string
  title: string
  description: string
  date: string
  updated: string
  draft: boolean
  tags: string[]
}

async function getPosts(): Promise<Post[]> {
  try {
    const { posts } = await import('../../../.velite/index.js')
    return posts as Post[]
  } catch {
    return []
  }
}

export async function GET() {
  const posts = await getPosts()
  const publishedPosts = posts
    .filter((post) => !post.draft)
    .sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    )

  const rssItems = publishedPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}${getBlogPostUrl(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}${getBlogPostUrl(post.slug)}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join('\n      ')}
    </item>`
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${SITE_URL}${getBlogUrl()}</link>
    <description>Tips, guides, and strategies for finding the best deals on scratch and dent appliances.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}${getBlogFeedUrl()}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/icon</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
