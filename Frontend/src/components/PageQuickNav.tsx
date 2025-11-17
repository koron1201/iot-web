import { NavLink } from "react-router-dom"

import { siteNavigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

const targetPaths = new Set(["/about", "/research", "/news", "/submission", "/contact"])
const navigationTargets = [
  { label: "ホーム", to: "/" },
  ...siteNavigation.filter((item) => targetPaths.has(item.to)),
]

type PageQuickNavProps = {
  className?: string
}

const baseLinkClass =
  "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"

export const PageQuickNav = ({ className }: PageQuickNavProps) => {
  if (navigationTargets.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-40 w-64 rounded-2xl border border-white/40 bg-white/90 p-4 text-slate-800 shadow-xl backdrop-blur-sm sm:right-6 sm:top-6",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Navigation</p>
      <div className="mt-3 space-y-2">
        {navigationTargets.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                baseLinkClass,
                isActive ? "bg-slate-900 text-white shadow" : "bg-white/60 text-slate-700 hover:bg-slate-100"
              )
            }
          >
            <span>{item.label}</span>
            <span className="text-xs text-slate-400">→</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default PageQuickNav

