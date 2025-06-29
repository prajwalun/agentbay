"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { GlobalChatbot } from "@/components/global-chatbot"
import { Button } from "@/components/ui/button"
import { LogOut, Users2, TrendingUp, MapPin, Youtube, Bot, Activity, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { agentApi } from "@/lib/api"

interface Agent {
  id: string
  name: string
  description: string
  tools?: string[]
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        const [agentsData, creditsData] = await Promise.all([agentApi.getAgents(), agentApi.getCredits()])
        setAgents(agentsData)
        setCredits(creditsData.credits)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen black-gradient flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 spinner"></div>
            <span className="text-white text-lg">Loading workspace...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen black-gradient relative overflow-hidden">
      {/* Background particles */}
      <div className="particles-bg">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-8 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-cool rounded-2xl flex items-center justify-center animate-glow shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 status-online rounded-full animate-pulse-slow shadow-lg"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-gray-400">
                <span className="gradient-text-cool font-medium">{user?.email?.split("@")[0]}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 bg-gradient-cool rounded-full animate-pulse-slow"></div>
              <span className="text-white font-medium">{credits.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">credits</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="glass-button text-white hover:text-white rounded-xl p-3 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {[
              {
                icon: <Users2 className="w-5 h-5" />,
                label: "AI Agents",
                value: agents.length,
                color: "text-blue-400",
                bgGradient: "from-blue-500/10 to-cyan-500/10",
              },
              {
                icon: <Activity className="w-5 h-5" />,
                label: "Status",
                value: "Online",
                color: "text-emerald-400",
                bgGradient: "from-emerald-500/10 to-teal-500/10",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                label: "Response",
                value: "~2s",
                color: "text-purple-400",
                bgGradient: "from-purple-500/10 to-pink-500/10",
              },
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-xl p-4 hover-lift shadow-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg`}
                  >
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-8 mb-16">
          <div className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your <span className="gradient-text-cool">AI workspace</span> is ready
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Start a conversation and get connected with the right AI specialist
            </p>

            <Button
              onClick={() => setChatOpen(true)}
              className="btn-cool px-8 py-3 rounded-2xl font-semibold text-lg shadow-2xl hover-lift"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Conversation
            </Button>
          </div>
        </div>

        {/* Available Agents */}
        <div className="px-8 mb-16">
          <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-2xl font-bold text-white mb-2">Available Agents</h3>
            <p className="text-gray-400">Specialized AI for different tasks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: <Youtube className="w-5 h-5" />,
                title: "YouTube Assistant",
                description: "Video analysis and summaries",
                color: "text-red-400",
                bgGradient: "from-red-500/10 to-pink-500/10",
                status: "Active",
              },
              {
                icon: <MapPin className="w-5 h-5" />,
                title: "Travel Planner",
                description: "Custom itineraries and advice",
                color: "text-emerald-400",
                bgGradient: "from-emerald-500/10 to-teal-500/10",
                status: "Active",
              },
            ].map((agent, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 hover-lift group animate-scale-in shadow-lg"
                style={{ animationDelay: `${0.4 + index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.bgGradient} flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg`}
                  >
                    <div className={agent.color}>{agent.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">{agent.title}</h4>
                    <p className="text-gray-400 text-xs mb-2 leading-relaxed">{agent.description}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs text-emerald-400">{agent.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div className="px-8 pb-16">
          <div
            className="glass-card rounded-2xl p-8 text-center animate-slide-up shadow-xl"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="text-xl font-bold text-white mb-3">How it works</h3>
            <p className="text-gray-300 mb-6">Just start typing and I'll connect you with the right specialist</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-400" />
                <span>"Analyze this video"</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>"Plan a trip to Tokyo"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Chatbot */}
      <GlobalChatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} agents={agents} />
    </div>
  )
}
