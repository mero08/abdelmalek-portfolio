import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'
import { useWebglEnabled } from '../webgl/useWebglEnabled'
import styles from './Threads.module.css'

const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/** Fewer lines + mediump: same look, less GPU work per frame. */
const FRAGMENT_SHADER = /* glsl */ `
precision mediump float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
#define PI 3.1415926538
const int u_line_count = 28;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
    * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
    * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
  return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
  float split_offset = (perc * 0.4);
  float split_point = 0.1 + split_offset;
  float amplitude_normal = smoothstep(split_point, 0.7, st.x);
  float amplitude_strength = 0.5;
  float finalAmplitude = amplitude_normal * amplitude_strength
    * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);
  float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
  float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
    Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
    st.x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;
  float line_start = smoothstep(
    y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
    y,
    st.y
  );
  float line_end = smoothstep(
    y,
    y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
    st.y
  );
  return clamp(
    (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
    0.0,
    1.0
  );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float line_strength = 1.0;
  for (int i = 0; i < u_line_count; i++) {
    float p = float(i) / float(u_line_count);
    line_strength *= (1.0 - lineFn(
      uv,
      u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
      p,
      (PI * 1.0) * p,
      uMouse,
      iTime,
      uAmplitude,
      uDistance
    ));
  }
  float colorVal = 1.0 - line_strength;
  fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

/** Site accent #ff4d2e as RGB 0–1 */
export const THREADS_COLOR: [number, number, number] = [1, 0.302, 0.18]

const MAX_DPR = 1.25
const MAX_RENDER_DIM = 1440
const HERO_PAUSE = 0.98

type Props = {
  color?: [number, number, number]
  amplitude?: number
  distance?: number
  /** Keep false for ambient lines only (no pointer warp). */
  enableMouseInteraction?: boolean
  /** Fade out while #hero is in view (home page). */
  hideOverHero?: boolean
}

/**
 * Site-wide Web Threads background (reactbits / OGL).
 * Ambient only — mouse interaction off by default.
 */
export function Threads({
  color = THREADS_COLOR,
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  hideOverHero = false,
}: Props) {
  const webgl = useWebglEnabled()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!webgl || !container) return

    let renderer: Renderer
    try {
      renderer = new Renderer({
        alpha: true,
        dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
        powerPreference: 'low-power',
      })
    } catch {
      return
    }
    const gl = renderer.gl
    if (!gl) return

    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    container.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / Math.max(gl.canvas.height, 1),
          ),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const currentMouse = [0.5, 0.5]
    let targetMouse = [0.5, 0.5]
    let heroEl: HTMLElement | null = hideOverHero
      ? document.getElementById('hero')
      : null
    let heroCover = hideOverHero ? 1 : 0
    let lastOpacity = hideOverHero ? 0 : 1
    let isVisible = true
    let destroyed = false
    let raf = 0
    let running = false

    const resize = () => {
      const { clientWidth, clientHeight } = container
      const baseDpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const longest = Math.max(clientWidth, clientHeight) * baseDpr
      renderer.dpr =
        longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr
      renderer.setSize(clientWidth, clientHeight)
      program.uniforms.iResolution.value.r = gl.canvas.width
      program.uniforms.iResolution.value.g = gl.canvas.height
      program.uniforms.iResolution.value.b =
        gl.canvas.width / Math.max(gl.canvas.height, 1)
    }

    const applyOpacity = (opacity: number) => {
      if (Math.abs(opacity - lastOpacity) < 0.01) return
      lastOpacity = opacity
      container.style.opacity = String(opacity)
    }

    const syncHeroCover = () => {
      if (!hideOverHero) {
        heroCover = 0
        return
      }
      if (!heroEl || !heroEl.isConnected) {
        heroEl = document.getElementById('hero')
      }
      if (!heroEl) {
        heroCover = 0
        return
      }
      const rect = heroEl.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const visible =
        Math.min(Math.max(rect.bottom, 0), vh) -
        Math.min(Math.max(rect.top, 0), vh)
      heroCover = Math.min(1, Math.max(0, visible / vh))
    }

    const onPointerMove = (e: MouseEvent) => {
      if (!enableMouseInteraction) return
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1)
      const y = 1 - (e.clientY - rect.top) / Math.max(rect.height, 1)
      targetMouse = [x, y]
    }

    const stopLoop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
      running = false
    }

    const update = (t: number) => {
      if (destroyed) return
      raf = requestAnimationFrame(update)

      if (!isVisible || document.hidden) return

      const opacity = 1 - heroCover
      applyOpacity(opacity)

      // Fully under hero: park the GPU until scroll wakes us
      if (opacity < 1 - HERO_PAUSE) {
        stopLoop()
        return
      }

      if (enableMouseInteraction) {
        const smoothing = 0.05
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0])
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1])
        program.uniforms.uMouse.value[0] = currentMouse[0]
        program.uniforms.uMouse.value[1] = currentMouse[1]
      }

      program.uniforms.iTime.value = t * 0.001
      renderer.render({ scene: mesh })
    }

    const startLoop = () => {
      if (destroyed || running) return
      running = true
      raf = requestAnimationFrame(update)
    }

    const onScroll = () => {
      syncHeroCover()
      const opacity = 1 - heroCover
      applyOpacity(opacity)
      if (opacity >= 1 - HERO_PAUSE && isVisible && !document.hidden) {
        startLoop()
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        stopLoop()
        return
      }
      syncHeroCover()
      if (1 - heroCover >= 1 - HERO_PAUSE && isVisible) startLoop()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    if (enableMouseInteraction) {
      window.addEventListener('mousemove', onPointerMove, { passive: true })
    }
    resize()
    syncHeroCover()
    applyOpacity(1 - heroCover)

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true
        if (!isVisible) {
          stopLoop()
          return
        }
        syncHeroCover()
        if (1 - heroCover >= 1 - HERO_PAUSE) startLoop()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(container)

    if (1 - heroCover >= 1 - HERO_PAUSE) startLoop()

    return () => {
      destroyed = true
      stopLoop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', onPointerMove)
      }
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas)
      }
      geometry.remove()
      program.remove()
    }
  }, [webgl, color, amplitude, distance, enableMouseInteraction, hideOverHero])

  if (!webgl) return null

  return (
    <div
      ref={containerRef}
      className={styles.root}
      data-testid="threads-bg"
      data-mouse={enableMouseInteraction ? 'on' : 'off'}
      data-hide-over-hero={hideOverHero ? 'true' : undefined}
      style={hideOverHero ? { opacity: 0 } : undefined}
      aria-hidden
    />
  )
}
