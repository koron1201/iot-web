import { Outlet, ScrollRestoration } from "react-router-dom"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"

const RootLayout: React.FC = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}

export default RootLayout

