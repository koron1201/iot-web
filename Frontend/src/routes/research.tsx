import { PageQuickNav } from "@/components/PageQuickNav"
import {motion } from "framer-motion"
import {useState, useEffect } from "react";
import { siteNavigation } from "@/config/navigation"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

//{/*研究データの型の定義*/}
interface ResearchProps{
  id: number;
  name: string
  title: string
  description: string
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-wide transition",
    "text-sky-200/80 hover:text-white hover:bg-white/5",
    isActive ? "text-white bg-white/10" : ""
)

export const Research: React.FC = () => {
  //FastAPIから取得
  const [researchList, setResearchList] = useState<ResearchProps[]>([]);

  //星
  const stars = Array.from({ length: 120 }).map((_, i) => {//120の配列を作成
    const size = Math.random() * 2 + 1
    const left = Math.random() * 100
    const top = Math.random() * 100
    const opacity = Math.random() * 0.6 + 0.4//明るさ
  
    //背景に表示
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: `rgba(255,255,255,${opacity})`,//星の明るさ
          borderRadius: "50%",//これで完全な円になる
        }}
      />
    )
  })

  //FastAPIからデータを取得
  const fetchResearch = async () => {
    try {
      const response = await fetch("http://localhost:8000/research/");
      const data = await response.json();
      setResearchList(data);  // ステートにセット
    } catch (error) {
      console.error("取得エラー:", error);
    }
  };

  // 初回ロード時に実行
  useEffect(() => {
    fetchResearch();
  }, []);

  return (
    <>
    {/*背景を作って星を配置*/}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: `radial-gradient(circle at 30% 70%, #1c1c2f 0%, #0a0a0a 80%),linear-gradient(to top right, #0a0a0a 0%, #000 100%)`, zIndex: 0 }}>
        {stars}   
      </div>
    
      <motion.div
      className="relative min-h-screen"
      initial={{ y: "100%", opacity: 0 }}//最初の枠の位置
      animate={{ y: "0%", opacity: 1 }}//ページ全体の長さ
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}//時間
      >
      {/* ナビゲーション */}
      <nav className="mt-4 w-full rounded-full border border-white/20 bg-[#0d1117]/70 px-6 py-3 backdrop-blur-md shadow-lg shadow-black/40 lg:w-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[{ label: "ホーム", to: "/" }, ...siteNavigation].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              >
              <span>{item.label}</span>
              <span className="absolute inset-0 rounded-full border border-white/30 opacity-0 transition group-hover:opacity-100" />
            </NavLink>
          ))}
        </div>
      </nav>


      {/* コンテンツ */}
      <div style={{ position: "relative", zIndex: 10, padding: "3rem", color: "white"}}>{/*位置、背景より前に、余白、文字の色*/}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white -mt-5">研究内容</h1>{/*tracking-tight:文字間隔を狭く、sm:画面サイズが小のとき*/}
        <div style={{ display: "grid", gap: "2.0rem", gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))", marginTop: "2.0rem" }}>{/*並び方を自動調整、カード同士の間隔*/}
          {researchList.map((item, index) => ( //研究データを一つづつ取り出す
            <motion.div//研究カードのアニメーション
              key={index}
              style={{
                borderRadius: "1rem",//角が丸いカード
                border: "1px solid rgba(255,255,255,0.2)",//半透明の枠線
                padding: "1.5rem",//余白
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",//影、浮いて見える
                backgroundColor: "rgba(20,20,30,0.65)",//ガラス風
                transition: "all 1.0s",//hoverや変化を滑らかになる?
              }}
              initial={{ opacity: 0, y: 50 }}//透明度、位置
              animate={{ opacity: 1, y: 0 }}//透明から表示、下の位置から元の位置へ
              transition={{ duration: 1.1, delay: index * 0.05 }}//カードが順番に
            >
              {/*画像*/}
              <img
              src={`http://localhost:8000/research/image/${item.id}?t=${Date.now()}`}
              alt={item.title}
              style={{
                width: "100%",
                height: "260px",
                objectFit: "contain",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                backgroundColor: "transparent",
              }}
              />

              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>◆ {item.title}</h2>
              <p style={{ marginTop: "0.5rem", color: "#aaa" }}>研究者: {item.name}</p>
              <h1 className="mt-6 font-bold tracking-tight sm:text-1rem text-cyan-100/80">{item.description}</h1>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Research;