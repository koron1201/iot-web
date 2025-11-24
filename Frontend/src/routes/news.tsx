import React from 'react'
import { PageQuickNav } from "@/components/PageQuickNav"


//ニュースデータ
interface NewsItem {
  id: number
  date: string //日付
  title: string //タイトル
  category: string //カテゴリ

}

const dummyNews: NewsItem[] = [
  {
    id: 1,
    date: '2025.11.06',
    title: 'Webサイト開設',
    category: 'その他',

  },
  {
    id: 2,
    date: '2025.11.07',
    title: 'tes',
    category: 'イベント',

  },
   {
    id: 3,
    date: '2025.11.09',
    title: 'テスト',
    category: '重要',

  },
]

export const News: React.FC = () => {
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
            <a

              className="block p-4 sm:p-5 rounded-lg transition duration-300 ease-in-out hover:bg-indigo-50 hover:shadow-md group"
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
              </div>
            </a>
          </li>
        ))}
      </ul>

      
      
     
    </div>
  )
}

export default News