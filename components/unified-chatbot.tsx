"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChatInput } from "./chat-input"
import { ChatBubble } from "./chat-bubble"
import { X, Bot, Sparkles, Youtube, Calculator, Zap } from "lucide-react"
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

interface UnifiedChatbotProps {
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
}

export function UnifiedChatbot({ isOpen, onClose, agents }: UnifiedChatbotProps) {
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

  // Reset when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        content: `👋 **Hi! I'm your AI Assistant**

I can help you with:
• 📹 **YouTube video analysis** - Paste any YouTube URL
• 🧮 **Calculations & math** - Ask me to solve problems  
• 📝 **Content creation** - Writing, editing, brainstorming
• 🔍 **Research & analysis** - Finding information and insights
• 💻 **Code review** - Programming help and debugging
• 📊 **Data analysis** - Working with data and creating insights

**Just ask me anything, and I'll connect you with the right specialist!**`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  const detectIntentAndAgent = (message: string): string => {
    const messageLower = message.toLowerCase()

    // YouTube detection
    if (
      messageLower.includes("youtube.com") ||
      messageLower.includes("youtu.be") ||
      messageLower.includes("video") ||
      messageLower.includes("youtube")
    ) {
      return "youtube-agent"
    }

    // Math/calculation detection
    if (
      messageLower.includes("calculate") ||
      messageLower.includes("math") ||
      messageLower.includes("solve") ||
      /\d+[+\-*/]\d+/.test(messageLower) ||
      messageLower.includes("equation")
    ) {
      return "general-agent"
    }

    // Content creation detection
    if (
      messageLower.includes("write") ||
      messageLower.includes("content") ||
      messageLower.includes("blog") ||
      messageLower.includes("article") ||
      messageLower.includes("creative")
    ) {
      return "general-agent"
    }

    // Default to general agent
    return "general-agent"
  }

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "youtube-agent":
        return <Youtube className="w-4 h-4 text-red-500" />
      case "general-agent":
        return <Calculator className="w-4 h-4 text-blue-500" />
      default:
        return <Bot className="w-4 h-4 text-purple-500" />
    }
  }

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    return agent?.name || "AI Assistant"
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
      // Detect which agent to use
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

      // Show agent notification
      if (selectedAgent === "youtube-agent") {
        toast({
          title: "🎬 YouTube Assistant activated",
          description: "Analyzing your video content...",
        })
      } else if (selectedAgent === "general-agent") {
        toast({
          title: "🤖 General Assistant activated",
          description: "Processing your request...",
        })
      }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="surface-primary rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-title">AI Assistant</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-caption">
                  {currentAgent ? `${getAgentName(currentAgent)} is thinking...` : "Ready to help"}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="btn-ghost rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id}>
              <ChatBubble message={message} />
              {message.agentUsed && message.role === "assistant" && (
                <div className="flex items-center gap-2 mt-2 ml-11">
                  {getAgentIcon(message.agentUsed)}
                  <span className="text-xs text-gray-400">Powered by {getAgentName(message.agentUsed)}</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div>
              <ChatBubble
                message={{
                  id: "loading",
                  content: currentAgent === "youtube-agent" ? "Analyzing video content..." : "Thinking...",
                  role: "assistant",
                  timestamp: new Date(),
                }}
                isLoading
              />
              {currentAgent && (
                <div className="flex items-center gap-2 mt-2 ml-11">
                  {getAgentIcon(currentAgent)}
                  <span className="text-xs text-gray-400">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {getAgentName(currentAgent)} is working...
                  </span>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <ChatInput
              value={input}
              onChange={setInput}
              placeholder="Ask me anything... I'll find the right agent to help you!"
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="btn-primary rounded-xl px-6">
              <Zap className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Try: "Analyze this YouTube video", "Calculate 15% of 200", or "Help me write a blog post"
          </p>
        </div>
      </div>
    </div>
  )
}
