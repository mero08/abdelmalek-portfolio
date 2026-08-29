import { forwardRef, memo, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type Ref } from 'react'
import { ReelsFocusPlayer } from './ReelsFocusPlayer'
import styles from './Reels.module.css'

type ReelsOrbitPhoneProps = {
  reelId: string
  cover: string
  title: string
  isCenter: boolean
  muxPlaybackId: string
  playing: boolean
  hiddenForExpand?: boolean
  registerPhone: (index: number, node: HTMLDivElement | null) => void
  orbitIndex: number
  onCenterActivate?: (event: ReactPointerEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => void
  onCenterPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void
  onCenterPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void
}

export const ReelsOrbitPhone = memo(
  forwardRef(function ReelsOrbitPhone(
    {
      reelId,
      cover,
      title,
      isCenter,
      muxPlaybackId,
      playing,
      hiddenForExpand = false,
      registerPhone,
      orbitIndex,
      onCenterActivate,
      onCenterPointerDown,
      onCenterPointerUp,
    }: ReelsOrbitPhoneProps,
    ref: Ref<HTMLDivElement>,
  ) {
    const [playbackActive, setPlaybackActive] = useState(false)

    const bindRef = (node: HTMLDivElement | null) => {
      registerPhone(orbitIndex, node)
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    return (
      <div
        ref={bindRef}
        className={`${styles.phone} ${isCenter ? styles.phoneCenter : ''} ${
          hiddenForExpand ? styles.phoneHiddenFocus : ''
        } ${playbackActive ? styles.phonePlaying : ''}`}
        aria-hidden={!isCenter}
        onPointerDown={isCenter ? onCenterPointerDown : undefined}
        onPointerUp={isCenter ? onCenterPointerUp : undefined}
        onClick={
          isCenter
            ? (event) => {
                event.stopPropagation()
                onCenterActivate?.(event)
              }
            : undefined
        }
      >
        {isCenter ? (
          <>
            <ReelsFocusPlayer
              key={reelId}
              playbackId={muxPlaybackId}
              title={title}
              poster={cover}
              playing={playing}
              onPlaybackActiveChange={setPlaybackActive}
            />
            <span className={styles.playRing} aria-hidden />
          </>
        ) : (
          <img src={cover} alt="" loading="lazy" decoding="async" draggable={false} fetchPriority="low" />
        )}
      </div>
    )
  }),
)
