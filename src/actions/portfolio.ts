'use server'

import { unfurl } from 'unfurl.js'

export type UnfurlResult = {
  success: boolean
  data: {
    title: string
    description: string | null
    image: string | null
    url: string
  } | null
  error?: string
}

export async function unfurlPortfolioUrl(url: string): Promise<UnfurlResult> {
  try {
    // Validate URL format
    new URL(url)

    const metadata = await unfurl(url, {
      timeout: 5000, // 5 second timeout
      follow: 3, // Follow up to 3 redirects
    })

    return {
      success: true,
      data: {
        title: metadata.title ||
               metadata.open_graph?.title ||
               metadata.twitter_card?.title ||
               new URL(url).hostname,
        description: metadata.description ||
                    metadata.open_graph?.description ||
                    metadata.twitter_card?.description ||
                    null,
        image: metadata.open_graph?.images?.[0]?.url ||
               metadata.twitter_card?.images?.[0]?.url ||
               metadata.favicon ||
               null,
        url,
      },
    }
  } catch (error) {
    // Return fallback with just the URL
    try {
      return {
        success: false,
        data: {
          title: new URL(url).hostname,
          description: null,
          image: null,
          url,
        },
        error: error instanceof Error ? error.message : 'Failed to fetch URL metadata',
      }
    } catch {
      return {
        success: false,
        data: null,
        error: 'Invalid URL format',
      }
    }
  }
}
