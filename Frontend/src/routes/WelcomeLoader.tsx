import React, { useEffect, useState, useMemo } from "react"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { Home } from "./home"

// --- Utilities ---
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&"
const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

// --- Components ---

// 1. Scramble Text Effect
const ScrambleText = ({ text, className, trigger = true, speed = 40, delay = 0 }: { text: string, className?: string, trigger?: boolean, speed?: number, delay?: number }) => {
  const [display, setDisplay] = useState(text.split("").map((c) => c === " " ? " " : randomChar()).join(""))
  const [started, setStarted] = useState(false)
  
  useEffect(() => {
    if (!trigger) return
    
    const startTimer = setTimeout(() => {
        setStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [trigger, delay])

  useEffect(() => {
    if (!started) return

    let iteration = 0
    const interval = setInterval(() => {
      setDisplay(text.split("").map((letter, index) => {
        if (text[index] === " ") return " "
        if (index < iteration) return text[index]
        return randomChar()
      }).join(""))
      
      if (iteration >= text.length) clearInterval(interval)
      iteration += 1 / 2 // Speed up resolution
    }, speed)
    return () => clearInterval(interval)
  }, [text, started, speed])

  return <span className={className}>{display}</span>
}

// 2. HUD Corner Pieces
const HudCorner = ({ className, rotate = 0 }: { className?: string, rotate?: number }) => (
  <div className={`absolute w-12 h-12 pointer-events-none opacity-60 ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500" />
    <div className="absolute top-0 left-0 w-[2px] h-full bg-cyan-500" />
  </div>
)

export const WelcomeLoader = () => {
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState<"loading" | "standby" | "welcome" | "finished">("loading")
  const [logs, setLogs] = useState<string[]>([])
  
  // THREE.js Loading Manager Setup
  useEffect(() => {
    const originalOnProgress = THREE.DefaultLoadingManager.onProgress
    const originalOnLoad = THREE.DefaultLoadingManager.onLoad

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const p = (itemsLoaded / itemsTotal) * 100
      setProgress(p)
      const fileName = url.split("/").pop() || url
      setLogs(prev => [...prev.slice(-8), `LOAD: ${fileName} ... ${Math.round(p)}%`])
    }

    THREE.DefaultLoadingManager.onLoad = () => {
      setProgress(100)
      setLogs(prev => [...prev.slice(-8), "SYSTEM: ALL RESOURCES LOADED."])
      setTimeout(() => setStep("standby"), 800)
    }

    return () => {
      THREE.DefaultLoadingManager.onProgress = originalOnProgress
      THREE.DefaultLoadingManager.onLoad = originalOnLoad
    }
  }, [])

  // Step Transitions
  useEffect(() => {
    if (step === "standby") {
      const timer = setTimeout(() => setStep("welcome"), 2200)
      return () => clearTimeout(timer)
    }
    if (step === "welcome") {
      const timer = setTimeout(() => setStep("finished"), 3500)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Random binary background data
  const binaryData = useMemo(() => {
    return Array.from({ length: 400 }).map(() => Math.random() > 0.5 ? "1" : "0").join("")
  }, [])

  return (
    <>
      {/* Pre-render Home */}
      <div className={`transition-opacity duration-1000 ${step === "finished" ? "opacity-100" : "opacity-0"}`}>
        <Home />
      </div>

      <AnimatePresence>
        {step !== "finished" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1.0 }}
            className="fixed inset-0 z-[9999] bg-black text-cyan-500 font-mono overflow-hidden cursor-none selection:bg-cyan-500 selection:text-black"
          >
            {/* CRT & Grid Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
               {/* Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
              {/* Radial Vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" />
              {/* Moving Grid */}
              <div className="absolute inset-0 opacity-20" 
                   style={{ 
                     backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)', 
                     backgroundSize: '40px 40px',
                     transform: 'perspective(500px) rotateX(60deg) translateY(0)',
                     transformOrigin: '50% 100%',
                     animation: 'gridMove 20s linear infinite'
                   }} 
              />
            </div>
            
            <style>{`
              @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 400px; } }
              @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
              .animate-blink { animation: blink 0.5s step-end infinite alternate; }
            `}</style>

            {/* HUD Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
              
              {/* Decorative Corners */}
              <HudCorner className="top-8 left-8" rotate={0} />
              <HudCorner className="top-8 right-8" rotate={90} />
              <HudCorner className="bottom-8 right-8" rotate={180} />
              <HudCorner className="bottom-8 left-8" rotate={270} />

              {/* Main Display Area */}
              <div className="w-full max-w-4xl flex flex-col items-center">
                
                {/* --- LOADING PHASE --- */}
                {step === "loading" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    className="w-full"
                  >
                    <div className="flex justify-between items-end mb-4 border-b border-cyan-500/30 pb-2">
                      <div className="text-xs md:text-sm tracking-[0.3em] font-bold">
                        SYSTEM STATUS: <span className="text-cyan-300 animate-pulse ml-2">INITIALIZING</span>
                      </div>
                      <div className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                        {progress.toFixed(0)}<span className="text-2xl md:text-4xl text-cyan-500 ml-1">%</span>
                      </div>
                    </div>

                    {/* Advanced Progress Bar */}
                    <div className="relative h-2 md:h-3 w-full bg-cyan-950/50 mb-8 border-x border-cyan-500/30">
                       {/* Grid Pattern in Bar */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_90%,rgba(6,182,212,0.5)_90%,transparent_100%)] bg-[length:20px_100%]" />
                      <motion.div 
                        className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-white shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      />
                    </div>

                    {/* Logs & Hex Dump Aesthetic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
                      {/* System Logs */}
                      <div className="relative h-48 border-l-2 border-cyan-500/20 pl-4">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                        <h3 className="text-xs text-cyan-300 mb-2 tracking-widest opacity-50">SYSTEM LOGS</h3>
                        <div className="h-full font-mono text-[10px] md:text-xs text-cyan-500/80 leading-relaxed overflow-hidden flex flex-col justify-end">
                          {logs.map((log, i) => (
                             <div key={i} className="flex items-center">
                               <span className="text-cyan-800 mr-2 text-[9px]">{`0x${(1000+i).toString(16).toUpperCase()}`}</span>
                               <span className="truncate">{log}</span>
                             </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Data Viz */}
                      <div className="hidden md:block h-48 border border-cyan-900/30 bg-black/50 p-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
                        <div className="flex flex-wrap gap-1 text-[8px] text-cyan-800 break-all opacity-50 font-mono leading-none">
                          {binaryData}
                        </div>
                        <div className="absolute bottom-2 right-2 text-xs text-cyan-400 animate-blink">
                           PROCESSING DATA STREAMS...
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* --- STANDBY COMPLETE PHASE --- */}
                {step === "standby" && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0, scale: 1.5, filter: "brightness(2)" }}
                     className="text-center relative py-20"
                   >
                     {/* Rotating Rings */}
                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[450px] md:h-[450px] border border-dashed border-cyan-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                     <motion.div
                       initial={{ scale: 0, rotate: -180 }}
                       animate={{ scale: 1, rotate: 0 }}
                       transition={{ type: "spring", stiffness: 100, damping: 15 }}
                       className="relative z-10 mb-8"
                     >
                        <div className="w-20 h-20 md:w-32 md:h-32 mx-auto border-4 border-cyan-400 bg-cyan-950/80 transform rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)] backdrop-blur-sm">
                           <div className="transform -rotate-45 text-4xl md:text-5xl font-bold text-white">OK</div>
                        </div>
                     </motion.div>
                     
                     <h2 className="text-4xl md:text-7xl font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mb-4">
                       <ScrambleText text="SYSTEM READY" speed={50} />
                     </h2>
                     <p className="text-cyan-400/80 tracking-[1em] text-xs md:text-sm animate-pulse">ACCESS GRANTED</p>
                   </motion.div>
                )}

                {/* --- WELCOME PHASE --- */}
                {step === "welcome" && (
                  <motion.div
                    initial={{ opacity: 0, z: 100 }}
                    animate={{ opacity: 1, z: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center relative z-20"
                  >
                     <motion.div
                       initial={{ scaleX: 0 }}
                       animate={{ scaleX: 1 }}
                       transition={{ duration: 0.8, ease: "circOut" }}
                       className="h-px w-full max-w-lg mx-auto bg-gradient-to-r from-transparent via-cyan-100 to-transparent mb-8"
                     />
                     
                     <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)] mb-8">
                       <ScrambleText text="WELCOME" speed={70} />
                     </h1>

                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-4"
                     >
                        <p className="text-lg md:text-2xl text-white font-bold tracking-widest break-words max-w-full">
                          <ScrambleText text="Smart ICT Solutions Laboratory" speed={25} delay={1000} />
                        </p>
                        <p className="text-xs md:text-sm text-cyan-400/60 tracking-[0.5em] uppercase">
                          Tokyo Denki University
                        </p>
                     </motion.div>
                  </motion.div>
                )}
              </div>
              
              {/* Footer / Version */}
              <div className="absolute bottom-8 flex justify-between w-full px-12 text-[9px] md:text-[10px] text-cyan-900 tracking-widest uppercase opacity-70">
                <span>Secure Connection v2.5.0</span>
                <span>EST. 2024</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
