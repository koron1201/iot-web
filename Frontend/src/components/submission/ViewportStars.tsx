import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export const ViewportStars: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = 18

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    mount.appendChild(renderer.domElement)

    const resize = () => {
      const width = mount.clientWidth || 1
      const height = mount.clientHeight || 1
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 2000
    const starVertices = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i += 1) {
      starVertices[i * 3] = (Math.random() - 0.5) * 200
      starVertices[i * 3 + 1] = (Math.random() - 0.5) * 200
      starVertices[i * 3 + 2] = -Math.random() * 200
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starVertices, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      opacity: 0.9,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    const createPlanet = (radius: number, color: number, position: THREE.Vector3) => {
      const geometry = new THREE.SphereGeometry(radius, 64, 64)
      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.2,
        roughness: 0.4,
        emissive: color,
        emissiveIntensity: 0.25,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(position)
      scene.add(mesh)
      return mesh
    }

    const primary = createPlanet(3.8, 0x80d8ff, new THREE.Vector3(-5, 1.2, -30))
    const secondary = createPlanet(2.3, 0xffcf7d, new THREE.Vector3(6, -2, -24))
    const moon = createPlanet(1.4, 0xd79bff, new THREE.Vector3(0.5, 3.5, -18))

    const ringGeometry = new THREE.RingGeometry(4.1, 5.2, 128)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ae6ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2.5
    ring.position.copy(primary.position)
    scene.add(ring)

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const keyLight = new THREE.PointLight(0xa0e5ff, 1.2, 120)
    keyLight.position.set(12, 14, 4)
    scene.add(keyLight)
    const rimLight = new THREE.PointLight(0xffc58f, 0.8, 80)
    rimLight.position.set(-12, -8, 6)
    scene.add(rimLight)

    let time = 0
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      time += 0.005
      stars.rotation.y += 0.0003
      stars.rotation.x = Math.sin(time * 0.1) * 0.02

      primary.rotation.y += 0.0008
      secondary.rotation.y += 0.0012
      moon.rotation.y += 0.0015
      moon.position.x = Math.sin(time * 0.8) * 1.5 + 0.5
      moon.position.y = Math.cos(time * 0.8) * 1.2 + 3.2

      ring.rotation.z += 0.0006

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => resize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [])

  return <div ref={mountRef} className="pointer-events-none absolute inset-0" />
}

export default ViewportStars

