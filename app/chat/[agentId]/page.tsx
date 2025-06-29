"use client"

import { useState } from "react"

import { useParams } from "next/navigation"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { agentApi } from "@/lib/api"

interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  tools?: string[]
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.agentId as string
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const agents = await agentApi.getAgents()
        const foundAgent = agents.find((a: Agent) => a.id === agentId)
        setAgent(foundAgent || null)
      } catch (error) {
        console.error("Failed to load agent:", error)
      } finally {
        setLoading(false)
      }
    }

    if (agentId) {
      fetchAgent()
    }

    // Redirect to dashboard since we now use unified chatbot
    router.push("/dashboard")
  }, [agentId, router])

  const getAgentIcon = (name: string) => {
    if (name?.toLowerCase().includes("data")) return "📊"
    if (name?.toLowerCase().includes("code")) return "💻"
    if (name?.toLowerCase().includes("content")) return "✍️"
    if (name?.toLowerCase().includes("research")) return "🔍"
    if (name?.toLowerCase().includes("language")) return "🗣️"
    if (name?.toLowerCase().includes("financial")) return "💰"
    return "🤖"
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-white">Loading agent...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Agent Not Found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p>Taking you to the unified AI assistant</p>
      </div>
    </div>
  )
}
