import { describe, expect, it } from 'vitest'
import { muxThumbnailUrl } from './mux'

describe('muxThumbnailUrl', () => {
  it('builds a vertical thumbnail URL from the playback id', () => {
    const url = muxThumbnailUrl('abc123')
    expect(url).toContain('https://image.mux.com/abc123/thumbnail.webp')
    expect(url).toContain('width=360')
    expect(url).toContain('height=640')
    expect(url).toContain('fit_mode=smartcrop')
  })
})
