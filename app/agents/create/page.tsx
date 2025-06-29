"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X, Sparkles, Zap, Bot } from "lucide-react"
import Link from "next/link"
import { agentApi } from "@/lib/api"

export default function CreateAgentPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tools, setTools] = useState<{ name: string; purpose: string }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addTool = () => {
    setTools([...tools, { name: "", purpose: "" }])
  }

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index))
  }

  const updateTool = (index: number, field: "name" | "purpose", value: string) => {
    const updatedTools = tools.map((tool, i) => (i === index ? { ...tool, [field]: value } : tool))
    setTools(updatedTools)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await agentApi.createCustomAgent({
        name,
        description,
        tools: tools.filter((tool) => tool.name && tool.purpose),
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create agent:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Create Custom Agent</h1>
            <p className="text-gray-400 mt-1">Design your perfect AI assistant</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="glass-card-premium animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Define your agent's core identity and purpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Agent Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Data Analyst Pro, Creative Writer, Code Reviewer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:ring-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this agent does and how it can help users. Be specific about its capabilities and use cases..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="min-h-[120px] bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:ring-white/20 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tools & Capabilities */}
          <Card className="glass-card-premium animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5" />
                    Tools & Capabilities
                  </CardTitle>
                  <CardDescription>Add specific tools and functions your agent can use</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTool}
                  className="glass-subtle border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tools.map((tool, index) => (
                <div key={index} className="glass-subtle p-6 rounded-xl space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Tool {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTool(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">Tool Name</Label>
                      <Input
                        placeholder="e.g., Web Search, Calculator, Image Generator"
                        value={tool.name}
                        onChange={(e) => updateTool(index, "name", e.target.value)}
                        className="h-10 bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:ring-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">Purpose</Label>
                      <Input
                        placeholder="What does this tool do?"
                        value={tool.purpose}
                        onChange={(e) => updateTool(index, "purpose", e.target.value)}
                        className="h-10 bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:ring-white/20"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {tools.length === 0 && (
                <div className="text-center py-12 glass-subtle rounded-xl">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No tools added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Tool" to give your agent specific capabilities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 pt-4 animate-fade-in">
            <Button
              type="submit"
              disabled={loading || !name || !description}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
            >
              {loading ? "Creating Agent..." : "Create Agent"}
            </Button>
            <Link href="/dashboard">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-8 glass-subtle border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
