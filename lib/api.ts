const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

const IS_DEV_MODE = !process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL === "MOCK"

// Mock data for development - all available agents
const MOCK_USER = { id: "dev-user", email: "demo@agentbay.com" }
const MOCK_TOKEN = "dev-token-123"
const MOCK_AGENTS = [
  {
    id: "youtube-agent",
    name: "YouTube Assistant",
    description:
      "Analyzes YouTube videos, provides summaries, generates quizzes, and answers questions about video content",
    tools: ["video_analysis", "quiz_generation", "question_answering", "doubt_clarification"],
  },
  {
    id: "travel-agent",
    name: "Travel Planner",
    description: "Creates personalized travel itineraries, researches destinations, and provides travel advice",
    tools: ["destination_research", "itinerary_planning", "budget_estimation", "travel_tips"],
  },
  {
    id: "finance-agent",
    name: "Finance Assistant",
    description: "Provides stock prices, market analysis, crypto data, and financial insights",
    tools: ["stock_prices", "market_analysis", "crypto_data", "portfolio_analysis"],
  },
  {
    id: "news-agent",
    name: "News Assistant",
    description: "Searches for news articles, breaking news, and current events across various topics",
    tools: ["news_search", "breaking_news", "topic_analysis", "news_summary"],
  },
  {
    id: "music-agent",
    name: "Music Generator",
    description: "Generates custom music using AI, creates compositions in various genres and styles",
    tools: ["music_generation", "composition", "genre_creation", "audio_processing"],
  },
  {
    id: "data-agent",
    name: "Data Analyst",
    description: "Analyzes data, processes CSV files, provides statistical insights and data visualizations",
    tools: ["data_analysis", "csv_processing", "statistics", "data_insights"],
  },
]

// Mock delay function
const mockDelay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // If mock mode, never hit the network.
    if (IS_DEV_MODE) throw new Error("Mock mode – network disabled")

    try {
      const url = `${this.baseURL}${endpoint}`
      const token = localStorage.getItem("auth_token")
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })
      if (!res.ok) throw new Error(`API Error ${res.status}`)
      return res.json()
    } catch (err) {
      // Re-throw so individual endpoint methods can decide how to fall back.
      throw err
    }
  }

  private async uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem("auth_token")

    const config: RequestInit = {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    if (IS_DEV_MODE) {
      await mockDelay(800) // Simulate network delay
      return { token: MOCK_TOKEN, user: MOCK_USER }
    }
    return this.request<{ token: string; user: { id: string; email: string } }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(email: string, password: string) {
    if (IS_DEV_MODE) {
      await mockDelay(800)
      return { token: MOCK_TOKEN, user: { ...MOCK_USER, email } }
    }
    return this.request<{ token: string; user: { id: string; email: string } }>("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // Agent endpoints
  async getAgents() {
    // If mock mode is on, or real request fails, return MOCK_AGENTS
    if (IS_DEV_MODE) {
      await mockDelay(500)
      return MOCK_AGENTS
    }
    try {
      return await this.request<
        Array<{ id: string; name: string; description: string; avatar?: string; tools?: string[] }>
      >("/agents")
    } catch (err) {
      console.error("[AgentBay] getAgents failed – falling back to mock:", err)
      return MOCK_AGENTS
    }
  }

  async createCustomAgent(agent: {
    name: string
    description: string
    tools: Array<{ name: string; purpose: string }>
  }) {
    if (IS_DEV_MODE) {
      await mockDelay(1000)
      return { id: `custom-${Date.now()}`, ...agent }
    }
    return this.request("/custom-agent", {
      method: "POST",
      body: JSON.stringify(agent),
    })
  }

  // Chat endpoints
  async sendMessage(agentId: string, message: string, files?: string[]) {
    if (IS_DEV_MODE) {
      await mockDelay(1200)
      const agent = MOCK_AGENTS.find((a) => a.id === agentId)

      // More realistic mock responses based on agent type
      if (agentId === "youtube-agent") {
        if (message.includes("youtube.com") || message.includes("youtu.be")) {
          return {
            message:
              "**Video Analysis Complete!**\n\n**Main Topic:**\nThis appears to be an educational video about technology and innovation.\n\n**Key Points:**\n• Introduction to core concepts\n• Practical applications and examples\n• Future implications and trends\n\n**Key Insights:**\nThe video provides valuable insights into modern technology trends and their impact on society.\n\n**What would you like to do next?**\n• Ask me questions about the content\n• Generate a quiz to test your understanding\n• Get clarification on any confusing parts",
            type: "video_summary",
            source: "YouTubeAgent",
          }
        } else {
          return {
            message:
              "Hi! I'm your YouTube Assistant\n\nI can help you analyze YouTube videos by providing:\n• Comprehensive summaries\n• Answers to your questions\n• Interactive quizzes\n• Clarification of confusing concepts\n\n**To get started, simply paste a YouTube URL here!**\n\nExample: `https://www.youtube.com/watch?v=VIDEO_ID`",
            type: "need_video",
            source: "YouTubeAgent",
          }
        }
      } else if (agentId === "finance-agent") {
        if (message.toLowerCase().includes("stock") || message.toLowerCase().includes("price")) {
          return {
            message:
              "**Apple Inc. (AAPL)**\n\nCurrent Price: $185.25 USD\nPrevious Close: $183.50\nChange: +1.75 (+0.95%)\nMarket Cap: $2,890,000,000,000\nVolume: 45,234,567\n52W High: $199.62\n52W Low: $164.08\n\n**Market Status:** Market is open\n**Last Updated:** Just now",
            type: "stock_price",
            source: "FinanceAgent",
          }
        } else {
          return {
            message:
              '**Finance Assistant**\n\nI can help you with:\n• Stock prices and quotes - "What\'s the price of AAPL?"\n• Cryptocurrency prices - "Bitcoin price" or "ETH price"\n• Market indicators - "Show me market indicators"\n• Portfolio analysis - "Calculate portfolio: AAPL:100,GOOGL:50"\n• Company fundamentals - "TSLA fundamentals"\n\nWhat financial information would you like to know?',
            type: "help",
            source: "FinanceAgent",
          }
        }
      } else if (agentId === "news-agent") {
        if (message.toLowerCase().includes("news")) {
          return {
            message:
              "**Latest Tech News**\n\n**Article 1:**\n• **AI Breakthrough: New Language Model Achieves Human-Level Performance**\n• Researchers announce significant advancement in natural language processing\n\n**Article 2:**\n• **Tech Giants Report Strong Q4 Earnings**\n• Major technology companies exceed analyst expectations\n\n**Article 3:**\n• **Quantum Computing Milestone Reached**\n• Scientists demonstrate practical quantum advantage in optimization problems\n\n**Article 4:**\n• **Renewable Energy Tech Sees Major Investment**\n• Clean technology sector attracts record funding levels\n\n**Article 5:**\n• **Cybersecurity Threats Evolve with AI**\n• New challenges emerge as artificial intelligence transforms security landscape",
            type: "tech_news",
            source: "NewsAgent",
          }
        } else {
          return {
            message:
              '**News Assistant**\n\nI can help you with:\n• Breaking news - "What\'s the latest breaking news?"\n• Technology news - "Show me tech news"\n• Business news - "Get business news"\n• Sports news - "Sports news today"\n• Topic search - "News about climate change"\n\nWhat news would you like to see?',
            type: "help",
            source: "NewsAgent",
          }
        }
      } else if (agentId === "music-agent") {
        if (message.toLowerCase().includes("generate") || message.toLowerCase().includes("music")) {
          return {
            message:
              '**Music Generation Initiated**\n\nI would create a custom music piece based on your request:\n\n**Your Prompt:** "' +
              message +
              '"\n\n**Generated Music Details:**\n• Genre: Based on your specifications\n• Duration: 2-3 minutes\n• Format: High-quality MP3\n• Style: Custom composition\n\n**Note:** In a full implementation, I would:\n• Process your musical requirements\n• Generate audio using AI models\n• Save the MP3 file\n• Provide download link\n\nThe music would be created with the style and characteristics you specified.',
            type: "music_generation",
            source: "MusicAgent",
          }
        } else {
          return {
            message:
              '**Music Generator**\n\nI can help you create custom music:\n• Generate music - "Generate a relaxing piano piece"\n• Create compositions - "Create upbeat electronic music"\n• Various genres - Classical, jazz, electronic, pop, rock, ambient\n• Custom styles - Specify instruments, tempo, mood\n\nExample: "Generate a peaceful acoustic guitar melody with soft drums"\n\nWhat kind of music would you like me to create?',
            type: "help",
            source: "MusicAgent",
          }
        }
      } else if (agentId === "data-agent") {
        if (message.toLowerCase().includes("analyze") || message.toLowerCase().includes("data")) {
          return {
            message:
              '**Data Analysis Ready**\n\nI can help you analyze data! Please provide:\n• CSV data to analyze\n• Specific questions about your data\n• Analysis requirements\n\n**Available Analysis:**\n• Statistical summaries - Mean, median, standard deviation\n• Data exploration - Column info, missing values, unique counts\n• Correlations - Relationships between variables\n• Grouping operations - Group by columns and aggregate\n• Data insights and patterns\n\nExample: "Analyze this sales data and show me monthly trends"\n\nWhat data analysis do you need help with?',
            type: "help",
            source: "DataAgent",
          }
        } else {
          return {
            message:
              "**Data Analysis Assistant**\n\nI can help you with:\n• CSV data analysis - Upload or paste CSV data\n• Statistical summaries - Mean, median, standard deviation\n• Data exploration - Column info, missing values, unique counts\n• Correlations - Relationships between variables\n• Grouping operations - Group by columns and aggregate\n• Data visualization insights\n\nTo get started:\n1. Provide CSV data (paste or upload)\n2. Ask specific questions about your data\n\nWhat data would you like me to analyze?",
            type: "help",
            source: "DataAgent",
          }
        }
      } else if (agentId === "travel-agent") {
        if (message.toLowerCase().includes("trip") || message.toLowerCase().includes("travel")) {
          return {
            message:
              "**5-Day Tokyo Itinerary**\n\n**Trip Overview:**\nAn exciting journey through Japan's vibrant capital, blending traditional culture with modern innovation.\n\n**Day 1: Arrival & Shibuya**\n• Morning: Arrive at Narita Airport, take train to Shibuya\n• Afternoon: Explore Shibuya Crossing and Hachiko Statue\n• Evening: Dinner in Shibuya, visit observation deck\n• Accommodation: Hotel in Shibuya district\n• Dining: Try authentic ramen at local shop\n\n**Day 2: Traditional Tokyo**\n• Morning: Visit Senso-ji Temple in Asakusa\n• Afternoon: Explore traditional markets\n• Evening: Experience a traditional tea ceremony\n\n**Budget Estimate:**\n• Accommodation: $100 - $200 per night\n• Food: $50 - $100 per day\n• Activities: $200 - $400 total\n• Transportation: $50 - $100\n• **Total Estimated Cost: $1,000 - $2,000**\n\n**Travel Tips:**\n• Get a JR Pass for unlimited train travel\n• Learn basic Japanese phrases\n• Carry cash as many places don't accept cards",
            type: "itinerary",
            source: "TravelAgent",
          }
        } else {
          return {
            message:
              "**Travel Planning Assistant**\n\nI'd love to help you plan a trip! Please tell me:\n• Where would you like to go?\n• How many days would you like to travel?\n\nFor example: 'Plan a 5-day trip to Tokyo' or 'Create an itinerary for Paris for 3 days'",
            type: "need_destination",
            source: "TravelAgent",
          }
        }
      }

      return { message: `Hello! I'm ${agent?.name}. How can I help you today?` }
    }

    // Determine agent type and format request accordingly
    let agentName = "TravelAgent" // Default to travel agent
    const input: any = { message }

    if (agentId === "youtube-agent") {
      agentName = "YouTubeAgent"
    } else if (agentId === "travel-agent") {
      agentName = "TravelAgent"
    } else if (agentId === "finance-agent") {
      agentName = "FinanceAgent"
    } else if (agentId === "news-agent") {
      agentName = "NewsAgent"
    } else if (agentId === "music-agent") {
      agentName = "MusicAgent"
    } else if (agentId === "data-agent") {
      agentName = "DataAgent"
    }

    return this.request<{ message: string; type?: string; source?: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({
        agent: agentName,
        input,
      }),
    })
  }

  // File upload endpoints
  async uploadFiles(files: File[]) {
    if (IS_DEV_MODE) {
      await mockDelay(1500)
      return files.map((file) => ({ name: file.name, url: `mock://uploaded/${file.name}` }))
    }
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })
    return this.uploadRequest<Array<{ name: string; url: string }>>("/upload", formData)
  }

  // Voice endpoints
  async transcribe(audioBlob: Blob) {
    if (IS_DEV_MODE) {
      await mockDelay(2000)
      const mockTranscripts = [
        "Please summarize this YouTube video: https://youtube.com/watch?v=example",
        "Plan a 5-day trip to Tokyo for me",
        "What's the stock price of Apple?",
        "Show me the latest tech news",
        "Generate a relaxing piano melody",
        "Analyze this sales data for trends",
      ]
      return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
    }
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.wav")
    const response = await this.uploadRequest<{ transcript: string }>("/transcribe", formData)
    return response.transcript
  }

  // Credits endpoint
  async getCredits() {
    if (IS_DEV_MODE) {
      await mockDelay(300)
      return { credits: 1_250 }
    }
    try {
      return await this.request<{ credits: number }>("/credits")
    } catch (err) {
      console.error("[AgentBay] getCredits failed – using 0 credits:", err)
      return { credits: 0 }
    }
  }
}

const apiClient = new ApiClient(API_BASE_URL)

// Export individual API modules
export const authApi = {
  login: apiClient.login.bind(apiClient),
  signup: apiClient.signup.bind(apiClient),
}

export const agentApi = {
  getAgents: apiClient.getAgents.bind(apiClient),
  createCustomAgent: apiClient.createCustomAgent.bind(apiClient),
  getCredits: apiClient.getCredits.bind(apiClient),
}

export const chatApi = {
  sendMessage: apiClient.sendMessage.bind(apiClient),
}

export const fileApi = {
  uploadFiles: apiClient.uploadFiles.bind(apiClient),
}

export const voiceApi = {
  transcribe: apiClient.transcribe.bind(apiClient),
}

export default apiClient
