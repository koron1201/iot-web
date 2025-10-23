import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteNavigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

const headerLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors",
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
  )

export const Header: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {siteNavigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={headerLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <MobileMenu open={open} onOpenChange={setOpen} />
        </div>
      </div>
    </header>
  )
}

type MobileMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="メニューを開く">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xs">
        <SheetHeader className="text-left">
          <SheetTitle>ナビゲーション</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          {siteNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
              onClick={() => onOpenChange(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default Header

