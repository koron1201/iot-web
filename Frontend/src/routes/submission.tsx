import React from "react"

import { deliverables } from "@/data/deliverables"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Submission: React.FC = () => {
  const hasDeliverables = deliverables.length > 0

  return (
    <div className="container mx-auto max-w-5xl space-y-10 py-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">成果物紹介</h1>
        <p className="text-muted-foreground">
          研究室メンバーが取り組んだ制作物をまとめています。各プロジェクトの概要をご覧いただけます。
        </p>
      </header>

      {hasDeliverables ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((item) => (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">現在、公開できる成果物はありません。</p>
      )}
    </div>
  )
}

export default Submission


