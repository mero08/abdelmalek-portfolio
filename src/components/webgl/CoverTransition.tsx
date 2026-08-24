import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { ShaderMaterial } from 'three'
import { CoverImage } from '../CoverImage/CoverImage'
import { useWebglEnabled } from './useWebglEnabled'
import styles from './CoverTransition.module.css'

type Props = {
  cover: string | null
  title: string
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    uv.x += sin(uv.y * 24.0) * 0.003 * uProgress;

    vec4 base = texture2D(uTexture, uv);
    vec3 darkened = base.rgb * 0.58;

    gl_FragColor = vec4(mix(base.rgb, darkened, uProgress * 0.4), base.a);
  }
`

function useIsTouchDevice(): boolean {
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    setTouch(
      window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches,
    )
  }, [])

  return touch
}

function CoverPlane({
  cover,
  hovered,
  onSettled,
}: {
  cover: string
  hovered: boolean
  onSettled: () => void
}) {
  const materialRef = useRef<ShaderMaterial>(null)
  const progressRef = useRef(0)
  const textureRef = useRef<THREE.Texture | null>(null)
  const { viewport } = useThree()

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let cancelled = false

    loader.load(cover, (texture) => {
      if (cancelled) {
        texture.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      textureRef.current = texture
      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = texture
      }
    })

    return () => {
      cancelled = true
      textureRef.current?.dispose()
      textureRef.current = null
    }
  }, [cover])

  useFrame((_, delta) => {
    const target = hovered ? 1 : 0
    progressRef.current += (target - progressRef.current) * Math.min(delta * 7, 1)

    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progressRef.current
    }

    if (!hovered && progressRef.current < 0.02) {
      onSettled()
    }
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: null },
          uProgress: { value: 0 },
        }}
      />
    </mesh>
  )
}

function CoverGl({
  cover,
  hovered,
  onSettled,
}: {
  cover: string
  hovered: boolean
  onSettled: () => void
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <CoverPlane cover={cover} hovered={hovered} onSettled={onSettled} />
    </Canvas>
  )
}

export function CoverTransition({ cover, title }: Props) {
  const webglEnabled = useWebglEnabled()
  const isTouch = useIsTouchDevice()
  const [hovered, setHovered] = useState(false)
  const [glMounted, setGlMounted] = useState(false)
  const hoveredRef = useRef(false)

  const useWebglHover = Boolean(webglEnabled && !isTouch && cover)

  const handleEnter = () => {
    hoveredRef.current = true
    setHovered(true)
    if (useWebglHover) setGlMounted(true)
  }

  const handleLeave = () => {
    hoveredRef.current = false
    setHovered(false)
  }

  const handleGlSettled = () => {
    if (!hoveredRef.current) setGlMounted(false)
  }

  return (
    <div
      className={styles.root}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <CoverImage cover={cover} title={title} className={styles.cover} />
      {useWebglHover && glMounted && cover && (
        <div className={styles.gl} aria-hidden>
          <Suspense fallback={null}>
            <CoverGl cover={cover} hovered={hovered} onSettled={handleGlSettled} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
