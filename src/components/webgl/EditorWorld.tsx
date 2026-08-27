import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import {
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  type InstancedMesh,
  Object3D,
} from 'three'
import { frameCountForViewport } from './atmosphereConfig'
import type { AtmosphereState } from './useAtmosphereDriver'

const dummy = new Object3D()
const accent = new Color('#ff4d2e')
const metal = new Color('#1a1816')
const frameCol = new Color('#2a2622')

type Props = {
  stateRef: RefObject<AtmosphereState>
}

export function EditorWorld({ stateRef }: Props) {
  const rootRef = useRef<Group>(null)
  const reelRef = useRef<Group>(null)
  const framesRef = useRef<InstancedMesh>(null)
  const irisRef = useRef<Mesh>(null)
  const spinRef = useRef(0)

  const count = useMemo(
    () =>
      typeof window !== 'undefined' ? frameCountForViewport(window.innerWidth) : 14,
    [],
  )

  useFrame((_, delta) => {
    const s = stateRef.current
    const root = rootRef.current
    const reel = reelRef.current
    const frames = framesRef.current
    const iris = irisRef.current
    if (!s || !root || !reel) return

    const visible = 1 - MathUtils.smoothstep(s.heroCover, 0.2, 0.9)
    root.visible = visible > 0.02
    if (!root.visible) return

    const st = s.stage
    const mx = (s.mouseX - 0.5) * 0.35
    const my = (s.mouseY - 0.5) * 0.25

    root.position.x = MathUtils.lerp(root.position.x, st.reelX + mx * 0.15, 0.08)
    root.position.y = MathUtils.lerp(root.position.y, st.reelY - my * 0.12, 0.08)
    root.position.z = MathUtils.lerp(root.position.z, st.reelZ, 0.08)
    root.rotation.x = MathUtils.lerp(root.rotation.x, st.reelRotX + my * 0.08, 0.08)
    root.rotation.z = MathUtils.lerp(root.rotation.z, st.reelRotZ - mx * 0.1, 0.08)
    root.scale.setScalar(MathUtils.lerp(root.scale.x, 0.85 + visible * 0.2, 0.1))

    const spinBoost = st.spin + s.scrollVel * 0.35 + s.enter * 0.45
    spinRef.current += delta * (0.15 + spinBoost)
    reel.rotation.z = spinRef.current

    if (iris) {
      const open = 0.92 + st.frameSpread * 0.18 + s.enter * 0.08
      iris.scale.setScalar(MathUtils.lerp(iris.scale.x, open, 0.1))
      const mat = iris.material as { emissiveIntensity?: number }
      if (mat.emissiveIntensity != null) {
        mat.emissiveIntensity = 0.35 + st.rim * 0.55 + s.enter * 0.8
      }
    }

    if (frames) {
      const radius = 1.55 * st.frameSpread
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2
        dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0)
        dummy.rotation.set(0, 0, a + Math.PI / 2)
        dummy.scale.set(0.42, 0.28, 0.04)
        dummy.updateMatrix()
        frames.setMatrixAt(i, dummy.matrix)
      }
      frames.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={rootRef}>
      {/* Hub */}
      <mesh castShadow={false}>
        <cylinderGeometry args={[0.55, 0.55, 0.22, 48]} />
        <meshStandardMaterial
          color={metal}
          metalness={0.85}
          roughness={0.35}
          envMapIntensity={0.4}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.06, 16, 64]} />
        <meshStandardMaterial color={metal} metalness={0.9} roughness={0.28} />
      </mesh>

      {/* Spokes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.35, Math.sin(a) * 0.35, 0]}
            rotation={[0, 0, a]}
          >
            <boxGeometry args={[0.55, 0.05, 0.08]} />
            <meshStandardMaterial color="#121010" metalness={0.7} roughness={0.4} />
          </mesh>
        )
      })}

      {/* Spinning frame ring */}
      <group ref={reelRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.55, 0.045, 12, 96]} />
          <meshStandardMaterial color="#161412" metalness={0.75} roughness={0.4} />
        </mesh>
        <instancedMesh ref={framesRef} args={[undefined, undefined, count]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={frameCol}
            metalness={0.25}
            roughness={0.55}
            emissive={accent}
            emissiveIntensity={0.12}
          />
        </instancedMesh>
      </group>

      {/* Aperture / iris */}
      <mesh ref={irisRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.05, 0.035, 12, 100]} />
        <meshStandardMaterial
          color="#0d0d0d"
          emissive={accent}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
          side={DoubleSide}
        />
      </mesh>

      {/* Soft accent fill */}
      <pointLight
        color={accent}
        intensity={2.4}
        distance={10}
        position={[0.6, 0.8, 2.4]}
      />
      <pointLight
        color="#b7ab98"
        intensity={0.55}
        distance={9}
        position={[-1.2, -0.4, 2]}
      />
    </group>
  )
}
