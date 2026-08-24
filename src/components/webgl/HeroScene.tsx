import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { ShaderMaterial } from 'three'

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
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
    vec3 glow = vec3(1.0, 0.30, 0.18) * 0.08;

    vec3 color = mix(dark, lift, blend * 0.45);
    color += glow * pow(blend, 2.0) * 0.55;

    float vig = 1.0 - length(uv - 0.5) * 0.75;
    color *= vig;

    gl_FragColor = vec4(color, 1.0);
  }
`

function AtmospherePlane() {
  const materialRef = useRef<ShaderMaterial>(null)
  const { viewport } = useThree()

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  )
}

function HeroCanvas() {
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  )

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      frameloop={hidden ? 'never' : 'always'}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
      }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <AtmospherePlane />
    </Canvas>
  )
}

export function HeroScene() {
  return <HeroCanvas />
}
