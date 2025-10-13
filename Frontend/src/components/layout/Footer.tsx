import { Link } from "react-router-dom"

import { siteNavigation } from "@/config/navigation"

const currentYear = new Date().getFullYear()

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Smart ICT Lab</p>
          <p>東京電機大学 理工学部 情報システムデザイン学系</p>
          <p>スマートICTソリューション研究室</p>
          <p>© {currentYear} Smart ICT Lab. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {siteNavigation.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default Footer

