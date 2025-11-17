import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { PageQuickNav } from "@/components/PageQuickNav"
import { deliverables } from "@/data/deliverables"

type InteractiveCard = {
  id: number
  title: string
  subtitle: string
  rarity: string
  description: string
}

export const Submission: React.FC = () => {
  const hasDeliverables = deliverables.length > 0

  const cards = useMemo<InteractiveCard[]>(() => {
    if (!hasDeliverables) return []
    const rarityPalette = ["★★★★★", "★★★★", "★★★★", "★★★", "★★★★★", "★★★★", "★★★", "★★★★★"]

    return deliverables.map((item, index) => ({
      id: index + 1,
      title: item.title,
      subtitle: `PROJECT ${index + 1}`,
      rarity: rarityPalette[index % rarityPalette.length],
      description: item.description,
    }))
  }, [hasDeliverables, deliverables])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cardsRef = useRef<THREE.Mesh[]>([])
  const groupRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [selectedCard, setSelectedCard] = useState<InteractiveCard | null>(null)

  const rotationRef = useRef({ current: 0, target: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, rotation: 0 })
  const lastMoveTimeRef = useRef(Date.now())
  const isRevealingRef = useRef(false)

  const createCardTexture = useCallback((card: InteractiveCard) => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 768
    const ctx = canvas.getContext("2d")

    if (!ctx) return null

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#141E30")
    gradient.addColorStop(1, "#243B55")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgba(255,255,255,0.12)"
    for (let i = 0; i < 40; i += 1) {
      const size = Math.random() * 4
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    const splitLines = (text: string, maxChars: number) => {
      const chars = Array.from(text)
      const lines: string[] = []
      for (let i = 0; i < chars.length; i += maxChars) {
        lines.push(chars.slice(i, i + maxChars).join(""))
      }
      return lines
    }

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 36px 'Noto Sans JP', 'Roboto', sans-serif"
    const titleLines = splitLines(card.title, 10).slice(0, 2)
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 240 + index * 44)
    })

    ctx.font = "24px 'Noto Sans JP', 'Roboto', sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.85)"
    const subtitleLines = splitLines(card.subtitle, 16).slice(0, 1)
    subtitleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 340 + index * 34)
    })

    ctx.font = "24px 'Noto Sans JP', 'Roboto', sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.7)"
    const descriptionLines = splitLines(card.description, 18).slice(0, 3)
    descriptionLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 400 + index * 32)
    })

    ctx.font = "bold 28px 'Noto Sans JP', 'Roboto', sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.9)"
    ctx.fillText(card.rarity, canvas.width / 2, canvas.height - 60)

    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  useEffect(() => {
    if (!hasDeliverables || cards.length === 0) return

    const container = containerRef.current
    if (!container) return

    rotationRef.current.current = 0
    rotationRef.current.target = 0

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const perspective = container.clientWidth / container.clientHeight || window.innerWidth / window.innerHeight
    const camera = new THREE.PerspectiveCamera(60, perspective, 0.1, 1000)
    camera.position.z = 12
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const group = new THREE.Group()
    scene.add(group)
    groupRef.current = group

    cardsRef.current = []

    const radius = Math.max(6, Math.min(12, cards.length * 1.5))
    const angleStep = (Math.PI * 2) / cards.length

    cards.forEach((card, index) => {
      const angle = index * angleStep
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius

      const geometry = new THREE.PlaneGeometry(2.4, 3.6)
      const texture = createCardTexture(card)
      const material = new THREE.MeshPhysicalMaterial({
        map: texture ?? undefined,
        color: texture ? 0xffffff : 0xeeeeee,
        roughness: 0.25,
        metalness: 0.15,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, 0, z)
      mesh.userData = { cardData: card, index, texture }
      group.add(mesh)
      cardsRef.current.push(mesh)
    })

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const normalizeAngle = (angle: number) => {
      let normalized = angle % (Math.PI * 2)
      if (normalized > Math.PI) {
        normalized -= Math.PI * 2
      } else if (normalized < -Math.PI) {
        normalized += Math.PI * 2
      }
      return normalized
    }

    const getNearestCardIndex = () => {
      const currentRotation = normalizeAngle(rotationRef.current.current)
      const anglePerCard = (Math.PI * 2) / cards.length
      let nearestIndex = Math.round(-currentRotation / anglePerCard)
      while (nearestIndex < 0) nearestIndex += cards.length
      return nearestIndex % cards.length
    }

    const handleClick = (event: MouseEvent) => {
      if (!cameraRef.current || !rendererRef.current) return
      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, cameraRef.current)
      const intersects = raycaster.intersectObjects(cardsRef.current)

      if (intersects.length === 0) return
      const clickedCard = intersects[0].object as THREE.Mesh
      const nearestIndex = getNearestCardIndex()
      if (clickedCard.userData.index === nearestIndex && !isRevealingRef.current) {
        setSelectedCard(clickedCard.userData.cardData as InteractiveCard)
        isRevealingRef.current = true
      } else if (typeof clickedCard.userData.index === "number") {
        const anglePerCard = (Math.PI * 2) / cards.length
        rotationRef.current.target = normalizeAngle(-clickedCard.userData.index * anglePerCard)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      isDraggingRef.current = true
      dragStartRef.current = {
        x: event.clientX,
        rotation: rotationRef.current.current,
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return
      const containerWidth = container.clientWidth || window.innerWidth
      const deltaX = event.clientX - dragStartRef.current.x
      const rotationAmount = (deltaX / containerWidth) * Math.PI * 2
      rotationRef.current.target = dragStartRef.current.rotation + rotationAmount
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      const currentRotation = rotationRef.current.current
      const targetRotation = rotationRef.current.target
      const diff = targetRotation - currentRotation
      if (Math.abs(diff) > 0.0001) {
        const speed = isDraggingRef.current ? 0.08 : 0.12
        rotationRef.current.current += diff * speed
        lastMoveTimeRef.current = Date.now()
      }

      if (groupRef.current) {
        groupRef.current.rotation.y = rotationRef.current.current
      }

      cardsRef.current.forEach((mesh) => {
        const cardPosition = mesh.position.clone()
        const toCenter = cardPosition.clone().negate()
        toCenter.y = 0
        toCenter.normalize()
        const angle = Math.atan2(toCenter.x, toCenter.z) + Math.PI
        mesh.rotation.y = angle
      })

      renderer.render(scene, camera)
    }

    renderer.domElement.addEventListener("click", handleClick)
    renderer.domElement.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("resize", handleResize)

    handleResize()
    animate()

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.domElement.removeEventListener("click", handleClick)
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("resize", handleResize)

      cardsRef.current.forEach((mesh) => {
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose())
        } else {
          mesh.material.dispose()
        }
        if (mesh.userData.texture) {
          ;(mesh.userData.texture as THREE.Texture).dispose()
        }
      })
      cardsRef.current = []

      if (groupRef.current) {
        scene.remove(groupRef.current)
        groupRef.current = null
      }

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.clear()
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
    }
  }, [cards, createCardTexture, hasDeliverables])

  const closeCard = useCallback(() => {
    setSelectedCard(null)
    isRevealingRef.current = false
  }, [])

  if (!hasDeliverables) {
    return (
      <>
        <PageQuickNav />
        <div className="container mx-auto max-w-4xl space-y-6 py-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">成果物紹介</h1>
          <p className="text-muted-foreground">
            研究室メンバーが取り組んだ制作物をまとめています。各プロジェクトの概要をご覧いただけます。
          </p>
        </header>
        <p className="text-muted-foreground">現在、公開できる成果物はありません。</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageQuickNav />
      <div
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{ background: "linear-gradient(180deg, #0f2027 0%, #203a43 40%, #2c5364 100%)" }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <header className="pointer-events-none absolute left-1/2 top-12 z-10 w-full max-w-2xl -translate-x-1/2 space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-white/70">Interactive Showcase</p>
        <h1 className="text-3xl font-bold md:text-4xl">開封したい成果物をタップ！</h1>
        <p className="text-base text-white/70">
          ドラッグで回転、正面のカードをタップすると詳しい情報が表示されます。
        </p>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 text-center text-sm text-white/70">
        <span className="rounded-full border border-white/30 px-5 py-2 backdrop-blur">
          Tip: 画面をドラッグしてカルーセルを回転できます
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" />

      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeCard}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-8 text-slate-900 shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-sm uppercase tracking-[0.4em] text-slate-500">{selectedCard.rarity}</div>
            <h2 className="mt-4 text-center text-3xl font-bold text-slate-900">{selectedCard.title}</h2>
            <p className="mt-2 text-center text-lg text-slate-500">{selectedCard.subtitle}</p>
            <p className="mt-6 text-center text-base leading-7 text-slate-700">{selectedCard.description}</p>
            <button
              type="button"
              onClick={closeCard}
              className="mt-8 w-full rounded-xl bg-slate-900 px-4 py-3 text-lg font-semibold text-white transition hover:bg-slate-800"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default Submission