import { Outlet, ScrollRestoration, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

const RootLayout: React.FC = () => {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (isAuthenticated && location.pathname !== "/calendar") {
      logout()
    }
  }, [isAuthenticated, location.pathname, logout])
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}

export default RootLayout

