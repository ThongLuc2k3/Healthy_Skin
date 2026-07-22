import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ScanSphere() {
  const group = useRef(null)
  const inner = useRef(null)
  const wire = useRef(null)

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.18
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.1
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.018
      inner.current.scale.setScalar(s)
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.05
      wire.current.rotation.x += delta * 0.02
    }
  })

  return (
    <group ref={group}>
      {/* Translucent Solid Core */}
      <mesh ref={inner} scale={1.25}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#0a1a2e"
          transparent
          opacity={0.24}
          roughness={0.2}
          metalness={0.85}
          emissive="#0b3b4a"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Wireframe Topology Mesh */}
      <mesh ref={wire} scale={1.75}>
        <icosahedronGeometry args={[1, 6]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Outer Wireframe Mesh */}
      <mesh scale={2.05}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.14} />
      </mesh>

      {/* Outer Glow Shell */}
      <mesh scale={1.85}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function ParticleHalo({ count = 1600 }) {
  const ref = useRef(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04
      ref.current.rotation.x += delta * 0.012
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#67e8f9"
        size={0.038}
        sizeAttenuation
        depthWrite={false}
        opacity={0.82}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3.5, 3.5, 4.5]} intensity={2.5} color="#22d3ee" />
      <pointLight position={[-4.5, -2.5, 2.5]} intensity={1.6} color="#3b82f6" />
      <pointLight position={[0, 0, -3.5]} intensity={1.2} color="#67e8f9" />

      <group position={[0, 0, 0]}>
        <ScanSphere />
        <ParticleHalo />
      </group>
    </Canvas>
  )
}
