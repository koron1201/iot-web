import React, { useState, useRef, useEffect, useCallback } from "react";
import type { SubmissionProject } from "./types";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

interface Carousel3DProps {
  projects: SubmissionProject[];
  onSelect: (project: SubmissionProject) => void;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({ projects, onSelect }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const radius = 450; // Distance from center
  const theta = 360 / projects.length;

  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    startX.current = clientX;
    startRotation.current = rotation;
  };

  const handlePointerMove = useCallback((e: PointerEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
    const delta = clientX - startX.current;
    // Sensitivity factor
    const newRotation = startRotation.current + delta * 0.2;
    setRotation(newRotation);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    // Snap to nearest face
    const snapIndex = Math.round(rotation / theta);
    setRotation(snapIndex * theta);
  }, [rotation, theta]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Normalize rotation to find the "active" card
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  // Index 0 is at 0 degrees.
  // If we rotate +theta, index 1 moves away. We need -theta to bring index 1 to front.
  // Actually, let's just find which index is closest to -rotation
  const activeIndex = Math.round(-rotation / theta); 
  const safeActiveIndex = ((activeIndex % projects.length) + projects.length) % projects.length;

  return (
    <div className="relative flex h-[500px] w-full items-center justify-center perspective-[1200px] overflow-visible">
      <div
        ref={containerRef}
        className="relative h-[300px] w-[220px] preserve-3d transition-transform duration-500 ease-out sm:w-[260px]"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(-${radius}px) rotateY(${rotation}deg)`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {projects.map((project, index) => {
          const angle = theta * index;
          const isActive = index === safeActiveIndex;

          const sanitizeFilePath = (value: string) => value.replace(/^\/+/, "")
          
          // Use thumbnail_path for image, fallback to file_path if it's an image (unlikely for index.html)
          const rawPath = project.thumbnail_path || project.file_path
          
          const imageUrl = rawPath
            ? `${API_BASE_URL}/${sanitizeFilePath(rawPath).split('/').map(encodeURIComponent).join('/')}` 
            : null

          return (
            <div
              key={project.id}
              onClick={() => {
                if (!isDragging && isActive) onSelect(project);
                // If clicked but not active, rotate to it
                if (!isDragging && !isActive) {
                    setRotation(-angle);
                }
              }}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center rounded-xl border p-4 backdrop-blur-xl transition-all duration-300",
                isActive 
                  ? "border-cyan-400/50 bg-cyan-950/30 shadow-[0_0_50px_rgba(34,211,238,0.2)] z-10 scale-110" 
                  : "border-white/10 bg-black/20 opacity-60 hover:opacity-90 grayscale hover:grayscale-0 cursor-pointer hover:border-white/30"
              )}
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden", // Or visible for transparency
              }}
            >
              {/* Card Content */}
              <div className="h-32 w-full overflow-hidden rounded-lg bg-black/50">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={project.title} 
                        className="h-full w-full object-cover opacity-80 transition-opacity hover:opacity-100" 
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-cyan-950/20">
                        <span className="text-xs text-cyan-500/50">NO IMAGE</span>
                    </div>
                )}
              </div>
              
              <div className="mt-4 flex w-full flex-col gap-1 text-left">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400">ID: {String(project.id).padStart(3, '0')}</span>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("h-1 w-1 rounded-full", i < project.rarity ? "bg-amber-400" : "bg-white/10")} />
                        ))}
                    </div>
                </div>
                <h3 className={cn("font-bold truncate", isActive ? "text-white" : "text-gray-400")}>{project.title}</h3>
                <p className="line-clamp-2 text-xs text-gray-400">{project.description}</p>
                
                {isActive && (
                    <div className="mt-3 flex justify-center">
                        <button className="rounded-full bg-cyan-500/20 px-4 py-1 font-mono text-[10px] font-bold tracking-widest text-cyan-300 ring-1 ring-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors">
                            ACCESS DATA
                        </button>
                    </div>
                )}
              </div>

              {/* Holographic Reflection Overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
      
      {/* Floor Glow */}
      <div className="pointer-events-none absolute bottom-0 h-[200px] w-[600px] -translate-y-20 rounded-[100%] bg-cyan-500/10 blur-[60px]" style={{ transform: 'rotateX(70deg)' }} />
    </div>
  );
};

