import React, { useState } from 'react'
import { PageQuickNav } from "@/components/PageQuickNav"

//ニュースデータの型定義
interface NewsItem {
  id: number
  date: string // 日付
  title: string // タイトル
  category: string // カテゴリ
  // ポップアップ
  fullContent: React.ReactNode 
}

//ニュースデータ
const dummyNews: NewsItem[] = [
  {
    id: 1,
    date: '2025.12.06',
    title: 'Webサイト開設',
    category: 'お知らせ',
    fullContent: (
      <p>
        ゼミのウェブサイトが開設されました。
        活動報告や連絡事項をこちらのサイトを通じてお知らせしていきます。
      </p>
    ),
  },
 
]

//Modalコンポーネントの定義
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  date: string
  content: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, date, content }) => {
  if (!isOpen) return null

  return (
    // オーバーレイ
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 p-4"
      onClick={onClose} 
    >
      
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start border-b pb-3 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{date}</p>
                </div>
            </div>

            {/* コンテンツ本体 */}
            <div className="text-gray-700 space-y-4 leading-relaxed">
                {content}
            </div>

            {/* フッターボタン*/}
            <div className="mt-8 pt-4 border-t flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300"
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
    <div className="container py-12 px-4 md:px-6 lg:px-8">
      {/* ページタイトル */}
      <PageQuickNav/>
      <h1 className="text-4xl font-extrabold text-gray-900 border-b-4 border-indigo-600 pb-2 mb-10 inline-block">
        ニュース
      </h1>
      
      {/* ニュースリスト */}
      <ul className="divide-y divide-gray-200">
        {dummyNews.map((news) => (
          <li key={news.id}>
            <button
              onClick={() => openNewsModal(news)} 
              className="w-full text-left block p-4 sm:p-5 rounded-lg transition duration-300 ease-in-out hover:bg-indigo-50 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                
                {/* 日付とカテゴリ */}
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <span className="text-sm font-medium text-gray-500 min-w-[90px] text-left">
                    {news.date}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    news.category === '重要'
                      ? 'bg-red-100 text-red-800'
                      : news.category === 'イベント'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  } hidden sm:inline-block`}>
                    {news.category}
                  </span>
                </div>

                {/* タイトル */}
                <p className="flex-1 text-base font-medium text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">
                  {news.title}
                </p>

                 {/* 矢印アイコン */}
                <svg
                  className="w-5 h-5 text-gray-400 ml-4 hidden sm:block group-hover:text-indigo-600 transition-transform duration-300 transform group-hover:translate-x-1"
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
          content={selectedNews.fullContent}
        />
      )}
      
    </div>
  )
}

export default News