import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { type ShaderMaterial } from 'three'
import { useWebglEnabled } from './useWebglEnabled'
import styles from './SiteAtmosphere.module.css'
import {
  useAtmosphereDriver,
  type AtmosphereState,
} from './useAtmosphereDriver'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollVel;
  uniform float uMood;
  uniform float uEnter;
  uniform float uHeroCover;
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
    float n = noise(uv * 2.4 + uTime * 0.03);
    float n2 = noise(uv * 4.5 - uTime * 0.02 + 8.0);
    float fog = (n + n2) * 0.5;

    vec3 dark = vec3(0.051, 0.051, 0.051);
    vec3 lift = vec3(0.09, 0.085, 0.08);
    vec3 warm = vec3(1.0, 0.32, 0.18);

    float moodLift = 0.04 + uMood * 0.06;
    vec3 color = mix(dark, lift, fog * (0.35 + moodLift));

    float dist = distance(uv, uMouse);
    float glow = smoothstep(0.55, 0.0, dist) * (0.045 + uMood * 0.02);
    color += warm * glow;

    float breath = uScrollVel * 0.04;
    color += lift * breath;

    float enter = uEnter * uEnter;
    color += warm * enter * 0.18;
    color += vec3(0.1, 0.09, 0.08) * enter * 0.28;

    float grain = (hash(uv * vec2(1400.0, 900.0) + uTime) - 0.5) * 0.035;
    color += grain;

    float vig = 1.0 - length(uv - 0.5) * 0.55;
    color *= vig;

    float visible = 1.0 - smoothstep(0.15, 0.85, uHeroCover);
    color = mix(dark, color, visible);

    gl_FragColor = vec4(color, 1.0);
  }
`

function AtmospherePlane({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  const materialRef = useRef<ShaderMaterial>(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] as [number, number] },
      uScrollVel: { value: 0 },
      uMood: { value: 0.4 },
      uEnter: { value: 0 },
      uHeroCover: { value: 1 },
    }),
    [],
  )

  useFrame((state) => {
    const mat = materialRef.current
    const s = stateRef.current
    if (!mat || !s) return
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uMouse.value = [s.mouseX, 1 - s.mouseY]
    mat.uniforms.uScrollVel.value = s.scrollVel
    mat.uniforms.uMood.value = s.mood
    mat.uniforms.uEnter.value = s.enter
    mat.uniforms.uHeroCover.value = s.heroCover
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

function AtmosphereCanvas({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  )

  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <Canvas
      className={styles.canvas}
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      frameloop={hidden ? 'never' : 'always'}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <AtmospherePlane stateRef={stateRef} />
    </Canvas>
  )
}

export function SiteAtmosphere() {
  const webgl = useWebglEnabled()
  const stateRef = useAtmosphereDriver()

  if (!webgl) {
    return (
      <div
        className={styles.root}
        data-testid="site-atmosphere"
        data-mode="fallback"
        aria-hidden
      >
        <div className={styles.fallback} />
      </div>
    )
  }

  return (
    <div
      className={styles.root}
      data-testid="site-atmosphere"
      data-mode="webgl"
      aria-hidden
    >
      <Suspense fallback={<div className={styles.fallback} />}>
        <AtmosphereCanvas stateRef={stateRef} />
      </Suspense>
    </div>
  )
}
