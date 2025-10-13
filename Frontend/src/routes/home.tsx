import { Link } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { siteNavigation } from "@/config/navigation"

export const Home: React.FC = () => {
  return (
    <div className="container space-y-16 py-12">
      <section className="flex flex-col gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Smart ICT Solutions Laboratory
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            東京電機大学のスマートICTソリューション研究室では、IoT・組込みソフトウェア・人工知能・デジタルツインなどの最先端技術を活用し、社会課題に挑む研究を行っています。
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">研究分野</h2>
          <p className="max-w-2xl text-muted-foreground">
            我々の研究室では、情報ネットワークからデジタルツインまで幅広いテーマに取り組んでいます。
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
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
          ].map((field) => (
            <Card key={field.title}>
              <CardHeader>
                <CardTitle>{field.title}</CardTitle>
                <CardDescription>{field.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">主要コンテンツ</h2>
          <p className="max-w-2xl text-muted-foreground">
            研究室の活動や実績を紹介するコンテンツをご覧ください。
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {siteNavigation.map((item) => (
            <Card key={item.to}>
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
      </section>
    </div>
  )
}

export default Home

