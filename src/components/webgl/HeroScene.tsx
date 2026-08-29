import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  TextureLoader,
  type ShaderMaterial,
  type Texture,
} from 'three'
import { HERO_CINEMA_SRC } from '../../sections/Hero/heroMedia'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform sampler2D uMap;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float n = noise(uv * 3.0 + uTime * 0.04);
    float n2 = noise(uv * 5.0 - uTime * 0.025 + 10.0);
    float blend = (n + n2) * 0.5;

    vec3 dark = vec3(0.051, 0.051, 0.051);
    vec3 lift = vec3(0.094, 0.094, 0.094);
    vec3 glow = vec3(1.0, 0.30, 0.18) * 0.10;
    vec3 atmos = mix(dark, lift, blend * 0.45);
    atmos += glow * pow(blend, 2.0) * 0.55;

    float zoom = 1.0 - uProgress * 0.12;
    vec2 cuv = (uv - 0.5) * zoom + 0.5;
    cuv += vec2(
      sin(uTime * 0.05) * 0.004,
      cos(uTime * 0.04) * 0.003
    ) * (1.0 - uProgress * 0.5);

    vec3 cinema = texture2D(uMap, cuv).rgb;
    cinema *= vec3(0.72, 0.68, 0.62);
    cinema = mix(cinema, cinema * vec3(1.05, 0.95, 0.88), 0.25);
    cinema += glow * 0.35 * smoothstep(0.2, 0.9, uProgress);

    float grain = (hash(uv * vec2(1200.0, 800.0) + uTime) - 0.5) * 0.045;
    cinema += grain;
    atmos += grain * 0.5;

    float wipe = smoothstep(0.02, 0.78, uProgress);
    float edge = noise(uv * 2.4 + uTime * 0.02) * 0.18;
    float reveal = smoothstep(wipe - 0.25, wipe + 0.12, (1.0 - uv.y) * 0.55 + uv.x * 0.15 + 0.35 + edge);

    vec3 color = mix(atmos, cinema, reveal);
    float vig = 1.0 - length(uv - 0.5) * mix(0.75, 0.95, uProgress);
    color *= vig;
    color *= mix(1.0, 0.92, uProgress);

    gl_FragColor = vec4(color, 1.0);
  }
`

type AtmosphereProps = {
  progressRef: RefObject<number>
  texture: Texture
}

function AtmospherePlane({ progressRef, texture }: AtmosphereProps) {
  const materialRef = useRef<ShaderMaterial>(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMap: { value: texture },
    }),
    [texture],
  )

  useFrame((state) => {
    const mat = materialRef.current
    if (!mat) return
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uProgress.value = progressRef.current ?? 0
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

type HeroCanvasProps = {
  progressRef: RefObject<number>
}

function HeroCanvas({ progressRef }: HeroCanvasProps) {
  const texture = useLoader(TextureLoader, HERO_CINEMA_SRC)
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  )
  const [animating, setAnimating] = useState(true)

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    const tick = () => {
      setAnimating((progressRef.current ?? 0) < 0.97)
    }
    tick()
    const id = window.setInterval(tick, 350)
    return () => window.clearInterval(id)
  }, [progressRef])

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      frameloop={hidden || !animating ? 'never' : 'always'}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <AtmospherePlane progressRef={progressRef} texture={texture} />
    </Canvas>
  )
}

export function HeroScene({ progressRef }: HeroCanvasProps) {
  return <HeroCanvas progressRef={progressRef} />
}
