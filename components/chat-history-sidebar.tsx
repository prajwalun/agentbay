"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, Trash2, MessageSquare, Calendar } from "lucide-react"
import { chatHistoryManager, type ChatSession } from "@/lib/chat-history"
import { useToast } from "@/hooks/use-toast"

interface ChatHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  onLoadSession: (session: ChatSession) => void
}

export function ChatHistorySidebar({ isOpen, onClose, onLoadSession }: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chatHistoryManager.searchSessions(searchQuery)
      setFilteredSessions(filtered)
    } else {
      setFilteredSessions(sessions)
    }
  }, [searchQuery, sessions])

  const loadSessions = () => {
    const allSessions = chatHistoryManager.getAllSessions()
    setSessions(allSessions)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const success = chatHistoryManager.deleteSession(sessionId)
    if (success) {
      loadSessions()
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed from history",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the conversation",
        variant: "destructive",
      })
    }
  }

  const handleLoadSession = (session: ChatSession) => {
    onLoadSession(session)
    onClose()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getSessionPreview = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.role === "assistant") {
      return lastMessage.content.substring(0, 100) + "..."
    }
    return "No preview available"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-start animate-scale-in">
      <div className="w-full max-w-md h-full glass-card-dark flex flex-col animate-slide-left border-r border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-cool rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-white">Chat History</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="glass-button text-white hover:text-white rounded-xl p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20 focus:border-blue-400 bg-transparent text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">{searchQuery ? "No matching conversations" : "No chat history yet"}</p>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Try a different search term" : "Start a conversation to see it here"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleLoadSession(session)}
                  className="group glass-card border border-white/10 rounded-xl p-4 cursor-pointer hover:border-blue-400/50 transition-all hover-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate mb-1">{session.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{getSessionPreview(session)}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.createdAt)}</span>
                        <span>•</span>
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            {sessions.length} conversation{sessions.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>
    </div>
  )
}
