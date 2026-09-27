import { CI360Viewer } from '@cloudimage/360-view/react'
import '@cloudimage/360-view/css'

interface SpinViewerProps {
  urls: string[]
}

export function SpinViewer({ urls }: SpinViewerProps) {
  if (urls.length < 2) {
    return (
      <p className="dash-empty">
        360 baxış üçün ən azı 2 şəkil lazımdır.
      </p>
    )
  }

  return (
    <CI360Viewer
      key={urls.join('|')}
      imageListX={urls}
      amountX={urls.length}
      dragSpeed={100}
      aspectRatio="1/1"
      hide360Logo={false}
      style={{ width: '100%', maxWidth: 560 }}
    />
  )
}
