import React, { useEffect, useRef } from "react"
import * as THREE from "three"

const STAR_COUNT = 1400

export const SpaceHangarBackdrop: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const mount = viewportRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = 14

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const setRendererSize = () => {
      const { clientWidth, clientHeight } = mount
      if (clientWidth === 0 || clientHeight === 0) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
      renderer.setSize(clientWidth, clientHeight)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }
    setRendererSize()

    const starsGeometry = new THREE.BufferGeometry()
    const starVertices: number[] = []
    for (let i = 0; i < STAR_COUNT; i += 1) {
      starVertices.push((Math.random() - 0.5) * 250)
      starVertices.push((Math.random() - 0.5) * 250)
      starVertices.push((Math.random() - 0.5) * 250)
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    const planets: THREE.Mesh[] = []
    const createPlanet = (radius: number, color: number, position: THREE.Vector3) => {
      const geometry = new THREE.SphereGeometry(radius, 48, 48)
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2,
        roughness: 0.45,
        metalness: 0.1,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(position)
      scene.add(mesh)
      planets.push(mesh)
    }

    createPlanet(2.2, 0x6ab9ff, new THREE.Vector3(-3.5, 1.4, -6))
    createPlanet(1.5, 0xffc46b, new THREE.Vector3(3.8, -0.8, -4))
    createPlanet(0.9, 0xd66bff, new THREE.Vector3(0.5, 2.8, -3.5))

    const planetHalos: THREE.Mesh[] = planets.map((planet) => {
      const geometry = planet.geometry as THREE.SphereGeometry
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(geometry.parameters.radius * 1.2, geometry.parameters.radius * 1.5, 64),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        }),
      )
      halo.position.copy(planet.position)
      halo.rotation.x = Math.PI / 3
      scene.add(halo)
      return halo
    })

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const keyLight = new THREE.DirectionalLight(0x99ccff, 0.8)
    keyLight.position.set(6, 8, 10)
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0x88ddff, 0.7, 40)
    fillLight.position.set(-4, -6, 6)
    scene.add(fillLight)

    let time = 0
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      time += 0.005

      stars.rotation.y += 0.0004
      planets.forEach((planet, index) => {
        planet.rotation.y += 0.002 + index * 0.001
        planet.position.y += Math.sin(time * (1.2 + index * 0.3)) * 0.002
      })
      planetHalos.forEach((halo, index) => {
        halo.rotation.z += 0.001 + index * 0.0005
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      setRendererSize()
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(mount)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [])

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#020414]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#03081a] via-[#050c21] to-[#040413]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(45,129,255,0.25), transparent 50%), radial-gradient(circle at 80% 8%, rgba(134,96,255,0.3), transparent 50%)",
        }}
      />

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[18%] bg-gradient-to-r from-white/8 via-white/3 to-transparent lg:block">
        <div className="absolute inset-y-10 left-6 w-1 rounded-full bg-white/20" />
        <div className="absolute inset-y-24 left-12 w-1 rounded-full bg-cyan-200/30" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[18%] bg-gradient-to-l from-white/8 via-white/3 to-transparent lg:block">
        <div className="absolute inset-y-16 right-6 w-1 rounded-full bg-white/20" />
        <div className="absolute inset-y-28 right-12 w-1 rounded-full bg-cyan-200/30" />
      </div>

      <div className="pointer-events-none absolute inset-x-14 top-0 h-48 rounded-b-[80px] border border-white/15 bg-gradient-to-b from-white/15 via-white/5 to-transparent backdrop-blur-sm shadow-[0_20px_80px_rgba(0,0,0,0.4)]" />
      <div className="pointer-events-none absolute inset-x-24 top-40 h-10 rounded-full border border-white/20 bg-gradient-to-r from-cyan-200/30 via-white/40 to-cyan-200/30 blur-md" />
      <div className="pointer-events-none absolute inset-x-10 bottom-0 h-56 rounded-t-[100px] border border-white/10 bg-gradient-to-t from-black/70 via-black/30 to-transparent backdrop-blur-md" />

      <div className="absolute inset-x-0 top-14 flex justify-center px-4 sm:px-10">
        <div className="relative w-full max-w-6xl">
          <div className="pointer-events-none absolute inset-[-160px] rounded-[240px] bg-cyan-600/25 blur-[120px]" />
          <div className="relative rounded-[60px] border border-white/12 bg-white/4/30 px-4 pb-16 pt-16 backdrop-blur-2xl sm:px-10">
            <div className="absolute inset-x-12 top-8 h-2 rounded-full bg-gradient-to-r from-white/60 via-cyan-200/60 to-white/60 opacity-80" />
            <div className="absolute inset-x-20 bottom-16 h-16 rounded-full border border-white/12 bg-gradient-to-b from-transparent to-white/10 blur-lg" />

            <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-4">
              <div className="relative aspect-square w-full max-w-[460px]">
                <div className="absolute inset-0 rounded-full border-[10px] border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.55)]" />
                <div className="absolute inset-4 rounded-full border border-white/25 bg-gradient-to-b from-white/20 to-white/5 shadow-[inset_0_0_55px_rgba(255,255,255,0.4)]" />
                <div className="absolute inset-6 rounded-full border border-cyan-200/40 blur-lg" />
                <div
                  ref={viewportRef}
                  className="absolute inset-[44px] rounded-full border border-white/12 bg-black/90 shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
                />
                <div className="absolute inset-14 rounded-full border border-white/8 shadow-[inset_0_0_35px_rgba(255,255,255,0.35)]" />
                <div className="absolute inset-0 rounded-full border border-white/12 opacity-80" />
                <div className="absolute inset-x-[25%] bottom-6 h-1.5 rounded-full bg-cyan-200/80 blur-md" />
                <div className="absolute inset-20 rounded-full border border-white/10" />
              </div>

              <div className="grid w-full grid-cols-2 gap-4 text-[11px] uppercase tracking-[0.35em] text-cyan-100/60 md:grid-cols-4">
                {["PRESSURIZE", "AUX-PWR", "ORBITAL", "STANDBY"].map((label) => (
                  <div
                    key={label}
                    className="rounded-full border border-white/15 bg-gradient-to-b from-black/50 to-black/20 px-4 py-2 text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-10">
        <div className="h-28 w-[92%] max-w-5xl rounded-[50%] border border-cyan-300/20 bg-gradient-to-r from-white/10 via-cyan-200/20 to-white/10 blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]" />
        <div className="h-3 w-2/3 max-w-2xl rounded-full bg-gradient-to-r from-cyan-300/40 via-white/50 to-cyan-300/40 opacity-80" />
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.45em] text-cyan-100/50">
          <span>DECK</span>
          <span>02</span>
          <span>AIRLOCK</span>
        </div>
      </div>
    </div>
  )
}

export default SpaceHangarBackdrop

