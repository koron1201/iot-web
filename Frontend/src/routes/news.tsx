import React, { useState } from "react"
import { newsItems } from "@/data/news"
import type { NewsItem } from "@/data/news"
import { cn } from "@/lib/utils"
import { CosmicNavbar } from "@/components/layout/CosmicNavbar"

// カテゴリ別のバッジスタイル
const getCategoryBadge = (category: string) => {
  switch (category) {
    case "重要":
      return "bg-gradient-to-r from-rose-500/20 to-amber-400/10 text-rose-100 border border-rose-400/50"
    case "イベント":
      return "bg-gradient-to-r from-emerald-500/20 to-teal-400/10 text-emerald-100 border border-emerald-400/40"
    case "お知らせ":
      return "bg-gradient-to-r from-sky-500/20 to-cyan-400/10 text-sky-100 border border-sky-400/40"
    default:
      return "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-100 border border-indigo-400/40"
  }
}

//Modalコンポーネントの定義
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  date: string
  details: string[]
  category: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, date, details, category }) => {
  if (!isOpen) return null

  return (
    // オーバーレイ
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 p-4"
      onClick={onClose} 
    >
      
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 shadow-2xl shadow-indigo-900/40"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/80">{category}</p>
              <h2 className="mt-2 text-2xl font-bold text-white drop-shadow-md">{title}</h2>
              <p className="mt-1 text-sm text-cyan-100/70">{date}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryBadge(category)}`}>
              {category}
            </span>
          </div>

          {/* コンテンツ本体 */}
          <div className="space-y-4 leading-relaxed text-slate-100/90">
            {details.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* フッターボタン*/}
          <div className="mt-8 pt-5 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium shadow-lg shadow-cyan-500/30 transition duration-300 hover:shadow-cyan-400/40"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

//コンポーネント本体
export const News: React.FC = () => {
  // ポップアップの表示
  const [isModalOpen, setIsModalOpen] = useState(false)
  // 現在選択されているニュース
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  const openNewsModal = (newsItem: NewsItem) => {
    setSelectedNews(newsItem)
    setIsModalOpen(true)
  }

  const closeNewsModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedNews(null), 300) 
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-950 to-indigo-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 md:px-6 lg:px-8">
        {/* ページタイトル */}
        <CosmicNavbar />
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Latest Updates</p>
            <h1 className="mt-2 text-3xl font-semibold text-white drop-shadow-md">
              ニュース
            </h1>
          </div>
        </div>

        {/* カテゴリ凡例 */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          {["重要", "イベント", "お知らせ", "その他"].map((category) => (
            <span key={category} className={`rounded-full px-3 py-1 font-semibold ${getCategoryBadge(category === "その他" ? "その他" : category)}`}>
              {category}
            </span>
          ))}
        </div>

        {/* ニュースリスト */}
        <ul className="mt-10 space-y-4">
          {newsItems.map((news) => (
            <li key={news.id}>
              <button
                onClick={() => openNewsModal(news)} 
                className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-lg shadow-indigo-900/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-indigo-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* 日付とカテゴリ */}
                  <div className="flex items-center gap-3 text-sm text-cyan-100/80">
                    <span className="min-w-[90px] rounded-full border border-white/10 bg-black/30 px-3 py-1 text-center">
                      {news.date}
                    </span>
                    <span className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-semibold ${getCategoryBadge(news.category)}`}>
                      {news.category}
                    </span>
                  </div>

                  {/* タイトル & サマリー */}
                  <div className="flex-1 text-left">
                    <p className="text-base font-semibold text-white transition-colors duration-300 group-hover:text-cyan-100">
                      {news.title}
                    </p>
                    <p className="mt-1 text-sm text-cyan-100/70">
                      {news.summary}
                    </p>
                  </div>

                  {/* 矢印アイコン */}
                  <svg
                    className="hidden h-5 w-5 text-cyan-200/60 transition-transform duration-300 sm:block group-hover:translate-x-1 group-hover:text-cyan-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
        
        {/* Modalコンポーネント呼び出し*/}
        {selectedNews && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeNewsModal}
            title={selectedNews.title}
            date={selectedNews.date}
            details={selectedNews.details}
            category={selectedNews.category}
          />
        )}
      </div>
    </div>
  )
}

export default News