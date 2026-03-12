import React, { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CosmicNavbar } from "@/components/layout/CosmicNavbar"
import { ProjectModal } from "@/components/submission/ProjectModal"
import type { SubmissionProject } from "@/components/submission/types"
import { deliverables } from "@/data/deliverables"
import { Background } from "@/components/submission/Background"
import { Carousel3D } from "@/components/submission/Carousel3D"
import { API_BASE_URL, apiUrl } from "@/config/api"

const SUBMISSION_ENDPOINT = apiUrl("/submission/")
const RARITY_PALETTE = [5, 4, 4, 3, 5, 4, 3, 5]

const sanitizeFilePath = (value: string) => value.replace(/^\/+/, "")

// --- HUD Components ---

const CornerBrackets = () => (
  <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden mix-blend-screen">
    {/* Top Left */}
    <div className="absolute left-4 top-4 md:left-8 md:top-8 h-8 w-8 md:h-12 md:w-12 border-l-2 border-t-2 border-cyan-500/80 rounded-tl-lg" />
    <motion.div 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute left-4 top-4 md:left-8 md:top-8 h-1 w-1 md:h-1.5 md:w-1.5 bg-cyan-400 box-shadow-glow" 
    />
    
    {/* Top Right */}
    <div className="absolute right-4 top-4 md:right-8 md:top-8 h-8 w-8 md:h-12 md:w-12 border-r-2 border-t-2 border-cyan-500/80 rounded-tr-lg" />
    <motion.div 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      className="absolute right-4 top-4 md:right-8 md:top-8 h-1 w-1 md:h-1.5 md:w-1.5 bg-cyan-400 box-shadow-glow" 
    />
    
    {/* Bottom Left */}
    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 h-8 w-8 md:h-12 md:w-12 border-b-2 border-l-2 border-cyan-500/80 rounded-bl-lg" />
    <motion.div 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      className="absolute bottom-4 left-4 md:bottom-8 md:left-8 h-1 w-1 md:h-1.5 md:w-1.5 bg-cyan-400 box-shadow-glow" 
    />
    
    {/* Bottom Right */}
    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 h-8 w-8 md:h-12 md:w-12 border-b-2 border-r-2 border-cyan-500/80 rounded-br-lg" />
    <motion.div 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      className="absolute bottom-4 right-4 md:bottom-8 md:right-8 h-1 w-1 md:h-1.5 md:w-1.5 bg-cyan-400 box-shadow-glow" 
    />
  </div>
)

const TechOverlay = () => {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden text-[10px] font-mono text-cyan-500/60 select-none">
      {/* System Status - Top Left */}
      <div className="absolute left-6 top-24 md:left-12 md:top-32 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="tracking-widest">SYSTEM: ONLINE</span>
        </div>
        <div className="h-[1px] w-24 bg-cyan-500/30" />
        <div className="opacity-70">
          <div>FPS: 60.0</div>
          <div>MEM: OPTIMIZED</div>
        </div>
      </div>

      {/* Coordinates - Bottom Right */}
      <div className="absolute right-6 bottom-16 md:right-12 md:bottom-20 text-right space-y-1">
        <div className="text-xs font-bold tracking-widest">{time.toLocaleTimeString()}</div>
        <div className="text-[9px] opacity-70">ZONE: ARCHIVE-01</div>
        <div className="text-[9px] opacity-70">COORD: {time.getMilliseconds().toString().padStart(3, '0')}.{time.getSeconds().toString().padStart(2, '0')}</div>
      </div>

      {/* Decorative Side Elements */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-64 border-r border-cyan-500/20 bg-gradient-to-r from-cyan-900/10 to-transparent hidden lg:block" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-64 border-l border-cyan-500/20 bg-gradient-to-l from-cyan-900/10 to-transparent hidden lg:block" />
    </div>
  )
}

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

      const thumbnailPath =
        typeof item.thumbnail_path === "string"
          ? item.thumbnail_path
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
        thumbnail_path: thumbnailPath,
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
      const url = `${API_BASE_URL}/${sanitizedPath}`
      // Don't auto open - let the modal handle details, or button in modal
      // But preserving existing logic if needed:
      // window.open(url, "_blank", "noopener,noreferrer") 
    }
  }, [])

  const closeModal = useCallback(() => {
    setSelectedProject(null)
  }, [])

  const handleLaunchProject = useCallback(() => {
    if (selectedProject?.file_path) {
      const sanitizedPath = sanitizeFilePath(selectedProject.file_path)
      // 日本語ファイル名などに対応するためのURLエンコード
      const encodedPath = sanitizedPath.split('/').map(encodeURIComponent).join('/')
      const url = `${API_BASE_URL}/${encodedPath}`
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }, [selectedProject])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-sm text-cyan-500/50">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          INITIALIZING...
        </motion.div>
      </div>
    )
  }

  if (!hasDeliverables) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <CosmicNavbar />
        <div className="container mx-auto flex h-screen max-w-4xl flex-col items-center justify-center space-y-6">
          <header className="space-y-3 text-center">
            <h1 className="text-3xl font-bold">成果物ギャラリー</h1>
            <p className="text-muted-foreground">現在、公開できる成果物はありません。</p>
          </header>
          {fetchError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{fetchError}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000000] text-white selection:bg-cyan-500/30">
      <Background />
      
      {/* HUD Elements */}
      <CornerBrackets />
      <TechOverlay />
      
      <CosmicNavbar />

      <main className="relative flex h-full flex-col">
        {/* Header Section */}
        <div className="pointer-events-none relative z-10 flex flex-col items-center pt-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center mix-blend-screen"
          >
            <div className="mb-4 flex items-center gap-4 opacity-70">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-400" />
              <p className="text-[10px] font-bold tracking-[1.2em] text-cyan-100 uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                INFINITE ARCHIVES
              </p>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-400" />
            </div>
            
            <h1 className="relative text-center text-5xl font-black tracking-tighter md:text-7xl lg:text-9xl">
              <span className="bg-gradient-to-b from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.5)] filter contrast-125">
                成果物ギャラリー
              </span>
              <motion.div 
                className="absolute -inset-x-12 -inset-y-8 -z-10 bg-cyan-500/20 blur-[100px]" 
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </h1>
          </motion.div>
          
          <AnimatePresence>
            {fetchError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pointer-events-auto mt-6 rounded-lg border border-red-500/30 bg-red-950/40 px-6 py-2 text-sm text-red-200 backdrop-blur-md"
              >
                {fetchError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Carousel Scene */}
        <div className="relative z-10 flex-1 w-full flex items-center justify-center">
          <Carousel3D projects={projects} onSelect={handleProjectClick} />
        </div>

        {/* Bottom Interface */}
        <div className="pointer-events-none absolute bottom-12 left-0 right-0 z-30 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="group pointer-events-auto flex cursor-pointer items-center gap-3 rounded-full border border-white/5 bg-white/5 px-8 py-3 backdrop-blur-md transition-all hover:bg-white/10 hover:border-cyan-500/30"
          >
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
            </div>
            <span className="text-xs font-medium tracking-widest text-cyan-200/80 group-hover:text-cyan-100">
              DRAG TO ROTATE • TAP TO ACCESS
            </span>
          </motion.div>
        </div>

        <ProjectModal project={selectedProject} onClose={closeModal} onLaunch={handleLaunchProject} />
      </main>
    </div>
  )
}

export default Submission
