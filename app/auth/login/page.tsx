"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, Bot, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("demo@agentbay.com")
  const [password, setPassword] = useState("demo123")
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setLoading(true)
    try {
      await login("demo@agentbay.com", "demo123")
      router.push("/dashboard")
    } catch (error) {
      console.error("Quick login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen black-gradient flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background particles */}
      <div className="particles-bg">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Back to Home */}
      <Link href="/" className="absolute top-8 left-8 z-20">
        <Button className="glass-button text-white hover:text-white rounded-xl px-4 py-2 shadow-lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-cool mb-6 animate-float shadow-xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-cool mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your workspace</p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-6 animate-scale-in shadow-2xl" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 glass-card border-white/20 focus:border-blue-400 focus:ring-blue-400/20 bg-transparent text-white placeholder:text-gray-400 rounded-xl"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 glass-card border-white/20 focus:border-blue-400 focus:ring-blue-400/20 bg-transparent text-white placeholder:text-gray-400 rounded-xl"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 btn-cool rounded-xl font-medium group shadow-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-gray-400">Or</span>
              </div>
            </div>

            <Button
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full mt-4 h-11 glass-button text-white hover:text-white rounded-xl font-medium hover-lift shadow-xl"
            >
              Demo Access
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="gradient-text-cool hover:text-blue-300 transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
