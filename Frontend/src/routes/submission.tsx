import React, { useCallback, useEffect, useMemo, useState } from "react"

import { NavLink } from "react-router-dom"
import { SpaceHangarBackdrop } from "@/components/backgrounds/SpaceHangarBackdrop"
import { Scene3D } from "@/components/submission/Scene3D"
import { ViewportStars } from "@/components/submission/ViewportStars"
import { ProjectModal } from "@/components/submission/ProjectModal"
import type { SubmissionProject } from "@/components/submission/types"
import { deliverables } from "@/data/deliverables"
import { siteNavigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

const SUBMISSION_ENDPOINT = "http://localhost:8000/submission/"
const RARITY_PALETTE = [5, 4, 4, 3, 5, 4, 3, 5]

const sanitizeFilePath = (value: string) => value.replace(/^\/+/, "")

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-wide transition",
    "text-sky-200/80 hover:text-white hover:bg-white/5",
    isActive ? "text-white bg-white/10" : ""
  )

export const Submission: React.FC = () => {
  const fallbackProjects = useMemo<SubmissionProject[]>(
    () =>
      deliverables.map((item, index) => ({
        id: index + 1,
        title: item.title,
        subtitle: `PROJECT ${index + 1}`,
        rarity: RARITY_PALETTE[index % RARITY_PALETTE.length],
        description: item.description,
        tags: [],
      })),
    []
  )

  const [projects, setProjects] = useState<SubmissionProject[]>([])
  const [selectedProject, setSelectedProject] = useState<SubmissionProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const normalizeProject = (item: Record<string, unknown>, index: number): SubmissionProject => {
      const rawRarity = Number(item.rarity)
      const rarity = Number.isFinite(rawRarity)
        ? Math.min(Math.max(Math.round(rawRarity), 1), 5)
        : RARITY_PALETTE[index % RARITY_PALETTE.length]

      const description =
        typeof item.description === "string" && item.description.trim().length > 0
          ? item.description
          : "詳細情報は準備中です。"

      const tags =
        Array.isArray(item.tags) && item.tags.length > 0
          ? item.tags.filter((tag): tag is string => typeof tag === "string")
          : []

      const filePath =
        typeof item.file_path === "string"
          ? item.file_path
          : typeof (item as { filePath?: unknown }).filePath === "string"
            ? ((item as { filePath?: string }).filePath as string)
            : undefined

      return {
        id: typeof item.id === "number" ? item.id : index + 1,
        title: typeof item.title === "string" && item.title.trim().length > 0 ? item.title : `成果物 ${index + 1}`,
        subtitle:
          typeof (item as { subtitle?: unknown }).subtitle === "string" &&
          (item as { subtitle?: string }).subtitle?.trim().length
            ? ((item as { subtitle?: string }).subtitle as string)
            : `PROJECT ${index + 1}`,
        rarity,
        description,
        tags,
        file_path: filePath,
      }
    }

    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(SUBMISSION_ENDPOINT, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load submissions: ${response.status}`)
        }
        const data = (await response.json()) as unknown
        if (!Array.isArray(data)) {
          throw new Error("Unexpected payload format")
        }
        if (isMounted) {
          setProjects(data.map((item, index) => normalizeProject(item as Record<string, unknown>, index)))
          setFetchError(null)
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error("成果物データの取得に失敗しました。", error)
        if (isMounted) {
          setFetchError("成果物の取得に失敗しました。ローカルデータを表示します。")
          setProjects(fallbackProjects)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProjects()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [fallbackProjects])

  const hasDeliverables = projects.length > 0

  const handleProjectClick = useCallback((project: SubmissionProject) => {
    setSelectedProject(project)
    if (project.file_path && typeof window !== "undefined") {
      const sanitizedPath = sanitizeFilePath(project.file_path)
      const url = `http://localhost:8000/${sanitizedPath}`
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }, [])

  const handleProjectSelect = useCallback((_index: number) => {}, [])

  const closeModal = useCallback(() => {
    setSelectedProject(null)
  }, [])

  if (isLoading) {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          成果物を読み込み中です...
        </div>
      </>
    )
  }

  if (!hasDeliverables) {
    return (
      <>
        <div className="container mx-auto max-w-4xl space-y-6 py-12">
          <header className="space-y-3">
            <h1 className="text-3xl font-bold">成果物紹介</h1>
            <p className="text-muted-foreground">
              研究室メンバーが取り組んだ制作物をまとめています。各プロジェクトの概要をご覧いただけます。
            </p>
          </header>
          {fetchError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{fetchError}</div>
          )}
          <p className="text-muted-foreground">現在、公開できる成果物はありません。</p>
        </div>
      </>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#020417] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(59,130,246,0.2),transparent_65%)]" />

      <nav className="relative z-20 mx-auto mt-4 w-full max-w-6xl rounded-full border border-white/20 bg-[#0d1117]/70 px-6 py-3 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[{ label: "ホーム", to: "/" }, ...siteNavigation].map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <span>{item.label}</span>
              <span className="absolute inset-0 rounded-full border border-white/30 opacity-0 transition group-hover:opacity-100" />
            </NavLink>
          ))}
        </div>
      </nav>
      <section className="relative min-h-screen w-full overflow-hidden">
        <SpaceHangarBackdrop />

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-6xl flex-col items-center gap-6 px-4 sm:px-8">
          <div className="flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.6em] text-cyan-100/50">
            <span>DECK 02</span>
            <span>ORBITAL VIEWPORT</span>
            <span>PRESSURIZED</span>
          </div>

          <div className="relative w-full overflow-visible">
            <div className="pointer-events-none absolute inset-x-12 top-2 h-4 rounded-full bg-gradient-to-r from-white/30 via-cyan-200/40 to-white/30 blur-md" />
            <div className="pointer-events-none absolute inset-x-8 top-8 h-[2px] rounded-full bg-gradient-to-r from-cyan-200/40 via-white/50 to-cyan-200/40" />
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-24 w-[85%] rounded-b-[80px] border border-white/15 bg-white/5 blur-3xl" />

            <div className="pointer-events-none absolute -left-8 top-24 hidden h-48 w-16 rounded-[32px] border border-white/10 bg-gradient-to-b from-cyan-200/20 to-transparent blur-lg lg:block" />
            <div className="pointer-events-none absolute -right-8 top-24 hidden h-48 w-16 rounded-[32px] border border-white/10 bg-gradient-to-b from-cyan-200/20 to-transparent blur-lg lg:block" />

            <div className="relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-visible">
              <div className="absolute inset-[-40px] rounded-[220px] border-[12px] border-white/15 bg-gradient-to-b from-white/10 via-white/0 to-white/10 opacity-80 shadow-[0_40px_120px_rgba(2,8,28,0.65)]" />
              <div className="absolute inset-[-20px] rounded-[200px] border border-cyan-100/30 opacity-70 blur-sm" />
              <div className="absolute inset-[-4px] rounded-[190px] border border-white/30 opacity-80" />
              <div className="relative h-full w-full overflow-hidden rounded-[180px] border border-white/10 bg-black/65 shadow-[0_35px_90px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 rounded-[180px] border border-white/5 shadow-[inset_0_0_40px_rgba(255,255,255,0.25)]" />
                <div className="pointer-events-none absolute inset-10 rounded-[140px] border border-cyan-200/15 blur" />
                <div className="pointer-events-none absolute inset-0 rounded-[180px] bg-gradient-to-b from-white/10 via-transparent to-black/30 opacity-50" />
                <div className="pointer-events-none absolute inset-x-[28%] bottom-6 h-2 rounded-full bg-cyan-200/70 blur-md" />

                <div className="relative h-full w-full overflow-hidden">
                  <ViewportStars />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/70 opacity-50" />
                  <div className="relative z-10 h-full w-full">
                    <Scene3D projects={projects} onProjectClick={handleProjectClick} onProjectSelect={handleProjectSelect} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <header className="pointer-events-none absolute left-1/2 top-12 z-10 w-full max-w-3xl -translate-x-1/2 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.5em] text-cyan-200/80">Interactive Showcase</p>
          <h1 className="mt-3 text-3xl font-bold drop-shadow-[0_0_25px_rgba(14,165,233,0.4)] md:text-4xl">
            開封したい成果物をタップ！
          </h1>
          <p className="mt-4 text-base text-cyan-100/80">
            ドラッグで回転し、正面のカードをタップすると詳しい情報が表示されます。
          </p>
          {fetchError && (
            <div className="pointer-events-auto mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-xs text-yellow-100">
              {fetchError}
            </div>
          )}
        </header>

        <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 text-center text-sm text-cyan-100/70">
          <span className="rounded-full border border-cyan-400/40 px-5 py-2 backdrop-blur">
            Tip: 画面をドラッグしてカルーセルを回転できます
          </span>
        </div>

        <ProjectModal project={selectedProject} onClose={closeModal} />
      </section>
    </div>
  )
}

export default Submission