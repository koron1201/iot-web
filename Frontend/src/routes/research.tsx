import { PageQuickNav } from "@/components/PageQuickNav"
import {motion } from "framer-motion"
import {useState, useEffect } from "react";
import { siteNavigation } from "@/config/navigation"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

{/*研究内容*/}
interface ResearchProps{
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

{/*背景*/}
const containerVariants = {
  hidden:{},
  show:{transition:{staggerChildren: 0.05}},
  };

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-wide transition",
    "text-sky-200/80 hover:text-white hover:bg-white/5",
    isActive ? "text-white bg-white/10" : ""
  )

const ResearchList: ResearchProps[] = [
  { name: "阿部瑞樹",     title: "仮想空間における楽器演奏の協調方式の提案と実装", description: "高価格な楽器を使わずに、より手軽なVR上でのアバター表現などを活用した演奏可能な演奏支援システムの開発を行う" },
  { name: "飯塚ゆず",     title: "ユーザーの感情に応じて動作するロボットの提案", description: "音声をメインとした、数種類の感情分析手法を組み合わせた総合的な結果からユーザーに適した動作を返すロボットの制作を行う。これによりロボットとのコミュニケーションの満足感とメンタルケアの向上を目指す" },
  { name: "小林征楽",     title: "画像認識とLiDARを用いた路面損傷推定システムの提案と開発", description: "現在の道路点検では高額なコストがかかり網羅的な点検は現実的でないため、一般の車にシステムを搭載して点検を可能にすることで調査員不足の解消と効率的な路面損傷推定の実現を目指す" },
  { name: "白根享祐",     title: "仮想現実と生成AIによる採用面接練習システムの開発と評価", description: "仮想空間で面接を疑似体験する。また、生成AIによって採用面接における質問をリアルタイムで作成し、応答に対して客観的評価を行うことで、一人でも緊張感のある面接練習を可能にするシステムの実現" },
  { name: "柴田結衣",     title: "仮想空間での触覚刺激と現実空間での触覚刺激との協調による臨場感増加効果に関する研究", description: "仮想空間で五感(特に触覚)の協調を目指す。仮想空間で生成されたイベント情報(アバターが風に当たった情報など)に合わせて現実空間の風の方向を強調動作させる。風源が移動することで多方向からの風を再現" },
  { name: "瀬尾航",       title: "ユーザーエクスペリエンス(UX)を考慮した経路案内システムの提案", description: "建物の3Dマップを作成し、自動で目的地まで案内してくれるシステムを実装することを目指す。このシステムにより、施設内での迷わずスムーズな移動ができるようにすることを目指す。" },
  { name: "保戸塚結治",    title: "ARグラスとハンドジェスチャーを活用した料理アシストシステムの提案と実装", description: "ARグラスとハンドトラッキング技術を活用した料理アシストシステムの開発。ユーザーがハンドジェスチャーを用いてレシピの手順を進める、タイマーを操作する、SNSへ共有する機能を提供することで効率性と快適性の向上を目指す" },
  { name: "土田茉優",     title: "魔法疑似体験のためのシステムの提案と実装", description: "ITを駆使して、魔法という非現実的な体験をユーザに与える。魔法使いの象徴である杖をデバイスとし、その杖先の軌跡を認識する" },
  { name: "森下直紀",      title: "AIを活用した生徒の感情把握システムの提案と実装", description: "AI技術を駆使して、生徒の表情、しぐさから授業の理解度を推定するシステムの構築。本システムにより信任教師でも生徒の理解度と興味度を客観的に把握すrことが可能となり、適切な授業を行うことができるようになる" },
  { name: "清水祐希",      title: "BL法を用いた固定空間へのパッキング問題の検討と考察", description: "従来のパッキングアルゴリズムには、図形の形状や回転を許さないなど制約が多く、自由度が低い。そこで四角形以外の複数の図形に対応させ、自由度を高めたパッキングアルゴリズムを作成し、パッキング作業の自動化を目指す。" },
  { name: "クーゼンカイ",  title: "ピアノの支援演奏システム", description: "初心者手軽にピアノ演奏を始められることを目的とする。VR(仮想現実)技術を活用することでユーザーは実際のピアノを使用せずに演奏スキルを習得できるため楽器やピアノ教室の費用を抑えられる。" },
  { name: "高山浩奈",       title: "仮想世界における人とのつながりと絆向上プロセスの検討と提案", description: "仮想空間の中で最も身近な存在であるゲームをターゲットに仮想世界を用いた新たな絆の形成・向上の仕組みを検討・提案。" },
  { name: "横山葵",       title: "映像分析による運動遅滞症状の検出方法の提案", description: "映像分析を用いて、人が気づきにくい「粗大運動」の運動遅滞症状を検出し、その運動遅滞症状を持つ当事者やその周囲の人々に対し、運動特性の気づきを与える仕組みを確立することを目的とする。" },
]

{/*星*/}
export const Research: React.FC = () => {
  const stars = Array.from({ length: 120 }).map((_, i) => {
    const size = Math.random() * 2 + 1
    const left = Math.random() * 100
    const top = Math.random() * 100
    const opacity = Math.random() * 0.6 + 0.4
  
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: `rgba(255,255,255,${opacity})`,
          borderRadius: "50%",
        }}
      />
    )
  })

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
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
      </div>
    </motion.div>
  )
}

export default Research;