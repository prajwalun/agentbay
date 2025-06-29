"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChatInput } from "./chat-input"
import {
  X,
  Send,
  Youtube,
  MapPin,
  Bot,
  Brain,
  History,
  Plus,
  TrendingUp,
  Newspaper,
  Music,
  BarChart3,
} from "lucide-react"
import { chatApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { smartAgentRouter } from "@/lib/smart-agent-router"
import { chatHistoryManager, type ChatSession } from "@/lib/chat-history"
import { ChatHistorySidebar } from "./chat-history-sidebar"

interface Agent {
  id: string
  name: string
  description: string
  tools?: string[]
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  agentUsed?: string
  type?: string
  routingInfo?: {
    selectedAgent: string
    confidence: number
    reason: string
  }
}

interface GlobalChatbotProps {
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
}

export function GlobalChatbot({ isOpen, onClose, agents }: GlobalChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [showContext, setShowContext] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startNewChat()
    }
  }, [isOpen])

  // Save chat when closing
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      // More than just welcome message
      const sessionId = chatHistoryManager.saveSession(messages)
      if (sessionId) {
        console.log("Chat saved with ID:", sessionId)
      }
    }
  }, [isOpen, messages])

  const startNewChat = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: `Hi! I'm your AI Assistant with specialized capabilities.

I can help you with:
• YouTube video analysis - Paste any YouTube URL for summaries and insights
• Travel planning - Create custom itineraries for any destination  
• Finance & markets - Stock prices, crypto data, market analysis
• News & current events - Breaking news, tech news, business updates
• Music generation - Create custom music and compositions
• Data analysis - Process CSV files and generate insights
• Calculations & problem solving - Math, data analysis, and more

I'm context-aware and will remember our conversation to provide better assistance.`,
      role: "assistant",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
    setCurrentSessionId(null)
    smartAgentRouter.clearContext()
  }

  const handleClose = () => {
    // Save current chat if it has meaningful content
    if (messages.length > 1) {
      const sessionId = chatHistoryManager.saveSession(messages)
      if (sessionId) {
        toast({
          title: "Chat saved",
          description: "Your conversation has been saved to history",
        })
      }
    }

    // Clear everything for next session
    setMessages([])
    smartAgentRouter.clearContext()
    setCurrentSessionId(null)
    onClose()
  }

  const handleNewChat = () => {
    // Save current chat first
    if (messages.length > 1) {
      const sessionId = chatHistoryManager.saveSession(messages)
      if (sessionId) {
        toast({
          title: "Previous chat saved",
          description: "Starting a fresh conversation",
        })
      }
    }

    // Start fresh
    startNewChat()
  }

  const handleLoadSession = (session: ChatSession) => {
    // Save current chat first if it has content
    if (messages.length > 1 && !currentSessionId) {
      chatHistoryManager.saveSession(messages)
    }

    // Load the selected session
    const loadedMessages: Message[] = session.messages.map((msg) => ({
      ...msg,
      // Ensure all required properties are present
      id: msg.id || Date.now().toString(),
      timestamp: new Date(msg.timestamp),
    }))

    setMessages(loadedMessages)
    setCurrentSessionId(session.id)
    setShowHistory(false)

    // Clear context and rebuild from loaded messages
    smartAgentRouter.clearContext()
    loadedMessages.forEach((msg) => {
      if (msg.role === "user" && msg.agentUsed) {
        smartAgentRouter.updateContext(msg.content, msg.agentUsed)
      }
    })

    toast({
      title: "Chat loaded",
      description: `Loaded: ${session.title}`,
    })
  }

  const getAgentInfo = (agentId: string) => {
    switch (agentId) {
      case "youtube-agent":
        return {
          icon: <Youtube className="w-4 h-4" />,
          name: "YouTube Assistant",
          color: "text-red-400",
          bgGradient: "from-red-500/20 to-pink-500/20",
          borderColor: "border-red-500/30",
        }
      case "travel-agent":
        return {
          icon: <MapPin className="w-4 h-4" />,
          name: "Travel Planner",
          color: "text-emerald-400",
          bgGradient: "from-emerald-500/20 to-teal-500/20",
          borderColor: "border-emerald-500/30",
        }
      case "finance-agent":
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          name: "Finance Assistant",
          color: "text-green-400",
          bgGradient: "from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-500/30",
        }
      case "news-agent":
        return {
          icon: <Newspaper className="w-4 h-4" />,
          name: "News Assistant",
          color: "text-blue-400",
          bgGradient: "from-blue-500/20 to-indigo-500/20",
          borderColor: "border-blue-500/30",
        }
      case "music-agent":
        return {
          icon: <Music className="w-4 h-4" />,
          name: "Music Generator",
          color: "text-purple-400",
          bgGradient: "from-purple-500/20 to-pink-500/20",
          borderColor: "border-purple-500/30",
        }
      case "data-agent":
        return {
          icon: <BarChart3 className="w-4 h-4" />,
          name: "Data Analyst",
          color: "text-orange-400",
          bgGradient: "from-orange-500/20 to-red-500/20",
          borderColor: "border-orange-500/30",
        }
      default:
        return {
          icon: <Bot className="w-4 h-4" />,
          name: "AI Assistant",
          color: "text-blue-400",
          bgGradient: "from-blue-500/20 to-cyan-500/20",
          borderColor: "border-blue-500/30",
        }
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setInput("")

    try {
      // Use smart agent routing
      const routing = smartAgentRouter.routeMessage(content, agents)
      setCurrentAgent(routing.agentId)

      // Show routing decision
      toast({
        title: `${getAgentInfo(routing.agentId).name} selected`,
        description: `${routing.reason} (${Math.round(routing.confidence * 100)}% confidence)`,
      })

      const response = await chatApi.sendMessage(routing.agentId, content)

      // Update context with the conversation
      smartAgentRouter.updateContext(content, routing.agentId, response)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        agentUsed: routing.agentId,
        type: response.type,
        routingInfo: {
          selectedAgent: routing.agentId,
          confidence: routing.confidence,
          reason: routing.reason,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setCurrentAgent(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-scale-in">
        <div className="w-full max-w-lg h-full glass-card-dark flex flex-col animate-slide-right border-l border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-cool rounded-xl flex items-center justify-center animate-glow shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 status-online rounded-full shadow-lg"></div>
              </div>
              <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-cool animate-pulse-slow"></div>
                  <span className="text-sm text-gray-400">
                    {currentAgent ? `${getAgentInfo(currentAgent).name} thinking...` : "Ready to help"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="glass-button text-white hover:text-white rounded-xl p-2 shadow-lg"
                title="Chat history"
              >
                <History className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="glass-button text-white hover:text-white rounded-xl p-2 shadow-lg"
                title="New chat"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContext(!showContext)}
                className="glass-button text-white hover:text-white rounded-xl p-2 shadow-lg"
                title="Show context"
              >
                <Brain className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="glass-button text-white hover:text-white rounded-xl p-2 shadow-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Context Info */}
          {showContext && (
            <div className="p-4 border-b border-white/10 bg-black/20">
              <div className="text-xs text-gray-400 mb-2">Context:</div>
              <div className="text-xs text-white font-mono bg-black/30 p-2 rounded">
                {smartAgentRouter.getContextSummary()}
              </div>
              {currentSessionId && <div className="text-xs text-purple-400 mt-1">Loaded from history</div>}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3 chat-bubble">
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-cool text-white"
                        : "glass-card text-white border border-white/10"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                {message.agentUsed && message.role === "assistant" && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 ml-4">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${
                        getAgentInfo(message.agentUsed).bgGradient
                      } border ${getAgentInfo(message.agentUsed).borderColor} shadow-lg`}
                    >
                      <div className={getAgentInfo(message.agentUsed).color}>
                        {getAgentInfo(message.agentUsed).icon}
                      </div>
                      <span className="text-white font-medium">{getAgentInfo(message.agentUsed).name}</span>
                    </div>
                    {message.routingInfo && (
                      <div className="text-xs text-gray-500 ml-2" title={message.routingInfo.reason}>
                        {Math.round(message.routingInfo.confidence * 100)}% confidence
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start chat-bubble">
                <div className="glass-card border border-white/10 rounded-2xl px-4 py-3 max-w-[85%] shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    {currentAgent && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className={getAgentInfo(currentAgent).color}>{getAgentInfo(currentAgent).icon}</div>
                        <span className="text-white font-medium">{getAgentInfo(currentAgent).name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickPrompt("Analyze this YouTube video: ")}
                  className="text-xs px-3 py-2 glass-button rounded-xl text-white hover:text-white transition-all hover-lift flex items-center gap-2 shadow-lg"
                >
                  <Youtube className="w-3 h-3" />
                  YouTube Analysis
                </button>
                <button
                  onClick={() => handleQuickPrompt("Plan a trip to ")}
                  className="text-xs px-3 py-2 glass-button rounded-xl text-white hover:text-white transition-all hover-lift flex items-center gap-2 shadow-lg"
                >
                  <MapPin className="w-3 h-3" />
                  Travel Planning
                </button>
                <button
                  onClick={() => handleQuickPrompt("What's the stock price of ")}
                  className="text-xs px-3 py-2 glass-button rounded-xl text-white hover:text-white transition-all hover-lift flex items-center gap-2 shadow-lg"
                >
                  <TrendingUp className="w-3 h-3" />
                  Stock Prices
                </button>
                <button
                  onClick={() => handleQuickPrompt("Show me the latest news about ")}
                  className="text-xs px-3 py-2 glass-button rounded-xl text-white hover:text-white transition-all hover-lift flex items-center gap-2 shadow-lg"
                >
                  <Newspaper className="w-3 h-3" />
                  Latest News
                </button>
                <button
                  onClick={() => handleQuickPrompt("Generate music: ")}
                  className="text-xs px-3 py-2 glass-button rounded-xl text-white hover:text-white transition-all hover-lift flex items-center gap-2 shadow-lg"
                >
                  <Music className="w-3 h-3" />
                  Create Music
                </button>
                <button
                  onClick={() => handleQuickPrompt("Analyze this data: ")}
                  className="text-xs px-3 py-2 glass-button rounded-xl text-white hover:text-white transition-all hover-lift flex items-center gap-2 shadow-lg"
                >
                  <BarChart3 className="w-3 h-3" />
                  Data Analysis
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1 glass-card border-white/20 focus:border-blue-400 focus:ring-blue-400/20 bg-transparent text-white placeholder:text-gray-400 rounded-xl shadow-lg"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn-cool px-4 rounded-xl hover-lift shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadSession={handleLoadSession}
      />
    </>
  )
}
