export type NavItem = {
  label: string
  to: string
  description?: string
}

export const siteNavigation: NavItem[] = [
  { label: "研究室概要", to: "/about" },
  { label: "研究内容", to: "/research" },
  { label: "ニュース", to: "/news" },
  { label: "成果物投稿", to: "/submission" },
  { label: "カレンダー", to: "/calendar" },
]

