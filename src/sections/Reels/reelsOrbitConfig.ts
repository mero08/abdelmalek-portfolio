/** Locked v5 elevated-dial parameters — do not drift without spec update. */
export const REELS_ORBIT = {
  RADIUS: 215,
  /** Passive autoplay: hold on each reel before stepping (longer = fewer cold starts). */
  IDLE_HOLD_MS: 9000,
  /** After the user drags the dial, wait longer before auto-advancing again. */
  ENGAGE_HOLD_MS: 11000,
  /** How long after last interaction the extended hold stays active. */
  ENGAGE_GRACE_MS: 45000,
  /** Ring rotation duration when stepping to the next reel. */
  STEP_MS: 1200,
  DAMP: 0.94,
  DRAG_SENS: 0.35,
  VEL_CLAMP: 28,
  SNAP_LERP: 0.15,
  VEL_STOP: 0.35,
  ORBITER_W: 90,
  ORBITER_H: 160,
  FOCUS_W: 148,
  FOCUS_H: 264,
  FOCUS_Z_BOOST: 42,
  WORLD_ROTATE_X_DEG: 14,
  RING_GUIDE_SIZE: 430,
  PERSPECTIVE: 1000,
} as const

/** @deprecated use IDLE_HOLD_MS */
export const HOLD_MS = REELS_ORBIT.IDLE_HOLD_MS

export function resolveHoldMs(lastEngageAt: number, now = performance.now()): number {
  if (lastEngageAt > 0 && now - lastEngageAt < REELS_ORBIT.ENGAGE_GRACE_MS) {
    return REELS_ORBIT.ENGAGE_HOLD_MS
  }
  return REELS_ORBIT.IDLE_HOLD_MS
}
