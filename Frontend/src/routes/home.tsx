import { useEffect, useMemo, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import * as THREE from "three"
import {GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { siteNavigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

const RESEARCH_FIELDS = [
  {
    title: "IoT / CPS",
    description:
      "IoTデバイスとサイバーフィジカルシステムを活用したデータ駆動型ソリューションの研究。",
  },
  {
    title: "人工知能 / 機械学習",
    description:
      "高度なAIアルゴリズムを用いた予測・最適化・自律システムの開発。",
  },
  {
    title: "デジタルツイン",
    description:
      "現実世界のシステムを仮想空間に再現し、分析・シミュレーションに活用。",
  },
  {
    title: "メタバース応用",
    description:
      "仮想空間と現実空間を融合させた新しい学習・研究環境の創出。",
  },
]

type InfoKey = "news" | "contact" | "fields"

type NewsItem = {
  id: number
  date: string
  title: string
  category: string
}

const CONTACT_TOPICS = [
  {
    title: "研究室見学",
    description: "研究内容の紹介や設備見学の調整、日程に関するご相談を受け付けています。",
  },
  {
    title: "学生相談・質問",
    description: "配属に向けた質問や学習計画の相談など、学生の皆さまからの問い合わせに個別対応します。",
  },
]

const LATEST_NEWS: NewsItem[] = [
  { id: 1, date: "2025.11.06", title: "Webサイト開設", category: "その他" },
  { id: 2, date: "2025.11.07", title: "研究成果が主要展示会で採択", category: "イベント" },
  { id: 3, date: "2025.11.09", title: "都市OS向け実証実験を開始", category: "重要" },
]

const getNewsCategoryClass = (category: string) => {
  switch (category) {
    case "重要":
      return "border-red-400/50 text-red-200"
    case "イベント":
      return "border-emerald-400/40 text-emerald-100"
    default:
      return "border-cyan-400/40 text-cyan-100"
  }
}

type PlanetMeta =
  | { label: string; type: "info"; infoKey: InfoKey }
  | { label: string; type: "nav"; route: string }

type PlanetConfig = {
  label: string
  color: number
  meta: PlanetMeta
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const MAX_PIXEL_RATIO = 1.25
const TARGET_FPS = 45
const TIME_SCALE = 0.6
const LABEL_HEIGHT_OFFSET = 2.4
const LABEL_FLOAT_AMPLITUDE = 0.15
const STAR_COUNT = 1500
const METAVERSE_APP_URL = "http://localhost:8000/static/metaberse/index.html"

const createLabelSprite = (text: string) => {
  const baseWidth = 420
  const baseHeight = 120
  const dpi = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const canvas = document.createElement("canvas")
  canvas.width = baseWidth * dpi
  canvas.height = baseHeight * dpi
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Canvas 2D context not available")
  }

  context.scale(dpi, dpi)
  context.clearRect(0, 0, baseWidth, baseHeight)

  context.font = "600 44px 'Segoe UI', 'Noto Sans JP', sans-serif"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.shadowColor = "rgba(14,165,233,0.85)"
  context.shadowBlur = 18
  context.lineWidth = 4
  context.strokeStyle = "rgba(14,165,233,0.9)"
  context.strokeText(text, baseWidth / 2, baseHeight / 2 + 2)
  context.fillStyle = "rgba(255,255,255,0.98)"
  context.fillText(text, baseWidth / 2, baseHeight / 2 + 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(5, 1.5, 1)
  return sprite
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-wide transition",
    "text-cyan-200/80 hover:text-white hover:bg-white/10",
    isActive ? "text-white bg-white/10" : ""
  )

export const Home = () => {
  const navigate = useNavigate()

  const mountRef = useRef<HTMLDivElement | null>(null)
  const hoveredPlanetRef = useRef<string | null>(null)
  const hoveredMetaRef = useRef<PlanetMeta | null>(null)
  const zoomLevelRef = useRef(0)
  const transitionRef = useRef(false)
  const transitionTimerRef = useRef<number | null>(null)
  const metaverseLaunchedRef = useRef(false)

  const [zoomLevel, setZoomLevel] = useState(0)
  const [showTransition, setShowTransition] = useState(false)
  const [activeInfoKey, setActiveInfoKey] = useState<InfoKey | null>(null)

  const planetConfigs = useMemo<PlanetConfig[]>(
    () => [
      { label: "ニュース", color: 0xff6b9d, meta: { type: "info", label: "ニュース", infoKey: "news" } },
      { label: "お問い合わせ", color: 0x6bffb9, meta: { type: "info", label: "お問い合わせ", infoKey: "contact" } },
      { label: "研究分野", color: 0xffd96b, meta: { type: "info", label: "研究分野", infoKey: "fields" } },
    ],
    []
  )

  useEffect(() => {
    if (!mountRef.current) {
      return
    }

    const mountElement = mountRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 15

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    const initialWidth = mountElement.clientWidth || window.innerWidth
    const initialHeight = mountElement.clientHeight || window.innerHeight
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(initialWidth, initialHeight)
    mountElement.appendChild(renderer.domElement)

    // star field
    const starsGeometry = new THREE.BufferGeometry()
    const starVertices: number[] = []
    for (let i = 0; i < STAR_COUNT; i++) {
      starVertices.push((Math.random() - 0.5) * 2000)
      starVertices.push((Math.random() - 0.5) * 2000)
      starVertices.push((Math.random() - 0.5) * 2000)
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.4,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: false,
      opacity: 0.85,
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    const loader = new GLTFLoader()
    let planetModel: THREE.Group | null = null

    loader.load(
      '/face.glb', 
      (gltf:GLTF) => {
        console.log('GLB loaded:', gltf);
        planetModel = gltf.scene
        planetModel.scale.set(0.7, 0.7, 0.7)
        planetModel.position.set(0, 0, 0)
        planetModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = false
            child.receiveShadow = false
          }
        })
       scene.add(planetModel)
      },
      (xhr) => {
        console.log(`Model ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`)
      },
      (error) => {
       console.error('An error happened while loading GLB:', error)
      }
    )

    // --- ライト設定 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7) // 全体を柔らかく照らす
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8) // 主光源
    directionalLight.position.set(5, 10, 7)
    scene.add(directionalLight)

    const fillLight1 = new THREE.PointLight(0xffffff, 0.4) // 補助光1
    fillLight1.position.set(-5, 5, 5)
    scene.add(fillLight1)

    const fillLight2 = new THREE.PointLight(0xffffff, 0.3) // 補助光2
    fillLight2.position.set(0, -5, 5)
    scene.add(fillLight2)


    //const gridSphere = new THREE.Mesh(
      //new THREE.SphereGeometry(3.05, 32, 32),
      //new THREE.MeshBasicMaterial({
        //color: 0x00ffff,
        //wireframe: true,
        //transparent: true,
        //opacity: 0.25,
      //})
    //)
    //scene.add(gridSphere)

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(3.3, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      })
    )
    //scene.add(glow)

    const planets: Array<{
      mesh: THREE.Mesh
      glow: THREE.Mesh
      glowMaterial: THREE.MeshBasicMaterial
      labelSprite: THREE.Sprite
      labelMaterial: THREE.SpriteMaterial
      label: string
      offset: number
      meta: PlanetMeta
    }> = []
    const planetMeshes: THREE.Mesh[] = []
    planetConfigs.forEach((data, index) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 32, 32),
        new THREE.MeshPhongMaterial({
          color: data.color,
          emissive: data.color,
          emissiveIntensity: 0.35,
        })
      )
      mesh.userData = { label: data.label, meta: data.meta }

      const glowMaterial = new THREE.MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
      })
      const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(1.05, 16, 16), glowMaterial)
      const labelSprite = createLabelSprite(data.label)
      labelSprite.position.set(0, 2.3, 0)
      const labelMaterial = labelSprite.material as THREE.SpriteMaterial
      labelMaterial.opacity = 0
      labelSprite.visible = false
      planets.push({
        mesh,
        glow: glowMesh,
        glowMaterial,
        labelSprite,
        labelMaterial,
        label: data.label,
        offset: index * (Math.PI / 2.5),
        meta: data.meta,
      })
      planetMeshes.push(mesh)
      scene.add(mesh)
      scene.add(glowMesh)
      scene.add(labelSprite)
    })

    scene.add(new THREE.AmbientLight(0x404040, 1))
    const pointLight = new THREE.PointLight(0xffffff, 1.4, 100)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)
    const cyanLight = new THREE.PointLight(0x00ffff, 0.4, 80)
    cyanLight.position.set(-8, -6, 5)
    scene.add(cyanLight)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let pointerDirty = false
    const tempVector = new THREE.Vector3()
    const minFrameInterval = 1000 / TARGET_FPS
    let lastFrameTime = performance.now()
    let isTabHidden = document.hidden

    const handleHoverChange = (label: string | null, meta: PlanetMeta | null) => {
      if (hoveredPlanetRef.current === label) {
        return
      }
      hoveredPlanetRef.current = label
      hoveredMetaRef.current = meta
      document.body.style.cursor = label ? "pointer" : "default"
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      pointerDirty = true
    }

    const handleClick = () => {
      const meta = hoveredMetaRef.current
      if (!meta) {
        return
      }
      if (meta.type === "info") {
        setActiveInfoKey(meta.infoKey)
        return
      }

      if (meta.type === "nav") {
        navigate(meta.route)
      }
    }

    const handleWheel = (event: WheelEvent) => {
      const delta = event.deltaY > 0 ? 0.08 : -0.08
      const nextLevel = clamp(zoomLevelRef.current + delta, 0, 1)
      zoomLevelRef.current = nextLevel
      setZoomLevel(nextLevel)
    }

    const handleResize = () => {
      const nextWidth = mountElement.clientWidth || window.innerWidth
      const nextHeight = mountElement.clientHeight || window.innerHeight
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    }

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden
      lastFrameTime = performance.now()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)
    window.addEventListener("wheel", handleWheel)
    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    let time = 0
    let animationId = 0
    const animate = (now: number) => {
      animationId = requestAnimationFrame(animate)

      if (isTabHidden) {
        lastFrameTime = now
        return
      }

      const deltaMs = now - lastFrameTime
      if (deltaMs < minFrameInterval) {
        return
      }

      lastFrameTime = now
      const delta = deltaMs / 1000
      time += delta * TIME_SCALE

      if (planetModel) {
         planetModel.rotation.y += 0.002
      }

      //gridSphere.rotation.y += 0.003
      glow.rotation.y -= 0.001

      if (pointerDirty) {
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(planetMeshes, false)
        if (intersects.length > 0) {
          const { label, meta } = intersects[0].object.userData as { label: string; meta: PlanetMeta }
          handleHoverChange(label, meta)
        } else {
          handleHoverChange(null, null)
        }
        pointerDirty = false
      }

      planets.forEach((planet) => {
        const radius = 8
        const angle = time * 0.25 + planet.offset
        const cosAngle = Math.cos(angle)
        const sinAngle = Math.sin(angle)
        planet.mesh.position.set(cosAngle * radius, Math.sin(time * 0.6 + planet.offset) * 2, sinAngle * radius)
        planet.glow.position.copy(planet.mesh.position)
        tempVector.copy(planet.mesh.position)
        tempVector.y += LABEL_HEIGHT_OFFSET + Math.sin(time * 2 + planet.offset) * LABEL_FLOAT_AMPLITUDE
        planet.labelSprite.position.copy(tempVector)
        const isHovered = hoveredPlanetRef.current === planet.label
        planet.glowMaterial.opacity = isHovered ? 0.6 : 0.3
        planet.mesh.scale.setScalar(isHovered ? 1.15 : 1)
        planet.labelMaterial.opacity = isHovered ? 1 : 0
        planet.labelSprite.visible = isHovered
        const labelScale = isHovered ? 1.1 : 0.8
        planet.labelSprite.scale.set(5 * labelScale, 1.5 * labelScale, 1)
      })

      stars.rotation.y += 0.0001

      const targetZ = 15 - zoomLevelRef.current * 12
      camera.position.z += (targetZ - camera.position.z) * 0.08

      if (zoomLevelRef.current > 0.95 && !transitionRef.current) {
        transitionRef.current = true
        setShowTransition(true)
      } else if (zoomLevelRef.current <= 0.95 && transitionRef.current) {
        transitionRef.current = false
        setShowTransition(false)
      }

      renderer.render(scene, camera)
      return animationId
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.body.style.cursor = "default"
      cancelAnimationFrame(animationId)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (!showTransition) {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
        transitionTimerRef.current = null
      }
      return
    }

    if (metaverseLaunchedRef.current) {
      return
    }

    transitionTimerRef.current = window.setTimeout(() => {
      metaverseLaunchedRef.current = true
      window.location.href = METAVERSE_APP_URL
    }, 3000)

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
        transitionTimerRef.current = null
      }
    }
  }, [showTransition])

  const infoPanel = (() => {
    if (!activeInfoKey) {
      return null
    }

    if (activeInfoKey === "news") {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">ニュース</h3>
          <p className="text-sm text-cyan-100/80">研究室の最新トピックをダイジェストでお届けします。</p>
          <div className="space-y-3">
            {LATEST_NEWS.map((news) => (
              <div key={news.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">{news.date}</p>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getNewsCategoryClass(news.category)}`}
                  >
                    {news.category}
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold text-white">{news.title}</p>
              </div>
            ))}
          </div>
          <NavLink
            to="/news"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200 hover:text-white"
          >
            ニュース一覧を見る
            <span aria-hidden>→</span>
          </NavLink>
        </div>
      )
    }

    if (activeInfoKey === "contact") {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">お問い合わせ</h3>
          <p className="text-sm text-cyan-100/80">
            共同研究のご提案から取材のご相談まで、フォームから随時受け付けています。
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CONTACT_TOPICS.map((topic) => (
              <div key={topic.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-semibold text-white">{topic.title}</p>
                <p className="text-xs text-cyan-100/80">{topic.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-cyan-100/80">
            <p>必要事項（メールアドレス／お問い合わせ内容）をご記入のうえ送信してください。順次ご返信いたします。</p>
          </div>
          <NavLink
            to="/contact"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200 hover:text-white"
          >
            お問い合わせフォームへ
            <span aria-hidden>→</span>
          </NavLink>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white">研究分野</h3>
        <p className="text-sm text-cyan-100/80">IoTからメタバース応用まで、連続するテーマを横断的に扱い、社会実装に接続しています。</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {RESEARCH_FIELDS.map((field) => (
            <div key={field.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">{field.title}</p>
              <p className="text-xs text-cyan-100/80">{field.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  })()

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-slate-950 to-indigo-950 text-white">
        <div ref={mountRef} className="absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_60%)]" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="flex flex-col gap-6 px-6 pt-10 lg:flex-row lg:items-start lg:justify-between lg:px-16">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm uppercase tracking-[0.5em] text-cyan-200/70">IoT Solutions Lab</p>
              <h1 className="text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_25px_rgba(14,165,233,0.4)] sm:text-5xl">
                Smart ICT Solutions Laboratory
              </h1>
              <p className="text-base text-cyan-100/80 sm:text-lg">
                東京電機大学のスマートICTソリューション研究室では、IoT・組込みソフトウェア・人工知能・デジタルツインなどの最先端技術を活用し、社会課題に挑む研究を行っています。
              </p>
            </div>
            <nav className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md lg:w-auto">
              <div className="flex flex-wrap items-center justify-center gap-2">
            {siteNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                <span>{item.label}</span>
                <span className="absolute inset-0 rounded-full border border-white/30 opacity-0 transition group-hover:opacity-100" />
              </NavLink>
            ))}
              </div>
            </nav>
          </header>

          <main className="mt-auto px-6 pb-12 lg:px-16">
            {activeInfoKey && (
              <div className="relative rounded-[32px] border border-white/15 bg-black/30 p-8 text-sm text-cyan-100/80 backdrop-blur">
                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-full border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10"
                  onClick={() => setActiveInfoKey(null)}
                >
                  CLOSE
                </button>
                {infoPanel}
              </div>
            )}
          </main>
        </div>

        {zoomLevel > 0 && (
          <div className="absolute right-8 top-8 z-20 rounded-2xl border border-cyan-400/40 bg-black/60 px-6 py-4 text-sm">
            <p className="text-cyan-200/80">遊園地まで</p>
            <div className="mt-2 h-2 w-48 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${zoomLevel * 100}%` }} />
            </div>
          </div>
        )}

        {showTransition && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90 text-center text-purple-700">
            <div>
              <div className="text-6xl">🎡</div>
              <p className="mt-4 text-2xl font-bold">バーチャル遊園地へ移動中...</p>
              <p className="mt-2 text-sm text-purple-500">3秒後に別のアプリに遷移します</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home


