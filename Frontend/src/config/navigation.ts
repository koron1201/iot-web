export type NavItem = {
  label: string
  to: string
  description?: string
}

export const siteNavigation: NavItem[] = [
  { label: "研究室概要", to: "/about" },
  { label: "研究内容", to: "/research" },
  { label: "メンバー", to: "/members" },
  { label: "ニュース", to: "/news" },
  { label: "お問い合わせ", to: "/contact" },
]

