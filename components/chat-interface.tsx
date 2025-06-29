"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChatBubble } from "./chat-bubble"
import { ChatInput } from "./chat-input"
import { FileUpload } from "./file-upload"
import { VoiceInput } from "./voice-input"
import { Button } from "@/components/ui/button"
import { Paperclip, Mic, Send, Youtube } from "lucide-react"
import { chatApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: string[]
  type?: string
  source?: string
}

interface ChatInterfaceProps {
  agentId: string
}

export function ChatInterface({ agentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string, files?: string[]) => {
    if (!content.trim() && (!files || files.length === 0)) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      files,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setInput("")
    setUploadedFiles([])

    try {
      const response = await chatApi.sendMessage(agentId, content, files)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        type: response.type,
        source: response.source,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Show success toast for YouTube Assistant responses
      if (response.source === "YouTubeAgent" && response.type === "video_summary") {
        toast({
          title: "Video Analysis Complete! 🎉",
          description: "I've analyzed the video and provided a summary. Ask me anything about it!",
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
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input, uploadedFiles.length > 0 ? uploadedFiles : undefined)
  }

  const handleFileUpload = (files: string[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setShowFileUpload(false)
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) uploaded successfully`,
    })
  }

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript)
    setShowVoiceInput(false)
  }

  const isYouTubeAgent = agentId === "youtube-agent"

  return (
    <div className="glass-card-premium h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-white/70 py-8">
            <div className="mb-4">
              {isYouTubeAgent ? (
                <Youtube className="w-16 h-16 mx-auto text-red-500 mb-4" />
              ) : (
                <div className="text-4xl mb-4">🤖</div>
              )}
            </div>
            <p className="text-lg mb-2">
              {isYouTubeAgent ? "👋 Hi! I'm your YouTube Assistant" : "Start a conversation!"}
            </p>
            <p className="text-sm max-w-md mx-auto">
              {isYouTubeAgent
                ? "Paste any YouTube URL and I'll analyze it for you! I can provide summaries, answer questions, generate quizzes, and help clarify confusing concepts."
                : "Ask questions, upload files, or use voice input to interact with the agent."}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {loading && (
          <ChatBubble
            message={{
              id: "loading",
              content: isYouTubeAgent ? "Analyzing video content..." : "Thinking...",
              role: "assistant",
              timestamp: new Date(),
            }}
            isLoading
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <div className="glass-card-premium p-6 w-full max-w-md">
            <FileUpload onUpload={handleFileUpload} onCancel={() => setShowFileUpload(false)} />
          </div>
        </div>
      )}

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <div className="glass-card-premium p-6">
            <VoiceInput onTranscript={handleVoiceInput} onCancel={() => setShowVoiceInput(false)} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="glass-subtle px-3 py-1 rounded-full text-sm text-white/80">
                📎 {file}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(true)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceInput(true)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          <ChatInput
            value={input}
            onChange={setInput}
            placeholder={
              isYouTubeAgent ? "Paste a YouTube URL or ask me anything about the video..." : "Type your message..."
            }
            disabled={loading}
            className="flex-1"
          />

          <Button type="submit" disabled={loading || (!input.trim() && uploadedFiles.length === 0)} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
