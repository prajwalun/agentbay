"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Youtube, MessageSquare, FileText } from "lucide-react"

interface YouTubeInputHelperProps {
  onSubmit: (message: string) => void
  disabled?: boolean
}

export function YouTubeInputHelper({ onSubmit, disabled }: YouTubeInputHelperProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [mode, setMode] = useState<"summary" | "qa">("summary")
  const [question, setQuestion] = useState("")
  const [showHelper, setShowHelper] = useState(false)

  const handleSubmit = () => {
    if (!youtubeUrl) return

    let message = youtubeUrl
    if (mode === "qa" && question) {
      message = `${youtubeUrl} ${question}`
    }

    onSubmit(message)
    setYoutubeUrl("")
    setQuestion("")
    setShowHelper(false)
  }

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    return youtubeRegex.test(url)
  }

  if (!showHelper) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHelper(true)}
        className="glass-subtle border-white/20 text-white hover:bg-white/10 bg-transparent"
      >
        <Youtube className="w-4 h-4 mr-2" />
        YouTube Helper
      </Button>
    )
  }

  return (
    <Card className="glass-card-premium mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          YouTube Video Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-300">YouTube URL</Label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-300">What would you like to do?</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={mode === "summary" ? "default" : "outline"}
              onClick={() => setMode("summary")}
              className={
                mode === "summary"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "glass-subtle border-white/20 text-white hover:bg-white/10"
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              Summarize
            </Button>
            <Button
              variant={mode === "qa" ? "default" : "outline"}
              onClick={() => setMode("qa")}
              className={
                mode === "qa"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "glass-subtle border-white/20 text-white hover:bg-white/10"
              }
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </div>
        </div>

        {mode === "qa" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Your Question</Label>
            <Textarea
              placeholder="What would you like to know about this video?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={disabled || !youtubeUrl || !isValidYouTubeUrl(youtubeUrl) || (mode === "qa" && !question)}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            {mode === "summary" ? "Generate Summary" : "Ask Question"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowHelper(false)}
            className="glass-subtle border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
