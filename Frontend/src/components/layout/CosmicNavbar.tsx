import React, { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  BookOpen, 
  FlaskConical, 
  Newspaper, 
  Send, 
  CalendarDays,
  MessageSquare,
  Sparkles
} from "lucide-react"
import { siteNavigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

// アイコンマッピング
const iconMap: Record<string, React.ReactNode> = {
  "/": <Home className="w-4 h-4" />,
  "/about": <BookOpen className="w-4 h-4" />,
  "/research": <FlaskConical className="w-4 h-4" />,
  "/news": <Newspaper className="w-4 h-4" />,
  "/submission": <Send className="w-4 h-4" />,
  "/calendar": <CalendarDays className="w-4 h-4" />,
  "https://huggingface.co/spaces/kotaroutakasugi/lab-chatbot-up": <MessageSquare className="w-4 h-4" />
}

export const CosmicNavbar: React.FC = () => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const location = useLocation()

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-6 left-1/2 z-50 -translate-x-1/2 perspective-[1000px]"
    >
      <div className="relative group">
        {/* Animated Glow Backdrop */}
        <div className="absolute inset-[-4px] bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-full blur-xl opacity-70 animate-pulse group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Main Container */}
        <div className="relative flex items-center p-1.5 gap-1 rounded-full border border-white/10 bg-[#030712]/80 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(8,145,178,0.4)] overflow-hidden">
          
          {/* Animated Background Highlight */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

          <div className="flex items-center gap-1">
            {[{ label: "ホーム", to: "/" }, ...siteNavigation].map((item) => {
              const isActive = location.pathname === item.to
              const isHovered = hoveredPath === item.to
              const Icon = iconMap[item.to] || <Sparkles className="w-4 h-4" />

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onMouseEnter={() => setHoveredPath(item.to)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 z-10 whitespace-nowrap",
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  {/* Active/Hover Background Animation */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 bg-white/5 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon & Label */}
                  <span className="relative z-10 flex items-center justify-center">
                    {Icon}
                  </span>
                  <span className="relative z-10 hidden md:inline-block">{item.label}</span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]" />
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
