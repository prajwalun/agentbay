"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChatInput } from "./chat-input"
import { X, Send, Youtube, MapPin, Bot } from "lucide-react"
import { chatApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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
}

interface ProfessionalChatbotProps {
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
  initialMessage?: string
  onMessageSent?: () => void
}

export function ProfessionalChatbot({
  isOpen,
  onClose,
  agents,
  initialMessage = "",
  onMessageSent,
}: ProfessionalChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle initial message
  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 0) {
      // Send the initial message automatically
      sendMessage(initialMessage)
      onMessageSent?.()
    } else if (isOpen && !initialMessage && messages.length === 0) {
      // Show welcome message only if no initial message
      const welcomeMessage: Message = {
        id: "welcome",
        content: `Hi! I'm your AI assistant.

**I can help you with:**
• YouTube video analysis and summaries
• Travel planning and itineraries

What would you like to work on?`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, initialMessage])

  const detectIntentAndAgent = (message: string): string => {
    const messageLower = message.toLowerCase()

    if (
      messageLower.includes("youtube.com") ||
      messageLower.includes("youtu.be") ||
      messageLower.includes("video") ||
      messageLower.includes("youtube") ||
      messageLower.includes("analyze")
    ) {
      return "youtube-agent"
    }

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
    ]
    if (travelKeywords.some((keyword) => messageLower.includes(keyword))) {
      return "travel-agent"
    }

    return "travel-agent"
  }

  const getAgentInfo = (agentId: string) => {
    switch (agentId) {
      case "youtube-agent":
        return {
          icon: <Youtube className="w-3 h-3" />,
          name: "YouTube Assistant",
          color: "text-red-400",
          bgGradient: "from-red-500/10 to-pink-500/10",
        }
      case "travel-agent":
        return {
          icon: <MapPin className="w-3 h-3" />,
          name: "Travel Planner",
          color: "text-emerald-400",
          bgGradient: "from-emerald-500/10 to-teal-500/10",
        }
      default:
        return {
          icon: <Bot className="w-3 h-3" />,
          name: "AI Assistant",
          color: "text-blue-400",
          bgGradient: "from-blue-500/10 to-cyan-500/10",
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
      const selectedAgent = detectIntentAndAgent(content)
      setCurrentAgent(selectedAgent)

      const response = await chatApi.sendMessage(selectedAgent, content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        agentUsed: selectedAgent,
        type: response.type,
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end animate-scale-in">
      <div className="w-full max-w-md h-full glass-card-dark flex flex-col animate-slide-right border-l border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-cool rounded-lg flex items-center justify-center animate-glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 status-online rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-cool animate-pulse-slow"></div>
                <span className="text-xs text-gray-400">
                  {currentAgent ? `${getAgentInfo(currentAgent).name} thinking...` : "Ready"}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="glass-button text-white hover:text-white rounded-lg p-1.5"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2 chat-bubble">
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-cool text-white"
                      : "glass-card text-white border border-white/10"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1.5 ${message.role === "user" ? "text-white/70" : "text-gray-400"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {message.agentUsed && message.role === "assistant" && (
                <div className="flex items-center gap-2 text-xs text-gray-400 ml-3">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r ${
                      getAgentInfo(message.agentUsed).bgGradient
                    } border border-white/10`}
                  >
                    <div className={getAgentInfo(message.agentUsed).color}>{getAgentInfo(message.agentUsed).icon}</div>
                    <span className="text-white font-medium text-xs">{getAgentInfo(message.agentUsed).name}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start chat-bubble">
              <div className="glass-card border border-white/10 rounded-xl px-3 py-2 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  {currentAgent && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className={getAgentInfo(currentAgent).color}>{getAgentInfo(currentAgent).icon}</div>
                      <span className="text-white">{getAgentInfo(currentAgent).name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <ChatInput
                value={input}
                onChange={setInput}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 glass-card border-white/20 focus:border-blue-400 focus:ring-blue-400/20 bg-transparent text-white placeholder:text-gray-400 rounded-lg text-sm"
              />
              <Button type="submit" disabled={loading || !input.trim()} className="btn-cool px-3 rounded-lg hover-lift">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
