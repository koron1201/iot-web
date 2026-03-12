import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

type CosmicBackdropProps = {
  showStars?: boolean
}

const STAR_COUNT = 1500
const SATELLITE_COLORS = [0xff6b9d, 0x6bffb9, 0xffd96b]

export const CosmicBackdrop: React.FC<CosmicBackdropProps> = ({ showStars = true }) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const planetModelRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000)
    camera.position.z = 15

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    const setRendererSize = () => {
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.3))
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    renderer.domElement.style.pointerEvents = "none"
    setRendererSize()
    container.appendChild(renderer.domElement)

    let stars: THREE.Points | null = null
    if (showStars) {
      const starsGeometry = new THREE.BufferGeometry()
      const starVertices: number[] = []
      for (let i = 0; i < STAR_COUNT; i += 1) {
        starVertices.push((Math.random() - 0.5) * 2000)
        starVertices.push((Math.random() - 0.5) * 2000)
        starVertices.push((Math.random() - 0.5) * 2000)
      }
      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.35,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      })
      stars = new THREE.Points(starsGeometry, starsMaterial)
      scene.add(stars)
    }

    const loader = new GLTFLoader()
    loader.load(
      "/face.glb",
      (gltf: GLTF) => {
        planetModelRef.current = gltf.scene
        planetModelRef.current.scale.set(0.7, 0.7, 0.7)
        planetModelRef.current.position.set(0, 0, 0)
        planetModelRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = false
            child.receiveShadow = false
          }
        })
        scene.add(planetModelRef.current)
      },
      undefined,
      (error) => {
        console.error("Failed to load face.glb", error)
      },
    )

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(3.3, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      }),
    )
    scene.add(glow)

    const satellites: Array<{
      mesh: THREE.Mesh
      glow: THREE.Mesh
      offset: number
      radius: number
    }> = []
    SATELLITE_COLORS.forEach((color, index) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 32, 32),
        new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.4,
        }),
      )
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
      })
      const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), glowMaterial)
      scene.add(mesh)
      scene.add(glowMesh)
      satellites.push({
        mesh,
        glow: glowMesh,
        offset: index * (Math.PI * 0.9),
        radius: 8 + index * 1.2,
      })
    })

    scene.add(new THREE.AmbientLight(0x404040, 1))
    const pointLight = new THREE.PointLight(0xffffff, 1.4, 100)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)
    const cyanLight = new THREE.PointLight(0x00ffff, 0.45, 80)
    cyanLight.position.set(-8, -6, 5)
    scene.add(cyanLight)

    let time = 0
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      time += 0.01

      if (stars) stars.rotation.y += 0.0001
      if (planetModelRef.current) planetModelRef.current.rotation.y += 0.002
      glow.rotation.y -= 0.0008

      satellites.forEach((satellite, index) => {
        const angle = time * 0.25 + satellite.offset
        const yOffset = Math.sin(time * 0.8 + index) * 1.5
        satellite.mesh.position.set(
          Math.cos(angle) * satellite.radius,
          yOffset,
          Math.sin(angle) * satellite.radius,
        )
        satellite.glow.position.copy(satellite.mesh.position)
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      setRendererSize()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [showStars])

  return <div ref={mountRef} className="pointer-events-none absolute inset-0 -z-10" />
}

export default CosmicBackdrop

