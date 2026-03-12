import React, { createContext, useContext, useMemo, useState } from "react"
import { verifyCredentials } from "@/lib/auth"

type AuthContextValue = {
  isAuthenticated: boolean
  login: (id: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const login = (id: string, password: string) => {
    const ok = verifyCredentials(id, password)
    setIsAuthenticated(ok)
    return ok
  }

  const logout = () => {
    setIsAuthenticated(false)
  }

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)


