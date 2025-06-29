interface ChatContext {
  currentAgent?: string
  lastAgentUsed?: string
  conversationHistory: Array<{
    message: string
    agent: string
    timestamp: Date
  }>
  activeTopics: string[]
  videoContext?: {
    url: string
    title?: string
    summary?: string
  }
  travelContext?: {
    destination?: string
    duration?: number
    itinerary?: string
  }
}

export class ChatContextManager {
  private context: ChatContext = {
    conversationHistory: [],
    activeTopics: [],
  }

  updateContext(message: string, agent: string, response?: any) {
    // Add to conversation history
    this.context.conversationHistory.push({
      message,
      agent,
      timestamp: new Date(),
    })

    // Keep only last 10 messages for context
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-10)
    }

    // Update last agent used
    this.context.lastAgentUsed = agent

    // Update specific contexts based on agent
    if (agent === "youtube-agent") {
      this.updateYouTubeContext(message, response)
    } else if (agent === "travel-agent") {
      this.updateTravelContext(message, response)
    }

    // Update active topics
    this.updateActiveTopics(message, agent)
  }

  private updateYouTubeContext(message: string, response?: any) {
    const youtubeUrlMatch = message.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)

    if (youtubeUrlMatch) {
      this.context.videoContext = {
        url: message,
        title: response?.title,
        summary: response?.content,
      }
      this.context.activeTopics = ["youtube", "video-analysis"]
    }
  }

  private updateTravelContext(message: string, response?: any) {
    const travelKeywords = ["trip", "travel", "vacation", "itinerary", "destination"]
    if (travelKeywords.some((keyword) => message.toLowerCase().includes(keyword))) {
      // Extract destination and duration if possible
      const destinationMatch = message.match(/(?:to|visit|go to|travel to)\s+([A-Za-z\s,]+?)(?:\s+for|\s+\d+|$)/i)
      const durationMatch = message.match(/(\d+)\s*(?:days?|day)/i)

      this.context.travelContext = {
        destination: destinationMatch?.[1]?.trim(),
        duration: durationMatch ? Number.parseInt(durationMatch[1]) : undefined,
        itinerary: response?.content,
      }
      this.context.activeTopics = ["travel", "planning"]
    }
  }

  private updateActiveTopics(message: string, agent: string) {
    const messageLower = message.toLowerCase()

    // YouTube-related topics
    if (messageLower.includes("video") || messageLower.includes("youtube") || agent === "youtube-agent") {
      if (!this.context.activeTopics.includes("youtube")) {
        this.context.activeTopics.push("youtube")
      }
    }

    // Travel-related topics
    const travelKeywords = ["travel", "trip", "vacation", "destination", "itinerary"]
    if (travelKeywords.some((keyword) => messageLower.includes(keyword)) || agent === "travel-agent") {
      if (!this.context.activeTopics.includes("travel")) {
        this.context.activeTopics.push("travel")
      }
    }
  }

  intelligentAgentSelection(message: string): string {
    const messageLower = message.toLowerCase()

    // 1. Check for explicit YouTube content
    if (this.isYouTubeRelated(message)) {
      return "youtube-agent"
    }

    // 2. Check for explicit travel content
    if (this.isTravelRelated(message)) {
      return "travel-agent"
    }

    // 3. Context-aware routing based on conversation history
    if (this.context.activeTopics.length > 0) {
      return this.routeBasedOnContext(message)
    }

    // 4. Default routing
    return this.getDefaultAgent(message)
  }

  private isYouTubeRelated(message: string): boolean {
    const messageLower = message.toLowerCase()

    // Direct YouTube URL
    if (messageLower.includes("youtube.com") || messageLower.includes("youtu.be")) {
      return true
    }

    // Video-related keywords
    const videoKeywords = [
      "video",
      "youtube",
      "analyze video",
      "video analysis",
      "summarize video",
      "video summary",
      "transcript",
      "video content",
    ]

    return videoKeywords.some((keyword) => messageLower.includes(keyword))
  }

  private isTravelRelated(message: string): boolean {
    const messageLower = message.toLowerCase()

    const travelKeywords = [
      "travel",
      "trip",
      "vacation",
      "holiday",
      "visit",
      "itinerary",
      "plan",
      "destination",
      "tour",
      "explore",
      "journey",
      "flight",
      "hotel",
      "booking",
      "sightseeing",
      "travel plan",
      "places to visit",
    ]

    return travelKeywords.some((keyword) => messageLower.includes(keyword))
  }

  private routeBasedOnContext(message: string): string {
    const messageLower = message.toLowerCase()

    // If we have active video context and the message seems like a follow-up question
    if (this.context.videoContext && this.context.activeTopics.includes("youtube")) {
      // Check if this is likely a follow-up question about the video
      const followUpIndicators = [
        "who",
        "what",
        "when",
        "where",
        "why",
        "how",
        "tell me",
        "explain",
        "describe",
        "what about",
        "can you",
        "is there",
        "are there",
        "does the",
        "in the video",
        "from the video",
        "about the video",
        "the speaker",
        "the presenter",
        "the host",
        "the artist",
        "they mention",
        "it says",
        "according to",
      ]

      const isFollowUp = followUpIndicators.some((indicator) => messageLower.includes(indicator))

      // If it's a follow-up and not explicitly about travel, use YouTube agent
      if (isFollowUp && !this.isTravelRelated(message)) {
        return "youtube-agent"
      }
    }

    // If we have active travel context and the message seems like a follow-up
    if (this.context.travelContext && this.context.activeTopics.includes("travel")) {
      const travelFollowUps = [
        "what about",
        "how much",
        "where to",
        "when to",
        "best time",
        "recommend",
        "suggest",
        "alternative",
        "budget",
        "cost",
        "price",
        "accommodation",
        "hotel",
      ]

      const isTravelFollowUp = travelFollowUps.some((indicator) => messageLower.includes(indicator))

      if (isTravelFollowUp && !this.isYouTubeRelated(message)) {
        return "travel-agent"
      }
    }

    // Use the last agent if the message seems like a general follow-up
    const generalFollowUps = ["yes", "no", "thanks", "thank you", "ok", "okay", "continue", "more"]
    if (generalFollowUps.some((word) => messageLower.trim() === word) && this.context.lastAgentUsed) {
      return this.context.lastAgentUsed
    }

    // Default to most relevant based on active topics
    if (this.context.activeTopics.includes("youtube")) {
      return "youtube-agent"
    }

    return "travel-agent"
  }

  private getDefaultAgent(message: string): string {
    // Default routing logic for new conversations
    const messageLower = message.toLowerCase()

    // Math/calculation detection
    if (messageLower.includes("calculate") || messageLower.includes("math") || /\d+[+\-*/]\d+/.test(messageLower)) {
      return "travel-agent" // Using travel agent as general agent for now
    }

    // Default to travel agent for general queries
    return "travel-agent"
  }

  getContext(): ChatContext {
    return { ...this.context }
  }

  clearContext() {
    this.context = {
      conversationHistory: [],
      activeTopics: [],
    }
  }

  // Get context summary for debugging
  getContextSummary(): string {
    const summary = []

    if (this.context.videoContext) {
      summary.push(`📹 Video: ${this.context.videoContext.url}`)
    }

    if (this.context.travelContext?.destination) {
      summary.push(`🗺️ Travel: ${this.context.travelContext.destination}`)
    }

    if (this.context.activeTopics.length > 0) {
      summary.push(`🏷️ Topics: ${this.context.activeTopics.join(", ")}`)
    }

    if (this.context.lastAgentUsed) {
      summary.push(`🤖 Last Agent: ${this.context.lastAgentUsed}`)
    }

    return summary.join(" | ")
  }
}

// Export singleton instance
export const chatContextManager = new ChatContextManager()
