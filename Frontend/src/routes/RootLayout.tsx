import { Outlet, ScrollRestoration } from "react-router-dom"

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}

export default RootLayout

