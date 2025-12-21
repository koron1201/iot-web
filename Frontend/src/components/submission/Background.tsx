import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Cloud, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

function CameraRig({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const { camera } = useThree()
  
  useFrame((state) => {
    // マウス位置に基づいてカメラを少し動かす（パララックス効果）
    // 滑らかに補間する (Lerp)
    camera.position.x += (mouse.current[0] * 1.5 - camera.position.x) * 0.05
    camera.position.y += (-mouse.current[1] * 1.5 - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Nebula() {
  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
        <Cloud 
          opacity={0.3} 
          speed={0.4} // Rotation speed
          width={20} // Width of the full cloud
          depth={5} // Z-dir depth
          segments={5} // Number of particles
          texture={undefined} // Use default
          position={[-10, -5, -20]}
          color="#1e1b4b" // Deep Indigo
        />
        <Cloud 
          opacity={0.3} 
          speed={0.4} 
          width={20} 
          depth={5} 
          segments={5} 
          position={[10, 5, -25]}
          color="#083344" // Deep Cyan
        />
      </Float>
    </group>
  )
}

function CinematicPlanet() {
    // 惑星本体（シルエット）
    // リムライト（縁の光）を表現するためのシェーダーマテリアル
    const uniforms = useMemo(() => ({
        color1: { value: new THREE.Color('#000000') }, // Core color (black)
        color2: { value: new THREE.Color('#06b6d4') }, // Rim color (cyan)
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 2.0 },
        fresnelPower: { value: 4.0 },
    }), [])

    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPositionWorld;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float fresnelBias;
      uniform float fresnelScale;
      uniform float fresnelPower;
      varying vec3 vNormal;
      varying vec3 vPositionWorld;

      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPositionWorld);
        float fresnelTerm = dot(viewDirection, vNormal);
        fresnelTerm = clamp(1.0 - fresnelTerm, 0.0, 1.0);
        fresnelTerm = pow(fresnelTerm, fresnelPower);
        fresnelTerm = fresnelScale * fresnelTerm + fresnelBias;

        vec3 finalColor = mix(color1, color2, fresnelTerm);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    return (
        <group position={[8, 3, -15]} rotation={[0, 0, Math.PI / 4]}>
            <mesh scale={[5, 5, 5]}>
                <sphereGeometry args={[1, 64, 64]} />
                <shaderMaterial 
                    uniforms={uniforms}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* 惑星の背後のグロー */}
            <mesh position={[0, 0, -2]} scale={[6, 6, 6]}>
                 <sphereGeometry args={[1, 32, 32]} />
                 <meshBasicMaterial color="#0891b2" transparent opacity={0.1} />
            </mesh>
        </group>
    )
}

function GalaxyParticles() {
    // 背景の微細なパーティクル（動きのある星）
    const count = 500
    const mesh = useRef<THREE.Points>(null!)
    
    const [positions, sizes] = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        for(let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10 // 手前から奥へ
            sizes[i] = Math.random() < 0.1 ? 0.3 : 0.1 // たまに大きい星
        }
        return [positions, sizes]
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        // ゆっくり回転
        mesh.current.rotation.y = time * 0.02
        mesh.current.rotation.z = time * 0.01
    })

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute 
                    attach="attributes-size"
                    count={count}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.15} 
                color="#ffffff" 
                sizeAttenuation 
                transparent 
                opacity={0.8} 
                blending={THREE.AdditiveBlending} 
            />
        </points>
    )
}

export const Background: React.FC = () => {
  const mouse = useRef<[number, number]>([0, 0])

  const handleMouseMove = (e: React.MouseEvent) => {
    mouse.current = [
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    ]
  }

  return (
    <div className="fixed inset-0 z-0 bg-black" onMouseMove={handleMouseMove}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
      >
        <color attach="background" args={['#000000']} />
        
        {/* 環境光は暗めに */}
        <ambientLight intensity={0.2} />

        <Suspense fallback={null}>
          <GalaxyParticles />
          
          {/* 遠くの星空 (drei) */}
          <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
          
          {/* 雲/ガス (drei) */}
          <Nebula />
          
          {/* 手前のキラキラ (drei) */}
          <Sparkles count={50} scale={12} size={2} speed={0.4} opacity={0.5} color="#22d3ee" />

          {/* 高級感のある惑星オブジェクト */}
          <CinematicPlanet />
        </Suspense>

        {/* カメラ制御 */}
        <CameraRig mouse={mouse} />
      </Canvas>

      {/* ヴィネット効果（画面端を暗くする） - Canvasの上に乗せる */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      {/* 走査線風の極薄いオーバーレイ */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" style={{ backgroundSize: "100% 2px, 3px 100%" }} />
    </div>
  )
}
