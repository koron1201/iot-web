import React, { useEffect, useRef } from "react"
import * as THREE from "three"

import type { Scene3DProps, SubmissionProject } from "./types"

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (!text) return [""]
  const normalized = text.trim()
  if (!normalized) return [""]

  const hasSpaces = /\s/.test(normalized)
  const tokens = hasSpaces ? normalized.split(/\s+/) : Array.from(normalized)
  const lines: string[] = []
  let currentLine = tokens[0] ?? ""

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]
    const candidate = hasSpaces ? `${currentLine} ${token}` : `${currentLine}${token}`
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate
    } else {
      if (currentLine.trim()) lines.push(currentLine)
      currentLine = token
    }
  }

  if (currentLine.trim()) {
  lines.push(currentLine)
  }

  return lines.length > 0 ? lines : [""]
}

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

type SummonParticles = {
  geometry: THREE.BufferGeometry
  points: THREE.Points
  progress: Float32Array
  baseSpeed: number
}

export const Scene3D: React.FC<Scene3DProps> = ({ projects, onProjectClick, onProjectSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cardsRef = useRef<THREE.Group[]>([])
  const isDraggingRef = useRef(false)
  const previousPointer = useRef({ x: 0 })
  const currentRotationRef = useRef(0)
  const animationIdRef = useRef<number | null>(null)
  const frontIndexRef = useRef(0)
  const pointerMovedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || projects.length === 0) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000814, 10, 50)
    sceneRef.current = scene

    const width = container.clientWidth
    const height = container.clientHeight || window.innerHeight
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 5, 14)
    camera.lookAt(0, 4.5, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000814, 0)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))

    const keyLight = new THREE.DirectionalLight(0x00d4ff, 1)
    keyLight.position.set(5, 10, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x0088ff, 0.5)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(0x00ffff, 1, 30)
    rimLight.position.set(0, 8, 0)
    scene.add(rimLight)

    const floorGroup = new THREE.Group()
    for (let i = 0; i < 8; i += 1) {
      const radius = 2 + i * 0.7
      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.05, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3 - i * 0.03,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.userData.rotationSpeed = i % 2 === 0 ? 0.001 : -0.001
      floorGroup.add(ring)
    }

    const gridLines = new THREE.Group()
    for (let i = 0; i < 32; i += 1) {
      const angle = (i / 32) * Math.PI * 2
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([0, 0, 0, Math.cos(angle) * 8, 0, Math.sin(angle) * 8])
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
      const material = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      })
      const line = new THREE.Line(geometry, material)
      gridLines.add(line)
    }
    gridLines.rotation.x = -Math.PI / 2
    floorGroup.add(gridLines)
    scene.add(floorGroup)

    const projectorTarget = new THREE.Vector3(0, 4.5, 0)
    const projectorGroup = new THREE.Group()
    const diskGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32)
    const diskMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    })
    const disk = new THREE.Mesh(diskGeometry, diskMaterial)
    disk.position.y = 0.05
    projectorGroup.add(disk)

    const beamGeometry = new THREE.ConeGeometry(18, 10, 32, 1, true)
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    beamMaterial.depthWrite = false
    beamMaterial.depthTest = false
    const beam = new THREE.Mesh(beamGeometry, beamMaterial)
    beam.position.y = 5
    beam.rotation.x = Math.PI
    beam.renderOrder = 1
    projectorGroup.add(beam)

    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 200
    const particlePositions = new Float32Array(particleCount * 3)
    const particleVelocities: { x: number; y: number; z: number }[] = []
    for (let i = 0; i < particleCount; i += 1) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.5
      particlePositions[i * 3] = Math.cos(angle) * radius
      particlePositions[i * 3 + 1] = Math.random() * 8
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius
      particleVelocities.push({
        x: Math.cos(angle) * 0.01,
        y: 0.02 + Math.random() * 0.01,
        z: Math.sin(angle) * 0.01,
      })
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      }),
    )
    ;(particles.userData as { velocities: typeof particleVelocities }).velocities = particleVelocities
    projectorGroup.add(particles)
    scene.add(projectorGroup)

    const hologramRings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i += 1) {
      const ringRadius = 5 + i * 0.5
      const ringGeometry = new THREE.TorusGeometry(ringRadius, 0.03, 16, 100)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      ring.position.y = 2 + i * 0.5
      ring.userData.rotationSpeed = 0.002 * (i + 1) * (i % 2 === 0 ? 1 : -1)
      hologramRings.push(ring)
      scene.add(ring)
    }

    const CARD_WIDTH = 2.3
    const CARD_HEIGHT = 3.4
    const cardHalfHeight = CARD_HEIGHT / 2
    const cardElevation = 4.6
    const cardRadius = 7.2
    const spawnOrigin = new THREE.Vector3(0, 1.2, 0)
    const cards: THREE.Group[] = []
    cardsRef.current = cards

    const rarityLabels = ["COMMON", "UNCOMMON", "RARE", "ELITE", "LEGEND"]
    const buildCardTexture = (project: SubmissionProject) => {
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 712
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      ctx.fillStyle = "#041126"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const backgroundGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      backgroundGradient.addColorStop(0, "rgba(12,28,63,0.95)")
      backgroundGradient.addColorStop(0.5, "rgba(6,35,82,0.92)")
      backgroundGradient.addColorStop(1, "rgba(8,44,92,0.88)")
      ctx.fillStyle = backgroundGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgba(59,130,246,0.5)"
      ctx.lineWidth = 4
      drawRoundedRect(ctx, 16, 16, canvas.width - 32, canvas.height - 32, 24)
      ctx.stroke()

      ctx.strokeStyle = "rgba(56,189,248,0.08)"
      ctx.lineWidth = 1
      for (let y = 60; y < canvas.height - 40; y += 48) {
        ctx.beginPath()
        ctx.moveTo(30, y)
        ctx.lineTo(canvas.width - 30, y)
        ctx.stroke()
      }
      for (let x = 60; x < canvas.width - 40; x += 80) {
        ctx.beginPath()
        ctx.moveTo(x, 40)
        ctx.lineTo(x, canvas.height - 40)
        ctx.stroke()
      }

      const panelX = 40
      const panelY = 48
      const panelWidth = canvas.width - panelX * 2
      const panelHeight = canvas.height - panelY * 2
      drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 28)
      const panelGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight)
      panelGradient.addColorStop(0, "rgba(255,255,255,0.08)")
      panelGradient.addColorStop(1, "rgba(255,255,255,0.18)")
      ctx.fillStyle = panelGradient
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.22)"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.fillStyle = "#ffffff"
      drawRoundedRect(ctx, panelX + 32, panelY + 32, panelWidth - 64, panelHeight - 64, 24)
      ctx.fill()
      ctx.restore()

      const layoutX = 64
      const contentWidth = canvas.width - layoutX * 2
      const headerY = 64
      const accentHeight = 30

      drawRoundedRect(ctx, layoutX, headerY, contentWidth, accentHeight, 14)
      const accentGradient = ctx.createLinearGradient(layoutX, headerY, layoutX + contentWidth, headerY + accentHeight)
      accentGradient.addColorStop(0, "rgba(117,212,255,0.9)")
      accentGradient.addColorStop(1, "rgba(59,188,255,0.85)")
      ctx.fillStyle = accentGradient
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.8)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.font = "600 16px 'IBM Plex Mono', 'Noto Sans JP', monospace"
      ctx.fillStyle = "#f7fbff"
      ctx.textAlign = "left"
      ctx.fillText(project.subtitle, layoutX + 18, headerY + accentHeight - 8)

      const titleBlockY = headerY + accentHeight + 16
      const titleBlockHeight = 120
      drawRoundedRect(ctx, layoutX, titleBlockY, contentWidth, titleBlockHeight, 20)
      const titleGradient = ctx.createLinearGradient(layoutX, titleBlockY, layoutX + contentWidth, titleBlockY + titleBlockHeight)
      titleGradient.addColorStop(0, "rgba(6,12,32,0.9)")
      titleGradient.addColorStop(1, "rgba(12,39,74,0.9)")
      ctx.fillStyle = titleGradient
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.18)"
      ctx.stroke()

      ctx.textAlign = "center"
      ctx.fillStyle = "#fbfdff"
      ctx.font = "700 38px 'Noto Sans JP', 'Inter', sans-serif"
      ctx.shadowColor = "rgba(0,0,0,0.35)"
      ctx.shadowBlur = 10
      const titleLines = wrapText(ctx, project.title, contentWidth - 80)
      titleLines.slice(0, 2).forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, titleBlockY + 60 + index * 36)
      })
      ctx.shadowColor = "transparent"

      ctx.font = "600 22px 'Space Grotesk', sans-serif"
      ctx.fillStyle = "#fbbf24"
      const stars = "★".repeat(project.rarity) + "☆".repeat(Math.max(0, 5 - project.rarity))
      ctx.fillText(stars, canvas.width / 2, titleBlockY + titleBlockHeight - 12)

      const infoRowY = titleBlockY + titleBlockHeight + 10
      const infoRowHeight = 84
      drawRoundedRect(ctx, layoutX, infoRowY, contentWidth, infoRowHeight, 16)
      ctx.fillStyle = "rgba(5,14,30,0.92)"
      ctx.fill()
      ctx.strokeStyle = "rgba(14,165,233,0.25)"
      ctx.stroke()

      ctx.font = "16px 'Noto Sans JP', sans-serif"
      const descriptionLines = wrapText(ctx, project.description, contentWidth - 70)
      const summaryLines = descriptionLines.slice(0, 2)
      if (!summaryLines.some((line) => line.trim().length > 0)) {
        summaryLines.splice(0, summaryLines.length, "詳細情報は準備中です。")
      }
      const detailLines = descriptionLines.slice(2, 8)
      if (detailLines.length === 0) {
        detailLines.push("追加情報はモーダルでご確認ください。")
      }

      const rarityLabel = rarityLabels[Math.min(Math.max(project.rarity, 1), 5) - 1] ?? "RARE"
      const infoColumns = [
        { label: "RARITY", value: rarityLabel },
        { label: "PROJECT ID", value: `#${project.id.toString().padStart(2, "0")}` },
        { label: "LINES", value: `${descriptionLines.length}` },
      ]

      ctx.textAlign = "center"
      infoColumns.forEach((column, columnIndex) => {
        const columnX = layoutX + (contentWidth / (infoColumns.length + 1)) * (columnIndex + 1)
        ctx.font = "11px 'IBM Plex Mono', monospace"
        ctx.fillStyle = "#e0f2ff"
        ctx.fillText(column.label, columnX, infoRowY + 24)
        ctx.font = "600 20px 'Inter', sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText(column.value, columnX, infoRowY + 54)
      })

      const summaryY = infoRowY + infoRowHeight + 12
      const summaryHeight = 140
      drawRoundedRect(ctx, layoutX, summaryY, contentWidth, summaryHeight, 18)
      const summaryGradient = ctx.createLinearGradient(layoutX, summaryY, layoutX + contentWidth, summaryY + summaryHeight)
      summaryGradient.addColorStop(0, "rgba(7,23,58,0.94)")
      summaryGradient.addColorStop(1, "rgba(2,14,32,0.95)")
      ctx.fillStyle = summaryGradient
      ctx.fill()
      ctx.strokeStyle = "rgba(45,212,191,0.35)"
      ctx.stroke()

      ctx.textAlign = "left"
      ctx.font = "600 13px 'IBM Plex Mono', monospace"
      ctx.fillStyle = "#f0fbff"
      ctx.fillText("OVERVIEW", layoutX + 20, summaryY + 24)

      ctx.font = "600 16px 'Noto Sans JP', sans-serif"
      ctx.fillStyle = "#fefefe"
      summaryLines.forEach((line, lineIndex) => {
        ctx.fillText(line, layoutX + 24, summaryY + 54 + lineIndex * 28)
      })

      const detailY = summaryY + summaryHeight + 12
      const detailHeight = 170
      drawRoundedRect(ctx, layoutX, detailY, contentWidth, detailHeight, 18)
      ctx.fillStyle = "rgba(3,12,30,0.95)"
      ctx.fill()
      ctx.strokeStyle = "rgba(59,130,246,0.35)"
      ctx.stroke()

      ctx.font = "600 13px 'IBM Plex Mono', monospace"
      ctx.fillStyle = "#d0dbff"
      ctx.fillText("DETAIL LOG", layoutX + 20, detailY + 24)

      ctx.font = "15px 'Noto Sans JP', sans-serif"
      ctx.fillStyle = "#e0f2fe"
      detailLines.forEach((line, lineIndex) => {
        const lineY = detailY + 54 + lineIndex * 28
        drawRoundedRect(ctx, layoutX + 18, lineY - 20, contentWidth - 36, 30, 10)
        ctx.fillStyle = `rgba(92,142,255,${0.26 + lineIndex * 0.05})`
        ctx.fill()
        ctx.fillStyle = "#fefefe"
        ctx.fillText(line, layoutX + 32, lineY)
      })

      if (project.tags && project.tags.length > 0) {
        let chipX = layoutX + 20
        const chipY = detailY + detailHeight - 40
        project.tags.slice(0, 3).forEach((tag) => {
          const chipWidth = Math.min(contentWidth / 2 - 20, ctx.measureText(tag).width + 32)
          drawRoundedRect(ctx, chipX, chipY, chipWidth, 26, 10)
          ctx.fillStyle = "rgba(18,163,255,0.28)"
          ctx.fill()
          ctx.strokeStyle = "rgba(188,245,255,0.7)"
          ctx.stroke()
          ctx.textAlign = "center"
          ctx.font = "600 13px 'IBM Plex Mono', monospace"
          ctx.fillStyle = "#f6fbff"
          ctx.fillText(tag, chipX + chipWidth / 2, chipY + 18)
          ctx.textAlign = "left"
          chipX += chipWidth + 12
        })
      }

      const footerY = detailY + detailHeight + 12
      drawRoundedRect(ctx, layoutX, footerY, contentWidth, 66, 16)
      ctx.fillStyle = "rgba(4,15,36,0.96)"
      ctx.fill()
      ctx.strokeStyle = "rgba(59,130,246,0.35)"
      ctx.stroke()
      ctx.textAlign = "center"
      ctx.font = "600 12px 'IBM Plex Mono', monospace"
      ctx.fillStyle = "#7dd3fc"
      ctx.fillText("SMART ICT SOLUTIONS LAB - DATA CHANNEL", canvas.width / 2, footerY + 24)
      ctx.font = "600 18px 'Inter', sans-serif"
      ctx.fillStyle = "#e0f2fe"
      ctx.fillText("Tap for full briefing", canvas.width / 2, footerY + 46)

      for (let i = 0; i < 35; i += 1) {
        const sparkleX = Math.random() * canvas.width
        const sparkleY = Math.random() * canvas.height
        const sparkleSize = Math.random() * 2 + 1
        ctx.fillStyle = `rgba(56, 189, 248, ${0.15 + Math.random() * 0.3})`
        ctx.beginPath()
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2)
        ctx.fill()
      }

      return new THREE.CanvasTexture(canvas)
    }

    projects.forEach((project, index) => {
      const cardGroup = new THREE.Group()
      cardGroup.renderOrder = 20
      cardGroup.userData.index = index
      cardGroup.userData.project = project
      cardGroup.userData.spawnProgress = 0
      cardGroup.userData.spawnOrigin = spawnOrigin.clone()

      const cardGeometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT)
      const texture = buildCardTexture(project)
      const cardMaterial = new THREE.MeshBasicMaterial({
        map: texture ?? undefined,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      })
      const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial)
      cardMesh.renderOrder = 30
      cardGroup.add(cardMesh)
      cardGroup.userData.cardMesh = cardMesh

      const scanlineCanvas = document.createElement("canvas")
      scanlineCanvas.width = 512
      scanlineCanvas.height = 712
      const scanCtx = scanlineCanvas.getContext("2d")
      if (scanCtx) {
        for (let y = 0; y < scanlineCanvas.height; y += 4) {
          const alpha = 0.04 + Math.random() * 0.05
          scanCtx.fillStyle = `rgba(0, 212, 255, ${alpha})`
          scanCtx.fillRect(0, y, scanlineCanvas.width, 2)
        }
      }
      const scanlineMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(scanlineCanvas),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const scanline = new THREE.Mesh(cardGeometry.clone(), scanlineMaterial)
      scanline.position.z = 0.005
      scanline.renderOrder = 31
      cardGroup.add(scanline)
      cardGroup.userData.scanline = scanline

      const glowGeometry = new THREE.PlaneGeometry(CARD_WIDTH + 0.2, CARD_HEIGHT + 0.2)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.z = -0.01
      glow.renderOrder = 28
      cardGroup.add(glow)
      cardGroup.userData.glow = glow

      const edgeGlowGeometry = new THREE.PlaneGeometry(CARD_WIDTH + 0.45, CARD_HEIGHT + 0.45)
      const edgeGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const edgeGlow = new THREE.Mesh(edgeGlowGeometry, edgeGlowMaterial)
      edgeGlow.position.z = -0.02
      edgeGlow.renderOrder = 27
      cardGroup.add(edgeGlow)
      cardGroup.userData.edgeGlow = edgeGlow

      const connectionGeometry = new THREE.BufferGeometry()
      const connectionPositions = new Float32Array(6)
      connectionGeometry.setAttribute("position", new THREE.BufferAttribute(connectionPositions, 3))
      const connectionMaterial = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const connectionLine = new THREE.Line(connectionGeometry, connectionMaterial)
      connectionLine.renderOrder = 18
      cardGroup.add(connectionLine)
      cardGroup.userData.connectionLine = connectionLine

      const summonParticleCount = 48
      const summonPositions = new Float32Array(summonParticleCount * 3)
      const summonProgress = new Float32Array(summonParticleCount)
      for (let i = 0; i < summonParticleCount; i += 1) {
        summonProgress[i] = Math.random()
      }
      const summonGeometry = new THREE.BufferGeometry()
      summonGeometry.setAttribute("position", new THREE.BufferAttribute(summonPositions, 3))
      const summonMaterial = new THREE.PointsMaterial({
        color: 0x67e8f9,
        size: 0.08,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const summonPoints = new THREE.Points(summonGeometry, summonMaterial)
      summonPoints.renderOrder = 26
      cardGroup.add(summonPoints)
      const summonParticleData: SummonParticles = {
        geometry: summonGeometry,
        points: summonPoints,
        progress: summonProgress,
        baseSpeed: 0.25 + Math.random() * 0.15,
      }
      cardGroup.userData.summonParticles = summonParticleData

      cardGroup.position.copy(spawnOrigin)
      cardGroup.scale.setScalar(0.7)
      cards.push(cardGroup)
      scene.add(cardGroup)
    })

    const tempTargetPosition = new THREE.Vector3()

    const updateCardPositions = () => {
      let nextFrontIndex = frontIndexRef.current
      let minDiff = Number.POSITIVE_INFINITY

      cards.forEach((cardGroup, index) => {
        const angle = currentRotationRef.current + (index / projects.length) * Math.PI * 2
        const x = Math.cos(angle) * cardRadius
        const z = Math.sin(angle) * cardRadius
        tempTargetPosition.set(x, cardElevation, z)
        const spawnProgress = Math.min(1, (cardGroup.userData.spawnProgress as number) ?? 0)
        const easedProgress = 1 - Math.pow(1 - spawnProgress, 2)
        const origin = (cardGroup.userData.spawnOrigin as THREE.Vector3) ?? spawnOrigin
        cardGroup.position.lerpVectors(origin, tempTargetPosition, easedProgress)
        cardGroup.lookAt(camera.position)

        const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const isFront = normalizedAngle < 0.35 || normalizedAngle > Math.PI * 2 - 0.35
        const sizeMultiplier = isFront ? 1.05 : 0.82
        cardGroup.scale.setScalar(sizeMultiplier * (0.75 + easedProgress * 0.25))

        const glow = cardGroup.userData.glow as THREE.Mesh | undefined
        if (glow) {
          const glowMaterial = glow.material as THREE.MeshBasicMaterial
          glowMaterial.opacity = (isFront ? 0.45 : 0.18) * (0.6 + easedProgress * 0.4)
        }

        const diff = Math.min(normalizedAngle, Math.abs(Math.PI * 2 - normalizedAngle))
        if (diff < minDiff) {
          minDiff = diff
          nextFrontIndex = index
        }
      })

      if (nextFrontIndex !== frontIndexRef.current) {
        frontIndexRef.current = nextFrontIndex
        onProjectSelect(nextFrontIndex)
      }
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const animateToRotation = (targetRotation: number) => {
      const startRotation = currentRotationRef.current
      const diff = targetRotation - startRotation
      const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
      const duration = 800
      const startTime = Date.now()

      const step = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        currentRotationRef.current = startRotation + normalizedDiff * eased
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }

      step()
    }

    const handlePointerDown = (event: PointerEvent) => {
      isDraggingRef.current = true
      pointerMovedRef.current = false
      previousPointer.current = { x: event.clientX }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = event.clientX - previousPointer.current.x
      if (Math.abs(deltaX) < 0.5) return
      currentRotationRef.current += deltaX * 0.01
      previousPointer.current = { x: event.clientX }
      if (!pointerMovedRef.current && Math.abs(deltaX) >= 2) {
        pointerMovedRef.current = true
      }
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
    }

    const handleClick = (event: MouseEvent) => {
      if (pointerMovedRef.current) {
        pointerMovedRef.current = false
        return
      }
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(cards, true)
      if (intersects.length === 0) return

      let target: THREE.Object3D | null = intersects[0].object
      while (target && typeof target.userData.index !== "number") {
        target = target.parent
      }
      if (!target) return

      const clickedCard = target as THREE.Group
      const clickedIndex = clickedCard.userData.index as number
      const currentAngle = ((currentRotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const cardAngle = (clickedIndex / projects.length) * Math.PI * 2
      const angleDiff = Math.abs(((currentAngle - cardAngle + Math.PI) % (Math.PI * 2)) - Math.PI)

      if (angleDiff < 0.45) {
        onProjectClick(clickedCard.userData.project as SubmissionProject)
        pointerMovedRef.current = false
      } else {
        pointerMovedRef.current = false
        animateToRotation(-cardAngle)
      }
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !containerRef.current) return
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight || window.innerHeight
      cameraRef.current.aspect = newWidth / newHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(newWidth, newHeight)
    }

    const cardWorldPosition = new THREE.Vector3()
    const connectionVector = new THREE.Vector3()

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      const time = Date.now() * 0.001

      floorGroup.children.forEach((child) => {
        if (child.userData.rotationSpeed) {
          child.rotation.z += child.userData.rotationSpeed
        }
      })

      disk.rotation.y += 0.01
      beamMaterial.opacity = 0.05 + Math.sin(time * 1.2) * 0.02

      const posArray = particles.geometry.attributes.position.array as Float32Array
      const velocities = (particles.userData as { velocities: typeof particleVelocities }).velocities
      velocities.forEach((velocity, index) => {
        const i3 = index * 3
        posArray[i3] += velocity.x
        posArray[i3 + 1] += velocity.y
        posArray[i3 + 2] += velocity.z
        if (posArray[i3 + 1] > 8) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 0.5
          posArray[i3] = Math.cos(angle) * radius
          posArray[i3 + 1] = 0
          posArray[i3 + 2] = Math.sin(angle) * radius
        }
      })
      particles.geometry.attributes.position.needsUpdate = true

      hologramRings.forEach((ring) => {
        ring.rotation.z += ring.userData.rotationSpeed
      })

      updateCardPositions()

      cards.forEach((cardGroup, index) => {
        const spawnProgress = Math.min(1, (cardGroup.userData.spawnProgress as number) ?? 0)
        const updatedSpawn = Math.min(spawnProgress + 0.015, 1)
        cardGroup.userData.spawnProgress = updatedSpawn
        const easedSpawn = 1 - Math.pow(1 - updatedSpawn, 2)
        cardGroup.getWorldPosition(cardWorldPosition)

        const scanline = cardGroup.userData.scanline as THREE.Mesh | undefined
        if (scanline) {
          scanline.position.y = Math.sin(time * 2 + index) * 0.02
          const scanMaterial = scanline.material as THREE.MeshBasicMaterial
          scanMaterial.opacity = (0.2 + Math.sin(time * 4 + index) * 0.05) * (0.5 + easedSpawn * 0.5)
        }

        const glow = cardGroup.userData.glow as THREE.Mesh | undefined
        if (glow) {
          const glowMaterial = glow.material as THREE.MeshBasicMaterial
          const isFront = frontIndexRef.current === index
          const base = isFront ? 0.5 : 0.2
          glowMaterial.opacity = (base + Math.sin(time * 3 + index) * 0.08) * easedSpawn
        }

        const edgeGlow = cardGroup.userData.edgeGlow as THREE.Mesh | undefined
        if (edgeGlow) {
          const edgeMaterial = edgeGlow.material as THREE.MeshBasicMaterial
          edgeMaterial.opacity = (0.15 + Math.sin(time * 5 + index) * 0.05) * (0.6 + easedSpawn * 0.4)
        }

        const cardMesh = cardGroup.userData.cardMesh as THREE.Mesh | undefined
        if (cardMesh) {
          const material = cardMesh.material as THREE.MeshBasicMaterial
          material.opacity = 0.98
        }

        const summonParticles = cardGroup.userData.summonParticles as SummonParticles | undefined
        if (summonParticles) {
          const attr = summonParticles.geometry.getAttribute("position") as THREE.BufferAttribute
          const arr = attr.array as Float32Array
          connectionVector.copy(cardWorldPosition).sub(projectorTarget)
          for (let i = 0; i < summonParticles.progress.length; i += 1) {
            const idx = i * 3
            summonParticles.progress[i] = (summonParticles.progress[i] + 0.01 * summonParticles.baseSpeed) % 1
            const t = summonParticles.progress[i]
            const jitter = (Math.random() - 0.5) * 0.18
            const jitterY = (Math.random() - 0.5) * 0.2
            arr[idx] = projectorTarget.x + connectionVector.x * t + jitter
            arr[idx + 1] = projectorTarget.y + connectionVector.y * Math.pow(t, 0.9) + jitterY
            arr[idx + 2] = projectorTarget.z + connectionVector.z * t + jitter
          }
          attr.needsUpdate = true
          const summonMaterial = summonParticles.points.material as THREE.PointsMaterial
          summonMaterial.opacity = 0.12 + easedSpawn * 0.5
          summonMaterial.size = 0.05 + easedSpawn * 0.05
        }

        const connectionLine = cardGroup.userData.connectionLine as THREE.Line | undefined
        if (connectionLine) {
          const attr = connectionLine.geometry.getAttribute("position") as THREE.BufferAttribute
          const arr = attr.array as Float32Array
          arr[0] = 0
          arr[1] = -cardHalfHeight
          arr[2] = 0
          connectionVector.copy(projectorTarget).sub(cardWorldPosition)
          arr[3] = connectionVector.x
          arr[4] = connectionVector.y
          arr[5] = connectionVector.z
          attr.needsUpdate = true
          const lineMaterial = connectionLine.material as THREE.LineBasicMaterial
          lineMaterial.opacity = 0.2 + Math.sin(time * 4 + index) * 0.1
        }
      })

      renderer.render(scene, camera)
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    renderer.domElement.addEventListener("click", handleClick)
    window.addEventListener("resize", handleResize)

    updateCardPositions()
    handleResize()
    animate()

    return () => {
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      renderer.domElement.removeEventListener("click", handleClick)
      window.removeEventListener("resize", handleResize)

      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      cardsRef.current = []
      scene.clear()
    }
  }, [projects, onProjectClick, onProjectSelect])

  return <div ref={containerRef} className="h-full w-full" />
}

