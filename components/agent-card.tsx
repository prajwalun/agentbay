"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Star, Zap } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  tools?: string[]
}

interface AgentCardProps {
  agent: Agent
  showChatButton?: boolean
  onChat?: () => void
}

export function AgentCard({ agent, showChatButton = true, onChat }: AgentCardProps) {
  const getAgentColor = (name: string) => {
    if (name.toLowerCase().includes("data")) return "bg-blue-500"
    if (name.toLowerCase().includes("code")) return "bg-purple-500"
    if (name.toLowerCase().includes("content")) return "bg-emerald-500"
    if (name.toLowerCase().includes("research")) return "bg-orange-500"
    if (name.toLowerCase().includes("youtube")) return "bg-red-500"
    if (name.toLowerCase().includes("financial")) return "bg-yellow-500"
    return "bg-zinc-500"
  }

  return (
    <Card className="surface-primary rounded-3xl hover-lift group cursor-pointer border-0 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl ${getAgentColor(agent.name)}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <div className={`w-6 h-6 rounded-lg ${getAgentColor(agent.name)}`}></div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-title group-hover:text-white transition-colors">{agent.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-caption">4.9</span>
                <Zap className="w-3 h-3 text-emerald-400 ml-2" />
                <span className="text-caption">Active</span>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="text-body line-clamp-3 leading-relaxed">{agent.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {agent.tools && agent.tools.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {agent.tools.slice(0, 3).map((tool, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs surface-tertiary text-zinc-300 border-0 hover:bg-white/5 transition-colors"
              >
                {tool}
              </Badge>
            ))}
            {agent.tools.length > 3 && (
              <Badge variant="secondary" className="text-xs surface-tertiary text-zinc-300 border-0">
                +{agent.tools.length - 3}
              </Badge>
            )}
          </div>
        )}

        {showChatButton && (
          <Button
            onClick={onChat}
            className="w-full btn-secondary rounded-xl group-hover:btn-primary transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat with Agent
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
