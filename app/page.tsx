"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Users2, TrendingUp, Activity, Youtube, MapPin } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Only redirect if user is actually logged in and we're not in loading state
    if (!loading && user) {
      setShouldRedirect(true)
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 1000) // Small delay to show the redirect message

      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen black-gradient flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 spinner"></div>
            <span className="text-white text-lg">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show redirect message if user is logged in
  if (shouldRedirect) {
    return (
      <div className="min-h-screen black-gradient flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 bg-gradient-cool rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-gray-400 mb-4">Taking you to your workspace...</p>
          <div className="w-8 h-8 spinner mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen black-gradient relative overflow-hidden">
      {/* Background particles */}
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-8 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-cool rounded-2xl flex items-center justify-center animate-glow shadow-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text-cool">AgentBay</h1>
            <p className="text-sm text-gray-400">AI Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button className="glass-button text-white hover:text-white rounded-xl px-6 py-2 font-medium shadow-lg">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="btn-cool px-6 py-2 rounded-xl font-medium shadow-xl">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-16 pb-24">
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Intelligent workspace for <span className="gradient-text-cool">AI automation</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with specialized AI agents. Get expert assistance in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth/signup">
              <Button className="btn-cool px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover-lift">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="glass-button text-white hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover-lift">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {[
            {
              icon: <Users2 className="w-6 h-6" />,
              label: "AI Agents",
              value: "2+",
              color: "text-blue-400",
              bgGradient: "from-blue-500/10 to-cyan-500/10",
            },
            {
              icon: <Activity className="w-6 h-6" />,
              label: "Uptime",
              value: "99.9%",
              color: "text-emerald-400",
              bgGradient: "from-emerald-500/10 to-teal-500/10",
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              label: "Response Time",
              value: "~2s",
              color: "text-purple-400",
              bgGradient: "from-purple-500/10 to-pink-500/10",
            },
          ].map((stat, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 hover-lift text-center shadow-xl">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Agents Preview */}
        <div className="mt-32">
          <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-4xl font-bold text-white mb-4">Available Agents</h2>
            <p className="text-gray-400 text-lg">Specialized AI for different tasks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Youtube className="w-5 h-5" />,
                title: "YouTube Assistant",
                description: "Video analysis, summaries, and Q&A",
                color: "text-red-400",
                bgGradient: "from-red-500/10 to-pink-500/10",
                features: ["Summaries", "Q&A", "Analysis"],
              },
              {
                icon: <MapPin className="w-5 h-5" />,
                title: "Travel Planner",
                description: "Custom itineraries and travel advice",
                color: "text-emerald-400",
                bgGradient: "from-emerald-500/10 to-teal-500/10",
                features: ["Itineraries", "Planning", "Insights"],
              },
            ].map((agent, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 hover-lift group animate-scale-in shadow-xl"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.bgGradient} flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg`}
                  >
                    <div className={agent.color}>{agent.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{agent.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{agent.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-md border border-white/10"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24">
          <div
            className="glass-card rounded-3xl p-12 text-center animate-slide-up shadow-2xl"
            style={{ animationDelay: "0.5s" }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get <span className="gradient-text-cool">started</span>?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join professionals who use AgentBay for intelligent automation
            </p>
            <Link href="/auth/signup">
              <Button className="btn-cool px-8 py-3 rounded-2xl font-semibold shadow-2xl hover-lift">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-cool rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text-cool">AgentBay</span>
            </div>
            <p className="text-gray-400 text-sm">© 2024 AgentBay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
