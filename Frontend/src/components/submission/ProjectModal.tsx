import React, { useEffect, useState, useRef } from "react"
import { AnimatePresence, motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { X, Play, ExternalLink, Cpu, Database, ShieldCheck, Globe, Activity, Zap, Code2, Layers } from "lucide-react"

import type { ProjectModalProps } from "./types"
import { apiUrl } from "@/config/api"

// --- Helper Components ---

// Text that descrambles itself on mount
const ScrambleText = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const [display, setDisplay] = useState("")
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*"
  
  useEffect(() => {
    let timeout: any // Changed from NodeJS.Timeout to any for compatibility
    let iteration = 0
    
    const startScramble = () => {
        const interval = setInterval(() => {
            setDisplay(
                text
                .split("")
                .map((char, index) => {
                    if (index < iteration) {
                        return text[index]
                    }
                    return chars[Math.floor(Math.random() * chars.length)]
                })
                .join("")
            )
            
            if (iteration >= text.length) {
                clearInterval(interval)
            }
            
            iteration += 1 / 3
        }, 30)
    }

    timeout = setTimeout(startScramble, delay * 1000)
    return () => clearTimeout(timeout)
  }, [text, delay])

  return <span className={className}>{display}</span>
}

// Rotating ring decoration
const HoloRing = ({ size, duration, reverse = false }: { size: number; duration: number; reverse?: boolean }) => (
    <motion.div 
        className="absolute rounded-full border border-dashed border-cyan-500/20"
        style={{ width: size, height: size }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
)

// Perspective tilt container
const TiltContainer = ({ children }: { children: React.ReactNode }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    
    const rotateX = useTransform(y, [-0.5, 0.5], [5, -5])
    const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative h-full w-full"
        >
            {children}
        </motion.div>
    )
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onLaunch }) => (
  <AnimatePresence>
    {project && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 perspective-[2000px]"
        onClick={onClose}
      >
        {/* Ambient Glow Behind Modal */}
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[100px]"
        />

        <motion.div
          initial={{ rotateX: 20, scale: 0.8, opacity: 0, y: 100 }}
          animate={{ rotateX: 0, scale: 1, opacity: 1, y: 0 }}
          exit={{ rotateX: -20, scale: 0.8, opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 30, stiffness: 200, mass: 1.2 }}
          className="relative h-auto w-full max-w-6xl overflow-visible md:h-[70vh]"
          onClick={(event) => event.stopPropagation()}
        >
            <TiltContainer>
                {/* Main Glass Panel */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-[#050505]/80 shadow-2xl backdrop-blur-xl">
                    
                    {/* Background Detail */}
                    <div className="absolute inset-0 pointer-events-none">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_50%)]" />
                         <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-white/5" />
                         <div className="absolute top-12 left-0 right-0 h-[1px] bg-white/5" />
                         
                         {/* Animated grid noise */}
                         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    </div>

                    <div className="flex h-full flex-col md:flex-row">
                        
                        {/* LEFT COLUMN: Visual & Stats */}
                        <div className="relative h-64 w-full shrink-0 overflow-hidden border-b border-white/10 md:h-full md:w-[400px] md:border-b-0 md:border-r">
                             {/* Image Container with Glitch Effect */}
                             <div className="relative h-full w-full group">
                                {project.thumbnail_path ? (
                                    <>
                                        <div className="absolute inset-0 bg-cyan-950/50 mix-blend-multiply z-10" />
                                        <img 
                                            src={apiUrl(project.thumbnail_path.replace(/^\/+/, "").split('/').map(encodeURIComponent).join('/'))} 
                                            alt={project.title} 
                                            className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" 
                                        />
                                        {/* Scanline overlay */}
                                        <div className="absolute inset-0 z-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20" />
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-black">
                                        <Activity className="h-24 w-24 text-cyan-900/40 animate-pulse" />
                                    </div>
                                )}

                                {/* Overlay UI on Image */}
                                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="font-mono text-[10px] text-green-400">SYSTEM ONLINE</span>
                                            </div>
                                            <div className="font-mono text-4xl font-bold text-white tracking-tighter opacity-90">
                                                {String(project.id).padStart(2, '0')}
                                            </div>
                                            <div className="h-[2px] w-12 bg-cyan-500 mt-2" />
                                        </div>
                                        <Globe className="h-8 w-8 text-cyan-500/40 animate-spin-slow" />
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* RIGHT COLUMN: Content */}
                        <div className="relative flex flex-1 flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 p-6 md:p-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-400 border border-cyan-500/20">
                                            CLASSIFIED
                                        </span>
                                        <ScrambleText text={project.subtitle} delay={0.5} className="font-mono text-xs tracking-widest text-gray-500" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                                        <ScrambleText text={project.title} delay={0.2} />
                                    </h2>
                                </div>
                                
                                <button
                                    onClick={onClose}
                                    className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 transition-all hover:bg-red-500 hover:border-red-500"
                                >
                                    <X className="relative z-10 h-5 w-5 text-gray-400 transition-colors group-hover:text-white" />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="rounded-lg bg-blue-500/20 p-2">
                                                <Database className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <span className="text-xs text-gray-400 font-mono">ARCHIVE_SIZE</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">4.2<span className="text-sm text-gray-500 ml-1">GB</span></div>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="rounded-lg bg-purple-500/20 p-2">
                                                <Cpu className="h-4 w-4 text-purple-400" />
                                            </div>
                                            <span className="text-xs text-gray-400 font-mono">PROCESS_LOAD</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">12<span className="text-sm text-gray-500 ml-1">%</span></div>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">
                                        <Layers className="h-4 w-4" />
                                        Project Description
                                    </h3>
                                    <p className="text-lg font-light leading-relaxed text-gray-300">
                                        {project.description}
                                    </p>
                                </div>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">KEYWORDS</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag, i) => (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                    key={tag}
                                                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-cyan-100 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                                    {tag}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-white/10 p-6 md:p-8 bg-black/20">
                                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                    <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="h-3 w-3" />
                                            <span>v.2.4.0</span>
                                        </div>
                                        <div className="h-3 w-[1px] bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-3 w-3" />
                                            <span>ENCRYPTED</span>
                                        </div>
                                    </div>

                                    {onLaunch && project.file_path && (
                                        <button 
                                            onClick={onLaunch}
                                            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-white px-8 py-3 text-black transition-all hover:scale-[1.02] active:scale-[0.98] md:w-auto"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                            <span className="relative z-10 font-bold tracking-wider flex items-center gap-2">
                                                <Play className="h-4 w-4 fill-current" />
                                                INITIALIZE
                                            </span>
                                            <Zap className="relative z-10 h-4 w-4 text-black/50 group-hover:text-black" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holographic Decorations (Floating outside) */}
                    <div className="pointer-events-none absolute -right-12 -top-12 opacity-20 hidden md:block">
                        <HoloRing size={200} duration={20} />
                    </div>
                    <div className="pointer-events-none absolute -left-12 -bottom-12 opacity-20 hidden md:block">
                        <HoloRing size={150} duration={15} reverse />
                    </div>

                </div>
            </TiltContainer>

            {/* Connecting Lines to Background (Imaginary) */}
            <div className="absolute -left-[100vw] top-1/2 h-[1px] w-[100vw] bg-gradient-to-r from-transparent to-cyan-500/20" />
            <div className="absolute -right-[100vw] top-1/2 h-[1px] w-[100vw] bg-gradient-to-l from-transparent to-cyan-500/20" />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
