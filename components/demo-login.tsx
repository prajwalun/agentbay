"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function DemoLogin() {
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isDev = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_BASE_URL

  if (!isDev) return null

  const handleDemoLogin = async () => {
    try {
      await login("demo@agentbay.com", "demo123")
      toast({
        title: "Demo login successful!",
        description: "Welcome to AgentBay demo mode.",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Demo login failed",
        description: "Something went wrong with the demo login.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDemoLogin}
      className="w-full mt-2 glass border-white/20 bg-transparent text-white hover:bg-white/10"
    >
      🚀 Quick Demo Login
    </Button>
  )
}
