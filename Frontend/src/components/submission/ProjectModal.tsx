import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Star, X } from "lucide-react"

import type { ProjectModalProps } from "./types"

const renderStars = (count: number) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-5 w-5 ${index < count ? "fill-cyan-400 text-cyan-400" : "text-gray-600"}`}
    />
  ))

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => (
  <AnimatePresence>
    {project && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-cyan-900/30 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute left-0 top-0 h-full w-1 animate-pulse bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
            <div className="absolute bottom-0 right-0 h-1 w-full animate-pulse bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-1 animate-pulse bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="absolute right-4 top-4 z-10 rounded-lg border border-cyan-500/30 bg-slate-800/80 p-2 transition-all duration-300 hover:border-cyan-400 hover:bg-slate-700/80"
          >
            <X className="h-5 w-5 text-cyan-400" />
          </button>

          <div className="relative p-8 md:p-10">
            <div className="mb-2">
              <span className="font-mono text-xs uppercase tracking-[0.4em] text-cyan-400">{project.subtitle}</span>
            </div>

            <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">{project.title}</h2>

            <div className="mb-6 flex items-center gap-1">{renderStars(project.rarity)}</div>

            <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <p className="text-lg leading-relaxed text-gray-300">{project.description}</p>

            {project.tags && project.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-cyan-500/20 pt-6">
              <div className="flex items-center justify-center gap-2 font-mono text-xs text-cyan-400/60">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                <span>SMART ICT SOLUTIONS LABORATORY</span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 border-l-2 border-t-2 border-cyan-500/50" />
          <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 border-r-2 border-t-2 border-cyan-500/50" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 border-b-2 border-l-2 border-cyan-500/50" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-cyan-500/50" />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

