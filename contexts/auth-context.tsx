"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userData = localStorage.getItem("user_data")

        // Only set user if both token and userData exist and are valid
        if (token && userData && token !== "null" && userData !== "null") {
          const parsedUser = JSON.parse(userData)
          // Validate the parsed user data
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser)
          } else {
            // Clear invalid data
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // Simple mock login - always succeeds
    const mockUser = { id: "test-user", email }
    setUser(mockUser)
    localStorage.setItem("auth_token", "mock-token")
    localStorage.setItem("user_data", JSON.stringify(mockUser))
  }

  const signup = async (email: string, password: string) => {
    // Simple mock signup - always succeeds
    const mockUser = { id: "test-user", email }
    setUser(mockUser)
    localStorage.setItem("auth_token", "mock-token")
    localStorage.setItem("user_data", JSON.stringify(mockUser))
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
