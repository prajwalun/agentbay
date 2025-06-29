"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { X, Search, Star, Clock, SlidersHorizontal } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
  tools?: string[]
}

interface FilterState {
  search: string
  tools: string[]
  categories: string[]
  sortBy: "name" | "popularity" | "recent"
  sortOrder: "asc" | "desc"
}

interface AgentFilterProps {
  agents: Agent[]
  onFilterChange: (filteredAgents: Agent[]) => void
  className?: string
}

export function AgentFilter({ agents, onFilterChange, className }: AgentFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    tools: [],
    categories: [],
    sortBy: "name",
    sortOrder: "asc",
  })

  const allTools = Array.from(new Set(agents.flatMap((agent) => agent.tools || [])))
  const categories = ["Data Analysis", "Content Creation", "Development", "Research", "Education", "Finance", "General"]

  const getCategoryForAgent = (agent: Agent): string[] => {
    const name = agent.name.toLowerCase()
    const description = agent.description.toLowerCase()
    const detectedCategories: string[] = []

    if (name.includes("data") || description.includes("data") || description.includes("analysis")) {
      detectedCategories.push("Data Analysis")
    }
    if (
      name.includes("content") ||
      name.includes("writer") ||
      description.includes("content") ||
      description.includes("writing")
    ) {
      detectedCategories.push("Content Creation")
    }
    if (
      name.includes("code") ||
      name.includes("developer") ||
      description.includes("code") ||
      description.includes("development")
    ) {
      detectedCategories.push("Development")
    }
    if (name.includes("research") || description.includes("research") || description.includes("search")) {
      detectedCategories.push("Research")
    }
    if (
      name.includes("tutor") ||
      name.includes("teacher") ||
      description.includes("learn") ||
      description.includes("education")
    ) {
      detectedCategories.push("Education")
    }
    if (
      name.includes("financial") ||
      name.includes("finance") ||
      description.includes("financial") ||
      description.includes("investment")
    ) {
      detectedCategories.push("Finance")
    }
    if (detectedCategories.length === 0) {
      detectedCategories.push("General")
    }

    return detectedCategories
  }

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...agents]

    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase()
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchLower) ||
          agent.description.toLowerCase().includes(searchLower) ||
          agent.tools?.some((tool) => tool.toLowerCase().includes(searchLower)),
      )
    }

    if (newFilters.tools.length > 0) {
      filtered = filtered.filter((agent) => agent.tools?.some((tool) => newFilters.tools.includes(tool)))
    }

    if (newFilters.categories.length > 0) {
      filtered = filtered.filter((agent) => {
        const agentCategories = getCategoryForAgent(agent)
        return newFilters.categories.some((category) => agentCategories.includes(category))
      })
    }

    filtered.sort((a, b) => {
      let comparison = 0

      switch (newFilters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "popularity":
          const getPopularity = (agent: Agent) => {
            if (agent.id === "tutor-agent") return 5
            if (agent.id === "general-agent") return 4
            return Math.random() * 3 + 1
          }
          comparison = getPopularity(b) - getPopularity(a)
          break
        case "recent":
          comparison = agents.indexOf(b) - agents.indexOf(a)
          break
      }

      return newFilters.sortOrder === "desc" ? -comparison : comparison
    })

    onFilterChange(filtered)
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const toggleTool = (tool: string) => {
    const newTools = filters.tools.includes(tool) ? filters.tools.filter((t) => t !== tool) : [...filters.tools, tool]
    updateFilter("tools", newTools)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    updateFilter("categories", newCategories)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      tools: [],
      categories: [],
      sortBy: "name",
      sortOrder: "asc",
    }
    setFilters(clearedFilters)
    applyFilters(clearedFilters)
  }

  const hasActiveFilters = filters.search || filters.tools.length > 0 || filters.categories.length > 0

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="relative flex-1 mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <Input
          placeholder="Search agents by name, description, or tools..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-12 h-14 input-field rounded-2xl text-lg"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-4 mb-8">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button className={`btn-secondary h-12 px-6 rounded-2xl ${hasActiveFilters ? "surface-primary" : ""}`}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                  {filters.tools.length + filters.categories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 surface-primary border-0 rounded-3xl p-6" align="start">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-title">Filter Agents</CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="btn-ghost text-xs">
                    Clear All
                  </Button>
                )}
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <Label className="text-label">Sort By</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "name", label: "Name", icon: Search },
                    { key: "popularity", label: "Popular", icon: Star },
                    { key: "recent", label: "Recent", icon: Clock },
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={filters.sortBy === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter("sortBy", key)}
                      className={
                        filters.sortBy === key ? "btn-primary rounded-xl text-xs" : "btn-secondary rounded-xl text-xs"
                      }
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-label">Categories</Label>
                <div className="space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                        className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor={`category-${category}`} className="text-body cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Tools */}
              <div className="space-y-3">
                <Label className="text-label">Tools & Capabilities</Label>
                <div className="space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
                  {allTools.map((tool) => (
                    <div key={tool} className="flex items-center space-x-3">
                      <Checkbox
                        id={`tool-${tool}`}
                        checked={filters.tools.includes(tool)}
                        onCheckedChange={() => toggleTool(tool)}
                        className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor={`tool-${tool}`} className="text-body cursor-pointer">
                        {tool}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.categories.map((category) => (
              <Badge
                key={category}
                className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer rounded-xl"
                onClick={() => toggleCategory(category)}
              >
                {category}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.tools.map((tool) => (
              <Badge
                key={tool}
                className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 cursor-pointer rounded-xl"
                onClick={() => toggleTool(tool)}
              >
                {tool}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
