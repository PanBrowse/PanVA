export const isMobile = (): boolean =>
  window.matchMedia('(max-device-width: 960px)').matches

export const isHighDPI = (): boolean =>
  window.matchMedia(
    '(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
  ).matches
