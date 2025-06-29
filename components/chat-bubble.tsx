import { cn } from "@/lib/utils"
import { Bot, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: string[]
}

interface ChatBubbleProps {
  message: Message
  isLoading?: boolean
}

export function ChatBubble({ message, isLoading }: ChatBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 chat-bubble-enter", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-gradient-to-r from-green-500 to-blue-500" : "bg-gradient-to-r from-purple-500 to-pink-500",
        )}
      >
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
      </div>

      {/* Message Content */}
      <div className={cn("max-w-[70%] glass-card p-3", isUser ? "bg-primary/20" : "bg-white/5")}>
        {/* Files */}
        {message.files && message.files.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.files.map((file, index) => (
              <div key={index} className="text-xs text-white/60 flex items-center gap-1">
                📎 {file}
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        <div className="text-white">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-white/70">{message.content}</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-white/40 mt-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}
