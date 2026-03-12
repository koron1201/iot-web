import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type StatKey = "members" | "research" | "papers"

const STAT_SEQUENCE: StatKey[] = ["members", "research", "papers"]

const STAT_LABELS: Record<StatKey, string> = {
  members: "メンバー数",
  research: "研究数",
  papers: "論文数",
}

interface StatCardProps {
  label: string
  value: string | number
  isVisible?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, isVisible }) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">
        <span
          className={cn(
            "mask-bg",
            isVisible && "is-animated"
          )}
        >
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold">
        <span
          className={cn(
            "mask-bg",
            isVisible && "is-animated"
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

interface StatsSectionProps {
  members?: number
  research?: number
  papers?: number
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  members = 0,
  research = 0,
  papers = 0,
}) => {
  const stats = useMemo(
    () => ({
      members,
      research,
      papers,
    }),
    [members, research, papers]
  )

  const [visibleStats, setVisibleStats] = useState<Record<StatKey, boolean>>({
    members: false,
    research: false,
    papers: false,
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const startAnimation = useCallback(() => {
    STAT_SEQUENCE.forEach((key, index) => {
      const timeoutId = setTimeout(() => {
        setVisibleStats((prev) => ({
          ...prev,
          [key]: true,
        }))

        if (index === STAT_SEQUENCE.length - 1) {
          setIsAnimating(false)
        }
      }, index * 2000)

      timeoutsRef.current.push(timeoutId)
    })
  }, [])

  const handleStartAnimation = useCallback(() => {
    if (isAnimating) {
      return
    }

    clearTimers()

    if (hasStarted) {
      setHasStarted(false)
      setVisibleStats({
        members: false,
        research: false,
        papers: false,
      })
      return
    }

    setHasStarted(true)
    setIsAnimating(true)
    startAnimation()
  }, [clearTimers, hasStarted, isAnimating, startAnimation])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleStartAnimation}
          disabled={isAnimating}
          className="rounded-sm text-left text-2xl font-semibold tracking-tight disabled:cursor-not-allowed disabled:text-muted-foreground/70 focus-visible:outline-none"
        >
          研究室統計
        </button>
        <p className="max-w-2xl text-muted-foreground">
          現在の研究室の活動状況をご確認いただけます。
        </p>
      </div>
      {hasStarted && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAT_SEQUENCE.map((key) => (
            <StatCard
              key={key}
              label={STAT_LABELS[key]}
              value={stats[key]}
              isVisible={visibleStats[key]}
            />
          ))}
        </div>
      )}
    </section>
  )
}
