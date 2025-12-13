export type NewsCategory = "重要" | "イベント" | "その他" | "お知らせ"

export type NewsItem = {
  id: number
  date: string
  title: string
  category: NewsCategory
  summary: string
  details: string[]
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    date: "2025.11.06",
    title: "Webサイト開設",
    category: "お知らせ",
    summary: "研究室の公式ウェブサイトを公開し、情報発信を強化します。",
    details: [
      "研究室の活動報告や最新ニュースを集約するウェブサイトを公開しました。",
      "学生向けの配属情報やイベント案内も順次追加していく予定です。",
      "ご意見・ご要望はお問い合わせフォームより受け付けています。",
    ],
  },
]

export const newsItems: NewsItem[] = [...NEWS_DATA].sort((a, b) => b.date.localeCompare(a.date))

