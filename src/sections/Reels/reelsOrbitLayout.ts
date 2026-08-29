import { REELS_ORBIT } from './reelsOrbitConfig'

export type OrbitPhoneLayout = {
  index: number
  isCenter: boolean
  opacity: number
  blurPx: number
  zIndex: number
  transform: string
}

export function slotAngle(index: number, count: number): number {
  return index * (360 / count)
}

export function wrapAngle(angle: number): number {
  return ((angle % 360) + 360) % 360
}

export function shortestAngleDelta(from: number, to: number): number {
  let delta = to - from
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function positionOnRing(thetaDeg: number): { x: number; z: number } {
  const theta = (thetaDeg * Math.PI) / 180
  return {
    x: Math.sin(theta) * REELS_ORBIT.RADIUS,
    z: Math.cos(theta) * REELS_ORBIT.RADIUS,
  }
}

export function nearestFrontIndex(angle: number, count: number): number {
  let best = 0
  let bestZ = -Infinity
  for (let i = 0; i < count; i += 1) {
    const { z } = positionOnRing(angle + slotAngle(i, count))
    if (z > bestZ) {
      bestZ = z
      best = i
    }
  }
  return best
}

export function angleForFrontIndex(index: number, count: number): number {
  return wrapAngle(0 - slotAngle(index, count))
}

export function computePhoneLayouts(
  angle: number,
  count: number,
): OrbitPhoneLayout[] {
  const active = nearestFrontIndex(angle, count)
  const layouts: OrbitPhoneLayout[] = []

  for (let i = 0; i < count; i += 1) {
    const { x, z } = positionOnRing(angle + slotAngle(i, count))
    const depth = (z + REELS_ORBIT.RADIUS) / (2 * REELS_ORBIT.RADIUS)
    const isCenter = i === active
    const scale = isCenter ? 1 : 0.48 + depth * 0.4
    const opacity = isCenter ? 1 : 0.25 + depth * 0.62
    const blurPx = isCenter ? 0 : (1 - depth) * 1.3
    const yTilt = Math.sin(((angle + slotAngle(i, count)) * Math.PI) / 180) * -18
    const lift = isCenter ? -4 : (1 - depth) * 4
    const zBoost = isCenter ? REELS_ORBIT.FOCUS_Z_BOOST : 0

    layouts.push({
      index: i,
      isCenter,
      opacity,
      blurPx: blurPx > 0.15 ? blurPx : 0,
      zIndex: isCenter ? 40 : Math.round(depth * 20),
      transform: `translate3d(${x}px, ${lift}px, ${z + zBoost}px) rotateY(${yTilt}deg) scale(${scale})`,
    })
  }

  return layouts
}
