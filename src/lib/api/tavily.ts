/**
 * Tavily AI Search API Integration
 * Used for AI Research Assistant in Idea Studio
 */

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

export interface TavilySearchResponse {
  query: string
  results: TavilySearchResult[]
  answer?: string
  images?: string[]
  response_time: number
}

export class TavilyClient {
  private apiKey: string
  private baseUrl = 'https://api.tavily.com'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('Tavily API key not found. Set TAVILY_API_KEY environment variable.')
    }
  }

  async search(query: string, options?: {
    searchDepth?: 'basic' | 'advanced'
    maxResults?: number
    includeDomains?: string[]
    excludeDomains?: string[]
  }): Promise<TavilySearchResponse> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: options?.searchDepth || 'basic',
        max_results: options?.maxResults || 5,
        include_answer: true,
        include_images: false,
        include_domains: options?.includeDomains,
        exclude_domains: options?.excludeDomains,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Tavily API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      query: data.query,
      results: data.results || [],
      answer: data.answer,
      images: data.images,
      response_time: data.response_time,
    }
  }

  async searchMultiple(queries: string[]): Promise<TavilySearchResponse[]> {
    return Promise.all(queries.map(q => this.search(q)))
  }
}

// Export singleton instance
export const tavilyClient = new TavilyClient()
