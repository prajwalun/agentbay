export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  agentUsed?: string
  type?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export class ChatHistoryManager {
  private readonly STORAGE_KEY = "agentbay_chat_history"
  private readonly MAX_SESSIONS = 50

  // Get all chat sessions
  getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored)
      // Convert date strings back to Date objects
      return sessions
        .map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        .sort((a: ChatSession, b: ChatSession) => b.updatedAt.getTime() - a.updatedAt.getTime())
    } catch (error) {
      console.error("Error loading chat history:", error)
      return []
    }
  }

  // Save a chat session
  saveSession(messages: Message[]): string | null {
    if (messages.length < 2) return null // Don't save empty conversations

    try {
      const sessions = this.getAllSessions()
      const sessionId = this.generateSessionId()

      // Generate title from first user message
      const firstUserMessage = messages.find((m) => m.role === "user")
      const title = this.generateTitle(firstUserMessage?.content || "New Chat")

      const newSession: ChatSession = {
        id: sessionId,
        title,
        messages: messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      sessions.unshift(newSession) // Add to beginning

      // Keep only the most recent sessions
      if (sessions.length > this.MAX_SESSIONS) {
        sessions.splice(this.MAX_SESSIONS)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
      return sessionId
    } catch (error) {
      console.error("Error saving chat session:", error)
      return null
    }
  }

  // Get a specific session
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions()
    return sessions.find((session) => session.id === sessionId) || null
  }

  // Delete a session
  deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions()
      const filteredSessions = sessions.filter((session) => session.id !== sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions))
      return true
    } catch (error) {
      console.error("Error deleting chat session:", error)
      return false
    }
  }

  // Clear all history
  clearAllSessions(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error("Error clearing chat sessions:", error)
      return false
    }
  }

  // Search sessions by query
  searchSessions(query: string): ChatSession[] {
    const sessions = this.getAllSessions()
    const lowerQuery = query.toLowerCase()

    return sessions.filter((session) => {
      // Search in title
      if (session.title.toLowerCase().includes(lowerQuery)) {
        return true
      }

      // Search in message content
      return session.messages.some((message) => message.content.toLowerCase().includes(lowerQuery))
    })
  }

  // Get sessions by date groups
  getSessionsByDate(): { [key: string]: ChatSession[] } {
    const sessions = this.getAllSessions()
    const groups: { [key: string]: ChatSession[] } = {}

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    sessions.forEach((session) => {
      const sessionDate = session.updatedAt

      if (this.isSameDay(sessionDate, today)) {
        if (!groups["Today"]) groups["Today"] = []
        groups["Today"].push(session)
      } else if (this.isSameDay(sessionDate, yesterday)) {
        if (!groups["Yesterday"]) groups["Yesterday"] = []
        groups["Yesterday"].push(session)
      } else if (sessionDate > lastWeek) {
        if (!groups["Last 7 days"]) groups["Last 7 days"] = []
        groups["Last 7 days"].push(session)
      } else {
        const monthYear = sessionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        if (!groups[monthYear]) groups[monthYear] = []
        groups[monthYear].push(session)
      }
    })

    return groups
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateTitle(firstMessage: string): string {
    // Clean up the message and create a title
    let title = firstMessage.trim()

    // Remove URLs for cleaner titles
    title = title.replace(/https?:\/\/[^\s]+/g, "YouTube Video")

    // Truncate if too long
    if (title.length > 50) {
      title = title.substring(0, 47) + "..."
    }

    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1)

    return title || "New Chat"
  }

  private extractTopics(messages: Message[]): string[] {
    const topics = new Set<string>()

    messages.forEach((message) => {
      const content = message.content.toLowerCase()

      if (content.includes("youtube") || content.includes("video")) {
        topics.add("YouTube")
      }
      if (content.includes("travel") || content.includes("trip")) {
        topics.add("Travel")
      }
      if (content.includes("calculate") || content.includes("math")) {
        topics.add("Math")
      }
      if (message.agentUsed === "youtube-agent") {
        topics.add("YouTube")
      }
      if (message.agentUsed === "travel-agent") {
        topics.add("Travel")
      }
    })

    return Array.from(topics)
  }

  private generateSummary(messages: Message[]): string {
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length === 0) return "Empty conversation"

    if (userMessages.length === 1) {
      return `Single question about: ${userMessages[0].content.substring(0, 50)}...`
    }

    return `${userMessages.length} messages covering various topics`
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  }
}

// Export singleton instance
export const chatHistoryManager = new ChatHistoryManager()
