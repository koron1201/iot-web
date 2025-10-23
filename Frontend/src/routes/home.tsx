import { useCallback, useEffect, useRef, useState } from "react"
import { NavLink } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsSection } from "@/components/ui/stats-card"
import { siteNavigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

const RESEARCH_FIELDS = [
  {
    title: "IoT / CPS",
    description:
      "IoTデバイスとサイバーフィジカルシステムを活用したデータ駆動型ソリューションの研究。",
  },
  {
    title: "人工知能 / 機械学習",
    description:
      "高度なAIアルゴリズムを用いた予測・最適化・自律システムの開発。",
  },
  {
    title: "デジタルツイン",
    description:
      "現実世界のシステムを仮想空間に再現し、分析・シミュレーションに活用。",
  },
  {
    title: "メタバース応用",
    description:
      "仮想空間と現実空間を融合させた新しい学習・研究環境の創出。",
  },
]

const createBooleanArray = (length: number) => Array.from({ length }, () => false)

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-lg font-medium transition-colors px-8 py-5 relative group",
    isActive ? "text-orange-600 font-bold" : "text-gray-700 hover:text-gray-900"
  )

export const Home: React.FC = () => {
  const [fieldsVisible, setFieldsVisible] = useState<boolean[]>(createBooleanArray(RESEARCH_FIELDS.length))
  const [contentVisible, setContentVisible] = useState<boolean[]>(createBooleanArray(siteNavigation.length))
  const [fieldsStarted, setFieldsStarted] = useState(false)
  const [contentStarted, setContentStarted] = useState(false)
  const fieldsTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const contentTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback((timeouts: ReturnType<typeof setTimeout>[]) => {
    timeouts.forEach((timerId) => clearTimeout(timerId))
  }, [])

  useEffect(() => {
    return () => {
      clearTimers(fieldsTimeoutRef.current)
      clearTimers(contentTimeoutRef.current)
    }
  }, [clearTimers])

  const handleFieldsReveal = useCallback(() => {
    if (fieldsStarted) {
      return
    }

    setFieldsStarted(true)
    const timeouts: ReturnType<typeof setTimeout>[] = []
    RESEARCH_FIELDS.forEach((_item, index) => {
      const timeoutId = setTimeout(() => {
        setFieldsVisible((prev) => {
          const next = [...prev]
          next[index] = true
          return next
        })
      }, index * 2000)

      timeouts.push(timeoutId)
    })

    fieldsTimeoutRef.current = timeouts
  }, [fieldsStarted])

  const handleContentReveal = useCallback(() => {
    if (contentStarted) {
      return
    }

    setContentStarted(true)
    const timeouts: ReturnType<typeof setTimeout>[] = []
    siteNavigation.forEach((_item, index) => {
      const timeoutId = setTimeout(() => {
        setContentVisible((prev) => {
          const next = [...prev]
          next[index] = true
          return next
        })
      }, index * 2000)

      timeouts.push(timeoutId)
    })

    contentTimeoutRef.current = timeouts
  }, [contentStarted])

  return (
    <div className="w-full space-y-16 py-12">
      <section className="px-8">
        <div className="flex flex-col-reverse gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 md:max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Smart ICT Solutions Laboratory
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              東京電機大学のスマートICTソリューション研究室では、IoT・組込みソフトウェア・人工知能・デジタルツインなどの最先端技術を活用し、社会課題に挑む研究を行っています。
            </p>
          </div>
          <nav className="w-fit self-start rounded-full border border-gray-200 bg-white px-8 py-4 shadow-lg">
            <div className="flex items-center gap-4">
              {siteNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 transition-opacity duration-200",
                      item.to === "/" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  ></div>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 左カラム */}
        <div className="space-y-8 px-8">
          {/* 統計情報（上部） */}
          <StatsSection members={28} research={12} papers={45} />

          {/* 研究分野 */}
          <section className="space-y-6">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleFieldsReveal}
                disabled={fieldsStarted}
                className="w-fit rounded-sm text-left text-2xl font-semibold tracking-tight disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                研究分野
              </button>
              <p className="max-w-2xl text-muted-foreground">
                我々の研究室では、情報ネットワークからデジタルツインまで幅広いテーマに取り組んでいます。
              </p>
            </div>
            {fieldsStarted && (
              <div className="grid gap-4">
                {RESEARCH_FIELDS.map((field, index) => (
                  <Card
                    key={field.title}
                    className={cn(
                      "transition-opacity duration-700",
                      fieldsVisible[index] ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <CardHeader>
                      <CardTitle>{field.title}</CardTitle>
                      <CardDescription>{field.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* 主要コンテンツ */}
          <section className="space-y-6">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleContentReveal}
                disabled={contentStarted}
                className="w-fit rounded-sm text-left text-2xl font-semibold tracking-tight disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                主要コンテンツ
              </button>
              <p className="max-w-2xl text-muted-foreground">
                研究室の活動や実績を紹介するコンテンツをご覧ください。
              </p>
            </div>
            {contentStarted && (
              <div className="grid gap-4">
                {siteNavigation.map((item, index) => (
                  <Card
                    key={item.to}
                    className={cn(
                      "transition-opacity duration-700",
                      contentVisible[index] ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <CardHeader>
                      <CardTitle>{item.label}</CardTitle>
                      <CardDescription>
                        研究室の{item.label}に関する詳細情報をご確認いただけます。
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">準備中</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 右カラム */}
        <div className="flex items-center justify-center bg-muted rounded-lg min-h-[600px] mx-8">
          <div className="text-center">
            <p className="text-2xl font-semibold">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

