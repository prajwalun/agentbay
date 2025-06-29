"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function DevBanner() {
  const isDev = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_BASE_URL

  if (!isDev) return null

  return (
    <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-yellow-200">
        <strong>Development Mode:</strong> Using mock data. Any email/password will work for login.
      </AlertDescription>
    </Alert>
  )
}
