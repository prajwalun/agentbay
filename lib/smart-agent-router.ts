interface Agent {
  id: string
  name: string
  description: string
  tools?: string[]
}

interface RoutingResult {
  agentId: string
  confidence: number
  reason: string
  contextType?:
    | "video-related"
    | "travel-related"
    | "finance-related"
    | "news-related"
    | "music-related"
    | "data-related"
    | "general"
    | "out-of-scope"
}

interface ConversationContext {
  recentMessages: Array<{ content: string; agentUsed?: string }>
  youtubeUrls: string[]
  travelDestinations: string[]
  currentTopic?: string
  lastAgentUsed?: string
  videoContext?: {
    hasVideo: boolean
    videoUrl?: string
    videoProcessed: boolean
  }
  travelContext?: {
    hasDestination: boolean
    destinations: string[]
    planningActive: boolean
  }
  financeContext?: {
    hasStockSymbols: boolean
    symbols: string[]
    portfolioActive: boolean
  }
  dataContext?: {
    hasData: boolean
    analysisActive: boolean
  }
}

export class SmartAgentRouter {
  private context: ConversationContext = {
    recentMessages: [],
    youtubeUrls: [],
    travelDestinations: [],
    videoContext: {
      hasVideo: false,
      videoProcessed: false,
    },
    travelContext: {
      hasDestination: false,
      destinations: [],
      planningActive: false,
    },
    financeContext: {
      hasStockSymbols: false,
      symbols: [],
      portfolioActive: false,
    },
    dataContext: {
      hasData: false,
      analysisActive: false,
    },
  }

  routeMessage(message: string, availableAgents: Agent[]): RoutingResult {
    const lowerMessage = message.toLowerCase().trim()

    // Direct YouTube URL detection
    if (this.containsYouTubeUrl(message)) {
      this.extractYouTubeUrls(message)
      this.context.videoContext = {
        hasVideo: true,
        videoUrl: message,
        videoProcessed: false,
      }
      return {
        agentId: "youtube-agent",
        confidence: 1.0,
        reason: "YouTube URL detected",
        contextType: "video-related",
      }
    }

    // Finance detection
    if (this.isFinanceRequest(lowerMessage)) {
      return {
        agentId: "finance-agent",
        confidence: 0.9,
        reason: "Finance/stock market request detected",
        contextType: "finance-related",
      }
    }

    // News detection
    if (this.isNewsRequest(lowerMessage)) {
      return {
        agentId: "news-agent",
        confidence: 0.9,
        reason: "News/current events request detected",
        contextType: "news-related",
      }
    }

    // Music detection
    if (this.isMusicRequest(lowerMessage)) {
      return {
        agentId: "music-agent",
        confidence: 0.9,
        reason: "Music generation request detected",
        contextType: "music-related",
      }
    }

    // Data analysis detection
    if (this.isDataRequest(lowerMessage)) {
      return {
        agentId: "data-agent",
        confidence: 0.9,
        reason: "Data analysis request detected",
        contextType: "data-related",
      }
    }

    // Check if question is about video content when we have video context
    if (this.context.videoContext?.hasVideo) {
      const videoRelatedResult = this.analyzeVideoRelatedQuestion(lowerMessage)
      if (videoRelatedResult) {
        return videoRelatedResult
      }
    }

    // Check if question is about travel when we have travel context
    if (this.context.travelContext?.hasDestination) {
      const travelRelatedResult = this.analyzeTravelRelatedQuestion(lowerMessage)
      if (travelRelatedResult) {
        return travelRelatedResult
      }
    }

    // Direct travel planning detection
    if (this.isTravelRequest(lowerMessage)) {
      this.extractTravelDestinations(message)
      this.context.travelContext = {
        hasDestination: true,
        destinations: this.context.travelDestinations,
        planningActive: true,
      }
      return {
        agentId: "travel-agent",
        confidence: 0.9,
        reason: "Travel planning request detected",
        contextType: "travel-related",
      }
    }

    // Math/calculation detection
    if (this.isMathRequest(lowerMessage)) {
      return {
        agentId: "travel-agent", // Using travel agent as general assistant
        confidence: 0.7,
        reason: "Mathematical calculation request",
        contextType: "general",
      }
    }

    // General questions - route to travel agent as general assistant
    return {
      agentId: "travel-agent",
      confidence: 0.5,
      reason: "General assistance request",
      contextType: "general",
    }
  }

  private isFinanceRequest(message: string): boolean {
    const financeKeywords = [
      "stock",
      "price",
      "share",
      "market",
      "crypto",
      "bitcoin",
      "ethereum",
      "portfolio",
      "investment",
      "trading",
      "finance",
      "financial",
      "nasdaq",
      "dow jones",
      "s&p",
      "ticker",
      "earnings",
      "dividend",
      "aapl",
      "googl",
      "msft",
      "tsla",
      "amzn",
      "meta",
      "nvda",
      "amd",
    ]
    return financeKeywords.some((keyword) => message.includes(keyword))
  }

  private isNewsRequest(message: string): boolean {
    const newsKeywords = [
      "news",
      "breaking",
      "current events",
      "headlines",
      "article",
      "tech news",
      "business news",
      "sports news",
      "latest news",
      "what's happening",
      "recent news",
      "today's news",
    ]
    return newsKeywords.some((keyword) => message.includes(keyword))
  }

  private isMusicRequest(message: string): boolean {
    const musicKeywords = [
      "music",
      "generate music",
      "create music",
      "compose",
      "song",
      "melody",
      "beat",
      "instrumental",
      "audio",
      "sound",
      "make music",
    ]
    return musicKeywords.some((keyword) => message.includes(keyword))
  }

  private isDataRequest(message: string): boolean {
    const dataKeywords = [
      "data",
      "analyze",
      "csv",
      "dataset",
      "statistics",
      "correlation",
      "data analysis",
      "analyze data",
      "process data",
      "spreadsheet",
    ]
    return dataKeywords.some((keyword) => message.includes(keyword))
  }

  private analyzeVideoRelatedQuestion(message: string): RoutingResult | null {
    // Questions that are clearly about video content
    const videoContentQuestions = [
      "what",
      "who",
      "when",
      "where",
      "why",
      "how",
      "explain",
      "describe",
      "tell me about",
      "what is",
      "who is",
      "what does",
      "how does",
      "why does",
      "summary",
      "summarize",
      "main points",
      "key points",
    ]

    // Questions about people/entities that might not be in video
    const personalQuestions = [
      "how old",
      "age",
      "birthday",
      "born",
      "birth",
      "married",
      "wife",
      "husband",
      "family",
      "children",
      "net worth",
      "salary",
      "income",
      "personal life",
      "biography",
      "bio",
      "background",
      "history",
    ]

    // Video-specific terms
    const videoTerms = [
      "video",
      "clip",
      "footage",
      "scene",
      "moment",
      "says",
      "mentions",
      "discusses",
      "shows",
      "demonstrates",
      "explains in video",
      "from video",
    ]

    const hasVideoContentQuestion = videoContentQuestions.some(
      (term) => message.startsWith(term) || message.includes(` ${term} `),
    )

    const hasPersonalQuestion = personalQuestions.some((term) => message.includes(term))
    const hasVideoTerms = videoTerms.some((term) => message.includes(term))

    // If it's clearly about video content or mentions video terms
    if (hasVideoTerms || (hasVideoContentQuestion && !hasPersonalQuestion)) {
      return {
        agentId: "youtube-agent",
        confidence: 0.85,
        reason: "Question about video content",
        contextType: "video-related",
      }
    }

    // If it's a personal question that might not be answerable from video
    if (hasPersonalQuestion && hasVideoContentQuestion) {
      return {
        agentId: "youtube-agent",
        confidence: 0.6,
        reason: "Personal question - may not be in video content",
        contextType: "out-of-scope",
      }
    }

    // If it seems like a follow-up question in video context
    if (this.isFollowUpQuestion(message)) {
      return {
        agentId: "youtube-agent",
        confidence: 0.7,
        reason: "Follow-up question in video context",
        contextType: "video-related",
      }
    }

    return null
  }

  private analyzeTravelRelatedQuestion(message: string): RoutingResult | null {
    const travelTerms = [
      "hotel",
      "accommodation",
      "stay",
      "lodge",
      "flight",
      "airline",
      "airport",
      "transport",
      "restaurant",
      "food",
      "eat",
      "dining",
      "attraction",
      "visit",
      "see",
      "do",
      "weather",
      "climate",
      "temperature",
      "cost",
      "price",
      "budget",
      "expensive",
      "currency",
      "money",
      "exchange",
      "culture",
      "language",
      "custom",
    ]

    const hasTravelTerms = travelTerms.some((term) => message.includes(term))

    if (hasTravelTerms || this.isFollowUpQuestion(message)) {
      return {
        agentId: "travel-agent",
        confidence: 0.8,
        reason: "Travel-related question",
        contextType: "travel-related",
      }
    }

    return null
  }

  updateContext(userMessage: string, agentUsed: string, response?: any): void {
    // Add to recent messages
    this.context.recentMessages.push({ content: userMessage, agentUsed })

    // Keep only last 5 messages for context
    if (this.context.recentMessages.length > 5) {
      this.context.recentMessages.shift()
    }

    // Update last agent used
    this.context.lastAgentUsed = agentUsed

    // Update video context
    if (agentUsed === "youtube-agent") {
      if (this.context.videoContext) {
        this.context.videoContext.videoProcessed = true
      }
    }

    // Update finance context
    if (agentUsed === "finance-agent") {
      const symbols = this.extractStockSymbols(userMessage)
      if (symbols.length > 0) {
        this.context.financeContext = {
          hasStockSymbols: true,
          symbols,
          portfolioActive: true,
        }
      }
    }

    // Update travel context
    if (agentUsed === "travel-agent" && this.isTravelRequest(userMessage.toLowerCase())) {
      this.extractTravelDestinations(userMessage)
      this.context.travelContext = {
        hasDestination: true,
        destinations: this.context.travelDestinations,
        planningActive: true,
      }
    }

    // Update data context
    if (agentUsed === "data-agent") {
      this.context.dataContext = {
        hasData: true,
        analysisActive: true,
      }
    }

    // Extract URLs and destinations
    this.extractYouTubeUrls(userMessage)
    this.extractTravelDestinations(userMessage)

    // Update current topic
    this.updateCurrentTopic(userMessage, agentUsed)
  }

  private extractStockSymbols(message: string): string[] {
    const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "AMD", "NFLX", "UBER"]
    return symbols.filter((symbol) => message.toUpperCase().includes(symbol))
  }

  clearContext(): void {
    this.context = {
      recentMessages: [],
      youtubeUrls: [],
      travelDestinations: [],
      videoContext: {
        hasVideo: false,
        videoProcessed: false,
      },
      travelContext: {
        hasDestination: false,
        destinations: [],
        planningActive: false,
      },
      financeContext: {
        hasStockSymbols: false,
        symbols: [],
        portfolioActive: false,
      },
      dataContext: {
        hasData: false,
        analysisActive: false,
      },
    }
  }

  getContextSummary(): string {
    const parts = []

    if (this.context.videoContext?.hasVideo) {
      const status = this.context.videoContext.videoProcessed ? "analyzed" : "pending"
      parts.push(`Video: ${status}`)
    }

    if (this.context.travelContext?.hasDestination && this.context.travelContext.destinations.length > 0) {
      parts.push(`Travel: ${this.context.travelContext.destinations.join(", ")}`)
    }

    if (this.context.financeContext?.hasStockSymbols && this.context.financeContext.symbols.length > 0) {
      parts.push(`Stocks: ${this.context.financeContext.symbols.join(", ")}`)
    }

    if (this.context.dataContext?.hasData) {
      parts.push(`Data: analysis active`)
    }

    if (this.context.currentTopic) {
      parts.push(`Topic: ${this.context.currentTopic}`)
    }

    if (this.context.lastAgentUsed) {
      parts.push(`Last agent: ${this.context.lastAgentUsed}`)
    }

    return parts.length > 0 ? parts.join(" | ") : "No active context"
  }

  // Helper methods to check contexts
  hasVideoContext(): boolean {
    return this.context.videoContext?.hasVideo || false
  }

  hasTravelContext(): boolean {
    return this.context.travelContext?.hasDestination || false
  }

  hasFinanceContext(): boolean {
    return this.context.financeContext?.hasStockSymbols || false
  }

  hasDataContext(): boolean {
    return this.context.dataContext?.hasData || false
  }

  private containsYouTubeUrl(message: string): boolean {
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/
    return youtubeRegex.test(message)
  }

  private extractYouTubeUrls(message: string): void {
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/g
    const matches = message.match(youtubeRegex)

    if (matches) {
      matches.forEach((url) => {
        if (!this.context.youtubeUrls.includes(url)) {
          this.context.youtubeUrls.push(url)
        }
      })
    }
  }

  private isTravelRequest(message: string): boolean {
    const travelKeywords = [
      "trip",
      "travel",
      "vacation",
      "holiday",
      "visit",
      "go to",
      "itinerary",
      "plan",
      "destination",
      "flight",
      "hotel",
      "places to see",
      "things to do",
      "attractions",
      "tour",
    ]
    return travelKeywords.some((keyword) => message.includes(keyword))
  }

  private extractTravelDestinations(message: string): void {
    const destinationPatterns = [
      /(?:to|visit|go to|travel to|trip to)\s+([A-Za-z\s,]+?)(?:\s+for|\s+\d+|$|[.!?])/gi,
      /(?:in|at)\s+([A-Za-z\s,]+?)(?:\s+for|\s+\d+|$|[.!?])/gi,
    ]

    destinationPatterns.forEach((pattern) => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          const destination = match.replace(/^(to|visit|go to|travel to|trip to|in|at)\s+/i, "").trim()
          if (destination.length > 2 && !this.context.travelDestinations.includes(destination)) {
            this.context.travelDestinations.push(destination)
          }
        })
      }
    })
  }

  private isMathRequest(message: string): boolean {
    const mathKeywords = ["calculate", "compute", "math", "equation", "solve"]
    const hasNumbers = /\d+/.test(message)
    const hasMathOperators = /[+\-*/=]/.test(message)

    return mathKeywords.some((keyword) => message.includes(keyword)) || (hasNumbers && hasMathOperators)
  }

  private isFollowUpQuestion(message: string): boolean {
    const followUpIndicators = [
      "also",
      "and",
      "what about",
      "how about",
      "can you",
      "tell me more",
      "explain",
      "why",
      "how",
      "when",
      "where",
    ]

    return (
      followUpIndicators.some((indicator) => message.startsWith(indicator) || message.includes(` ${indicator} `)) ||
      message.length < 50
    )
  }

  private updateCurrentTopic(message: string, agentUsed: string): void {
    if (agentUsed === "youtube-agent") {
      this.context.currentTopic = "YouTube Analysis"
    } else if (agentUsed === "travel-agent" && this.isTravelRequest(message.toLowerCase())) {
      this.context.currentTopic = "Travel Planning"
    } else if (agentUsed === "finance-agent") {
      this.context.currentTopic = "Finance & Markets"
    } else if (agentUsed === "news-agent") {
      this.context.currentTopic = "News & Current Events"
    } else if (agentUsed === "music-agent") {
      this.context.currentTopic = "Music Generation"
    } else if (agentUsed === "data-agent") {
      this.context.currentTopic = "Data Analysis"
    } else if (this.isMathRequest(message.toLowerCase())) {
      this.context.currentTopic = "Calculations"
    }
  }
}

// Export singleton instance
export const smartAgentRouter = new SmartAgentRouter()
