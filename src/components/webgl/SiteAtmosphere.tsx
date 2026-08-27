import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Color, MathUtils, type ShaderMaterial } from 'three'
import { EditorWorld } from './EditorWorld'
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
    color += warm * enter * 0.2;
    color += vec3(0.1, 0.09, 0.08) * enter * 0.3;

    float grain = (hash(uv * vec2(1400.0, 900.0) + uTime) - 0.5) * 0.035;
    color += grain;

    float vig = 1.0 - length(uv - 0.5) * 0.55;
    color *= vig;

    float visible = 1.0 - smoothstep(0.15, 0.85, uHeroCover);
    color = mix(dark, color, visible);

    gl_FragColor = vec4(color, 1.0);
  }
`

function AtmosphereBackdrop({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  const materialRef = useRef<ShaderMaterial>(null)

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
    <mesh position={[0, 0, -12]} scale={[28, 18, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

function StageCamera({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  const { camera } = useThree()

  useFrame(() => {
    const s = stateRef.current
    if (!s) return
    const st = s.stage
    const mx = (s.mouseX - 0.5) * 0.45
    const my = (s.mouseY - 0.5) * 0.3
    const heroHide = MathUtils.smoothstep(s.heroCover, 0.15, 0.9)

    const tx = st.camX + mx * (1 - heroHide * 0.7)
    const ty = st.camY - my * (1 - heroHide * 0.7)
    const tz = st.camZ + heroHide * 2.5

    camera.position.x = MathUtils.lerp(camera.position.x, tx, 0.07)
    camera.position.y = MathUtils.lerp(camera.position.y, ty, 0.07)
    camera.position.z = MathUtils.lerp(camera.position.z, tz, 0.07)
    camera.lookAt(st.lookX, st.lookY, st.lookZ)
  })

  return null
}

function AtmosphereScene({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  return (
    <>
      <color attach="background" args={['#0d0d0d']} />
      <fog attach="fog" args={[new Color('#0d0d0d'), 8, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={0.55} color="#e8e0d4" />
      <StageCamera stateRef={stateRef} />
      <AtmosphereBackdrop stateRef={stateRef} />
      <EditorWorld stateRef={stateRef} />
    </>
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
      camera={{ position: [0.2, 0.1, 6.5], fov: 42, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      frameloop={hidden ? 'never' : 'always'}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <AtmosphereScene stateRef={stateRef} />
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
